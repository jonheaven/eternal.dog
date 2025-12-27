import { Request, Response } from 'express';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import TempUpload from '../models/TempUpload.model.js';
import Doginal from '../models/Doginal.model.js';
import { DogecoinService } from '../services/dogecoin.service.js';
import { IPFSService } from '../services/ipfs.service.js';
import { EmailService } from '../services/email.service.js';
import { NotificationService } from '../services/notification.service.js';
import { withRequest } from '../utils/logger.js';
import Event from '../models/Event.model.js';
import { retryService } from '../services/RetryService.js';
import { env } from '../config/env.js';

export class PaymentController {
  private stripe: Stripe;
  private dogecoinService: DogecoinService;
  private ipfsService: IPFSService;
  private emailService: EmailService;
  private notificationService: NotificationService;

  constructor() {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });
    this.dogecoinService = new DogecoinService();
    this.ipfsService = new IPFSService();
    this.emailService = new EmailService();
    this.notificationService = new NotificationService();
  }

  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      const { userId, email, utmSource, utmCampaign, utmMedium, utmContent } =
        req.body;
      const rid = (req as any).requestId as string | undefined;
      const log = rid ? withRequest({ requestId: rid }) : undefined;
      const campaign = utmSource || 'direct';

      if (!userId || !email) {
        res.status(400).json({ error: 'Missing userId or email' });
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
        `[PAYMENT] Creating checkout session for userId=${userId} campaign=${campaign}`
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
        locale: 'en',
        success_url: `${env.FRONTEND_URL}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.FRONTEND_URL}/preview`,
        metadata: {
          userId,
          email,
          utmSource: utmSource || 'direct',
          utmCampaign: utmCampaign || 'organic',
          utmMedium: utmMedium || 'organic',
        },
      });

      log?.info(`[PAYMENT] Stripe session created sessionId=${session.id}`);
      res.json({
        sessionId: session.id,
        sessionUrl: session.url,
      });

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
        campaign
      );
    } catch (error) {
      const rid = (req as any).requestId as string | undefined;
      const log = rid ? withRequest({ requestId: rid }) : undefined;
      log?.error(
        `[PAYMENT] Error creating checkout: ${(error as any)?.message || error}`
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
        env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, email, utmSource, utmCampaign, utmMedium } =
          session.metadata!;
        const campaign = utmSource || 'direct';

        const rid = (req as any).requestId as string | undefined;
        const log = rid ? withRequest({ requestId: rid }) : undefined;
        log?.info(
          `[WEBHOOK] Payment completed userId=${userId} session=${session.id} campaign=${campaign}`
        );

        // Retrieve temp upload
        const tempUpload = await TempUpload.findOne({ userId });
        if (!tempUpload) {
          log?.error(`[WEBHOOK] Temp upload not found userId=${userId}`);
          res.status(400).json({ error: 'Temp upload not found' });
          return;
        }

        const { image, text } = tempUpload;

        try {
          // Generate recipient wallet first (before inscribing)
          // This returns address, mnemonic, and privateKey - we must deliver mnemonic/privateKey to user securely
          log?.info(`[WEBHOOK] Generating recipient wallet`);
          const wallet = await retryService.executeWithRetry(
            () => this.dogecoinService.createWallet(),
            'createWallet',
            rid
          );
          log?.info(`[WEBHOOK] Generated wallet address: ${wallet.address}`);
          // NOTE: Never log wallet.mnemonic or wallet.privateKey - these are sensitive!

          // Inscribe full image on Dogecoin blockchain with retry logic
          // The inscription includes sending $4.20 USD worth of DOGE to the recipient in the final reveal tx
          log?.info(`[WEBHOOK] Starting inscription for userId=${userId}, recipient=${wallet.address}`);
          const inscriptionResult = await retryService.executeWithRetry(
            () =>
              this.dogecoinService.inscribeFullImage(
                image,
                text,
                wallet.address // Recipient gets the inscribed UTXO + $4.20 USD worth of DOGE
              ),
            'inscribeFullImage',
            rid
          );
          const inscriptionId = inscriptionResult.inscriptionId;
          const txid = inscriptionResult.txid;

          log?.info(
            `[WEBHOOK] Inscription complete inscriptionId=${inscriptionId} txid=${txid}`
          );

          // Generate DOGE ID badge image
          log?.info(`[WEBHOOK] Generating DOGE ID badge`);
          const { generateDogeIdBadge } = await import('../services/badge.service.js');
          const badgeBuffer = await generateDogeIdBadge(image, {
            dogName: text,
            issuedDate: new Date().toISOString(),
            expiryDate: '♾️', // ETERNAL!
          });
          log?.info(`[WEBHOOK] Badge generated: ${badgeBuffer.length} bytes`);

          // Upload original image to IPFS for fast retrieval with retry logic
          log?.info(`[WEBHOOK] Uploading original image to IPFS`);
          const ipfsCid = await retryService.executeWithRetry(
            () => this.ipfsService.uploadImage(image),
            'uploadImage',
            rid
          );
          log?.info(`[WEBHOOK] IPFS upload complete ipfsCid=${ipfsCid}`);

          // Upload badge to IPFS
          log?.info(`[WEBHOOK] Uploading badge to IPFS`);
          const badgeIpfsCid = await retryService.executeWithRetry(
            () => this.ipfsService.uploadImage(badgeBuffer),
            'uploadBadge',
            rid
          );
          log?.info(`[WEBHOOK] Badge IPFS upload complete badgeIpfsCid=${badgeIpfsCid}`);

          // Generate claim UUID and set expiry date (30 days)
          const claimUuid = uuidv4();
          const claimExpiryDate = new Date();
          claimExpiryDate.setDate(claimExpiryDate.getDate() + 30); // 30 days from now

          // Save Doginal metadata with full inscription details
          // IMPORTANT: We only store the wallet address, NOT the mnemonic or privateKey
          // The mnemonic/privateKey are only sent via email to the user
          await Doginal.create({
            inscriptionId,
            ipfsCid,
            badgeIpfsCid, // DOGE ID badge IPFS CID
            walletAddress: wallet.address, // Only store address, never mnemonic/privateKey
            userEmail: email,
            dogName: text.substring(0, 50) || 'Eternal Dog', // Extract dog name from text
            description: text,
            isPublic: true, // Default to public
            imageSize: image.length,
            chunks: inscriptionResult.chunks,
            txid,
            claimUuid,
            claimExpiryDate,
            claimed: false, // Wallet will be claimed when user accesses claim link
          });

          // Send email with wallet credentials and DOGE ID badge
          // This email contains the sensitive mnemonic and privateKey - user must save this securely
          const badgeUrl = `https://ipfs.io/ipfs/${badgeIpfsCid}`;
          await this.emailService.sendWalletEmail(
            email,
            wallet.address,
            badgeUrl,
            wallet.mnemonic, // Seed phrase - user needs this to import wallet
            wallet.privateKey, // Private key - user needs this to import wallet
            claimUuid // Include claim UUID for claim page access
          );
          log?.info(`[WEBHOOK] Wallet credentials sent to ${email} (mnemonic/privateKey not stored in database)`);

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
              badgeIpfsCid,
              walletAddress: wallet.address,
              imageSize: image.length,
              chunks: inscriptionResult.chunks,
            },
          });

          // Notify via Slack
          await this.notificationService.notifyInscriptionComplete(
            userId,
            email,
            inscriptionId,
            wallet.address,
            campaign
          );

          log?.info(
            `[WEBHOOK] Inscription workflow complete userId=${userId} ` +
              `inscriptionId=${inscriptionId} walletAddress=${wallet.address}`
          );
        } catch (inscriptionError) {
          log?.error(
            `[WEBHOOK] Inscription error: ${(inscriptionError as any)?.message || inscriptionError}`
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
            campaign
          );

          // Still mark as error in response but don't fail webhook
          // (Stripe expects 200 for successful webhook processing)
          log?.error(
            `[WEBHOOK] Inscription failed but webhook processed userId=${userId}`
          );
        }
      }

      res.json({ received: true });
    } catch (error) {
      const rid = (req as any).requestId as string | undefined;
      const log = rid ? withRequest({ requestId: rid }) : undefined;
      log?.error(
        `[WEBHOOK] Webhook error: ${(error as any)?.message || error}`
      );

      // Try to extract metadata for error tracking
      try {
        const body =
          typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
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
            metadata.utmSource || 'direct'
          );
        }
      } catch (e) {
        log?.debug(`Could not extract metadata from webhook error: ${e}`);
      }

      res.status(400).json({ error: 'Webhook error' });
    }
  }
}
