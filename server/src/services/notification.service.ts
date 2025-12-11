import { logger, withRequest } from '../utils/logger';

export class NotificationService {
  async notifySlack(message: string, metadata?: Record<string, any>): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      logger.debug('[SLACK] No webhook configured, skipping notification');
      return;
    }

    try {
      const payload = {
        text: message,
        mrkdwn: true,
        ...(metadata && {
          fields: Object.entries(metadata).map(([key, value]) => ({
            title: key,
            value: String(value),
            short: true,
          })),
        }),
      };

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        logger.warn(`[SLACK] Notification failed: ${res.status}`);
      } else {
        logger.debug('[SLACK] Notification sent');
      }
    } catch (error) {
      logger.error(`[SLACK] Error sending notification: ${(error as any)?.message || error}`);
    }
  }

  async notifyUploadPreview(userId: string, campaign: string = 'direct'): Promise<void> {
    await this.notifySlack(
      '🐶 *New Preview Upload*\nDog photo uploaded and ready for immortalization',
      { userId, campaign, timestamp: new Date().toISOString() },
    );
  }

  async notifyCheckoutStarted(userId: string, email: string, campaign: string = 'direct'): Promise<void> {
    await this.notifySlack(
      '💳 *Checkout Started*\nPayment flow initiated for $14.20',
      { userId, email, campaign, timestamp: new Date().toISOString() },
    );
  }

  async notifyInscriptionComplete(userId: string, email: string, inscriptionId: string, walletAddress: string, campaign: string = 'direct'): Promise<void> {
    await this.notifySlack(
      '✅ *Inscription Complete*\nDog immortalized on Dogecoin blockchain! User wallet has been sent $4.20 DOGE.',
      { userId, email, campaign, inscriptionId, walletAddress, timestamp: new Date().toISOString() },
    );
  }

  async notifyError(context: string, userId: string, error: string, campaign: string = 'direct'): Promise<void> {
    await this.notifySlack(
      `❌ *Error in ${context}*\n\`\`\`${error}\`\`\``,
      { userId, campaign, timestamp: new Date().toISOString() },
    );
  }
}
