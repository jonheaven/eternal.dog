import { Request, Response } from 'express';
import TempUpload from '../models/TempUpload.model';
import Event from '../models/Event.model';
import { withRequest } from '../utils/logger';
import { NotificationService } from '../services/notification.service';

export class UploadController {
  private notificationService = new NotificationService();

  async uploadPreview(req: Request, res: Response): Promise<void> {
    try {
      const { image, text, userId, utmSource, utmCampaign, utmMedium, utmContent } = req.body;
      const rid = (req as any).requestId as string | undefined;
      const log = rid ? withRequest({ requestId: rid }) : undefined;
      const campaign = utmSource || 'direct';
      log?.info(`[UPLOAD] Received preview for userId=${userId} campaign=${campaign}`);

      // Validation
      if (!image || !text || !userId) {
        res
          .status(400)
          .json({ error: 'Missing required fields: image, text, userId' });
        return;
      }

      if (typeof text !== 'string' || text.length > 100) {
        res.status(400).json({ error: 'Text must be 1-100 characters' });
        return;
      }

      if (typeof userId !== 'string') {
        res.status(400).json({ error: 'Invalid userId' });
        return;
      }

      // Set expiry to 24 hours
      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      );

      // Save to MongoDB
      await TempUpload.create({
        userId,
        image: Buffer.from(image, 'base64'),
        text,
        expiresAt,
      });

      log?.info(`[UPLOAD] Preview saved for userId=${userId} expiresAt=${expiresAt.toISOString()}`);
      res.json({ success: true, userId });

      // Log event and notify with campaign tracking
      await Event.create({
        type: 'upload',
        userId,
        utmSource: utmSource || 'direct',
        utmCampaign: utmCampaign || 'organic',
        utmMedium: utmMedium || 'organic',
        utmContent: utmContent,
        metadata: { text },
      });
      await this.notificationService.notifyUploadPreview(userId, utmSource || 'direct');
    } catch (error) {
      const rid = (req as any).requestId as string | undefined;
      const log = rid ? withRequest({ requestId: rid }) : undefined;
      const userId = req.body?.userId;
      const { utmSource } = req.body;
      log?.error(`[UPLOAD] Error: ${(error as any)?.message || error}`);
      if (userId) {
        await Event.create({
          type: 'error',
          userId,
          utmSource: utmSource || 'direct',
          metadata: { context: 'upload', error: String(error) },
        });
        await this.notificationService.notifyError(
          'upload',
          userId,
          (error as any)?.message || String(error),
          utmSource,
        );
      }
      if (userId) {
        await Event.create({ type: 'error', userId, metadata: { context: 'upload', error: String(error) } });
        await this.notificationService.notifyError('upload', userId, (error as any)?.message || String(error));
      }
      res
        .status(500)
        .json({ error: 'Failed to save preview' });
    }
  }
}
