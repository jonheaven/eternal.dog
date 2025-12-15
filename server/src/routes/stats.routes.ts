import { Router, Request, Response } from 'express';
import Event from '../models/Event.model.js';
import { withRequest } from '../utils/logger.js';

const router = Router();

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const rid = (req as any).requestId as string | undefined;
    const log = rid ? withRequest({ requestId: rid }) : undefined;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await Event.find({ createdAt: { $gte: today } });

    // Overall stats
    const stats = {
      total: events.length,
      uploads: events.filter((e) => e.type === 'upload').length,
      checkouts: events.filter((e) => e.type === 'checkout_started').length,
      inscriptions: events.filter((e) => e.type === 'inscription_complete').length,
      errors: events.filter((e) => e.type === 'error').length,
      uniqueUsers: new Set(events.map((e) => e.userId).filter(Boolean)).size,
      revenue: events.filter((e) => e.type === 'inscription_complete').length * 14.2,
    };

    // Breakdown by campaign source
    const byCampaign: Record<string, any> = {};
    events.forEach((event) => {
      const source = event.utmSource || 'direct';
      if (!byCampaign[source]) {
        byCampaign[source] = {
          uploads: 0,
          checkouts: 0,
          inscriptions: 0,
          completionRate: '0%',
          revenue: 0,
        };
      }
      if (event.type === 'upload') byCampaign[source].uploads++;
      if (event.type === 'checkout_started') byCampaign[source].checkouts++;
      if (event.type === 'inscription_complete') byCampaign[source].inscriptions++;
    });

    // Calculate completion rates
    Object.keys(byCampaign).forEach((source) => {
      const uploads = byCampaign[source].uploads || 1;
      const rate = ((byCampaign[source].inscriptions / uploads) * 100).toFixed(1);
      byCampaign[source].completionRate = `${rate}%`;
      byCampaign[source].revenue = byCampaign[source].inscriptions * 14.2;
    });

    log?.info(`[STATS] Daily stats retrieved: ${JSON.stringify(stats)}`);
    res.json({ ...stats, byCampaign });
  } catch (error) {
    const rid = (req as any).requestId as string | undefined;
    const log = rid ? withRequest({ requestId: rid }) : undefined;
    log?.error(`[STATS] Error: ${(error as any)?.message || error}`);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
