import { Request, Response } from 'express';
import Stripe from 'stripe';
import TempUpload from '../models/TempUpload.model';
import Doginal from '../models/Doginal.model';
import { DogecoinService } from '../services/dogecoin.service';
import { IPFSService } from '../services/ipfs.service';
import { EmailService } from '../services/email.service';
import { NotificationService } from '../services/notification.service';
import { withRequest } from '../utils/logger';
import Event from '../models/Event.model';
import { retryService } from '../services/RetryService';

export class PaymentController {
  private stripe: Stripe;
  private dogecoinService: DogecoinService;
  private ipfsService: IPFSService;
  private emailService: EmailService;
  private notificationService: NotificationService;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      // Use latest API version
    });
    this.dogecoinService = new DogecoinService();
    this.ipfsService = new IPFSService();
    this.emailService = new EmailService();
    this.notificationService = new NotificationService();
  }

  async createCheckoutSession(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { userId, email, utmSource, utmCampaign, utmMedium, utmContent } = req.body;
      const rid = (req as any).requestId as string | undefined;
      const log = rid ? withRequest({ requestId: rid }) : undefined;
      const campaign = utmSource || 'direct';

      if (!userId || !email) {
        res
          .status(400)
          .json({ error: 'Missing userId or email' });
        return;
      }

      // Verify temp upload exists
      const tempUpload = await TempUpload.findOne({ userId });
      if (!tempUpload) {
        res.status(404).json({
          error: 'Upload not found. Please upload again.',
        });
        return;
      }

      log?.info(
        `[PAYMENT] Creating checkout session for userId=${userId} campaign=${campaign}`,
      );

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Immortalize Your Dog on Dogecoin',
                description:
                  '512x512 image + 100-char memory inscribed on blockchain',
              },
              unit_amount: 1420, // $14.20
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/preview`,
        metadata: {
          userId,
          email,
          utmSource: utmSource || 'direct',
          utmCampaign: utmCampaign || 'organic',
          utmMedium: utmMedium || 'organic',
        },
      } as any);

      log?.info(`[PAYMENT] Stripe session created sessionId=${session.id}`);
      res.json({ sessionId: session.id });

      // Log event and notify with campaign tracking
      await Event.create({
        type: 'checkout_started',
        userId,
        email,
        utmSource: utmSource || 'direct',
        utmCampaign: utmCampaign || 'organic',
        utmMedium: utmMedium || 'organic',
        utmContent: utmContent,
        metadata: { sessionId: session.id },
      });
      await this.notificationService.notifyCheckoutStarted(
        userId,
        email,
        campaign,
      );
    } catch (error) {
      const rid = (req as any).requestId as string | undefined;
      const log = rid ? withRequest({ requestId: rid }) : undefined;
      log?.error(
        `[PAYMENT] Error creating checkout: ${(error as any)?.message || error}`,
      );
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;

    try {
      const event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, email, utmSource, utmCampaign, utmMedium } = session.metadata!;
        const campaign = utmSource || 'direct';

        const rid = (req as any).requestId as string | undefined;
        const log = rid ? withRequest({ requestId: rid }) : undefined;
        log?.info(
          `[WEBHOOK] Payment completed userId=${userId} session=${session.id} campaign=${campaign}`,
        );

        // Retrieve temp upload
        const tempUpload = await TempUpload.findOne({ userId });
        if (!tempUpload) {
          log?.error(`[WEBHOOK] Temp upload not found userId=${userId}`);
          res.status(400).json({ error: 'Temp upload not found' });
          return;
        }

        const { image, text } = tempUpload;

        // Resolve managed Dogecoin address (fail fast if missing)
        let recipientAddress: string;
        try {
          recipientAddress = this.dogecoinService.getManagedRecipientAddress();
        } catch (addrErr) {
          const message = (addrErr as any)?.message || String(addrErr);
          log?.error(`[WEBHOOK] Missing managed wallet address: ${message}`);
          res.status(500).json({ error: 'Managed wallet address not configured' });
          return;
        }

        try {
          // Inscribe full image on Dogecoin blockchain with retry logic
          log?.info(`[WEBHOOK] Starting inscription for userId=${userId}`);
          const inscriptionResult = await retryService.executeWithRetry(
            () => this.dogecoinService.inscribeFullImage(
              image,
              text,
              recipientAddress,
            ),
            'inscribeFullImage',
            rid,
          );
          const inscriptionId = inscriptionResult.inscriptionId;
          const txid = inscriptionResult.txid;

          log?.info(
            `[WEBHOOK] Inscription complete inscriptionId=${inscriptionId} txid=${txid}`,
          );

          // Upload image to IPFS for fast retrieval with retry logic
          log?.info(`[WEBHOOK] Uploading to IPFS`);
          const ipfsCid = await retryService.executeWithRetry(
            () => this.ipfsService.uploadImage(image),
            'uploadImage',
            rid,
          );
          log?.info(`[WEBHOOK] IPFS upload complete ipfsCid=${ipfsCid}`);

          // Create wallet and send DOGE reward with retry logic
          log?.info(`[WEBHOOK] Creating wallet and sending DOGE reward`);
          const walletAddress = await retryService.executeWithRetry(
            () => this.dogecoinService.createWallet(),
            'createWallet',
            rid,
          );
          await retryService.executeWithRetry(
            () => this.dogecoinService.sendDoge(walletAddress, 4.2),
            'sendDoge',
            rid,
          );
          log?.info(`[WEBHOOK] Wallet created and DOGE sent to ${walletAddress}`);

          // Save Doginal metadata with full inscription details
          await Doginal.create({
            inscriptionId,
            ipfsCid,
            walletAddress,
            userEmail: email,
            imageSize: image.length,
            chunks: inscriptionResult.chunks,
            txid,
          });

          // Send email with wallet and image badge
          const badgeUrl = `https://ipfs.io/ipfs/${ipfsCid}`;
          await this.emailService.sendWalletEmail(email, walletAddress, badgeUrl);

          // Clean up temp upload
          await TempUpload.deleteOne({ userId });

          // Log successful inscription event
          await Event.create({
            type: 'inscription_complete',
            userId,
            email,
            utmSource: utmSource || 'direct',
            utmCampaign: utmCampaign || 'organic',
            utmMedium: utmMedium || 'organic',
            metadata: {
              inscriptionId,
              txid,
              ipfsCid,
              walletAddress,
              imageSize: image.length,
              chunks: inscriptionResult.chunks,
            },
          });

          // Notify via Slack
          await this.notificationService.notifyInscriptionComplete(
            userId,
            email,
            inscriptionId,
            walletAddress,
            campaign,
          );

          log?.info(
            `[WEBHOOK] Inscription workflow complete userId=${userId} ` +
              `inscriptionId=${inscriptionId} walletAddress=${walletAddress}`,
          );
        } catch (inscriptionError) {
          log?.error(
            `[WEBHOOK] Inscription error: ${(inscriptionError as any)?.message || inscriptionError}`,
          );

          // Log error event
          await Event.create({
            type: 'error',
            userId,
            email,
            utmSource: utmSource || 'direct',
            utmCampaign: utmCampaign || 'organic',
            utmMedium: utmMedium || 'organic',
            metadata: {
              context: 'inscription',
              error: String(inscriptionError),
            },
          });

          // Notify of error
          await this.notificationService.notifyError(
            'inscription',
            userId,
            (inscriptionError as any)?.message || String(inscriptionError),
            campaign,
          );

          // Still mark as error in response but don't fail webhook
          // (Stripe expects 200 for successful webhook processing)
          log?.error(
            `[WEBHOOK] Inscription failed but webhook processed userId=${userId}`,
          );
        }
      }

      res.json({ received: true });
    } catch (error) {
      const rid = (req as any).requestId as string | undefined;
      const log = rid ? withRequest({ requestId: rid }) : undefined;
      log?.error(`[WEBHOOK] Webhook error: ${(error as any)?.message || error}`);

      // Try to extract metadata for error tracking
      try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const metadata = (body?.data?.object as any)?.metadata;
        if (metadata?.userId) {
          await Event.create({
            type: 'error',
            userId: metadata.userId,
            email: metadata.email,
            utmSource: metadata.utmSource || 'direct',
            utmCampaign: metadata.utmCampaign || 'organic',
            metadata: {
              context: 'webhook_processing',
              error: String(error),
            },
          });
          await this.notificationService.notifyError(
            'webhook',
            metadata.userId,
            (error as any)?.message || String(error),
            metadata.utmSource || 'direct',
          );
        }
      } catch (e) {
        log?.debug(`Could not extract metadata from webhook error: ${e}`);
      }

      res.status(400).json({ error: 'Webhook error' });
    }
  }
}
