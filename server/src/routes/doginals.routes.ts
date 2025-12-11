import { Router, Request, Response } from 'express';
import Doginal from '../models/Doginal.model';
import { withRequest } from '../utils/logger';

const router = Router();

/**
 * GET /doginals
 * Returns all inscribed dogs for the gallery
 * Privacy-aware: does not expose user emails
 */
router.get('/doginals', async (req: Request, res: Response) => {
  try {
    const rid = (req as any).requestId as string | undefined;
    const log = rid ? withRequest({ requestId: rid }) : undefined;

    log?.info('[DOGINALS] Fetching gallery');

    // Get all doginals, newest first
    const doginals = await Doginal.find({})
      .select(['inscriptionId', 'ipfsCid', 'txid', 'createdAt'])
      .sort({ createdAt: -1 })
      .lean();

    log?.info(`[DOGINALS] Found ${doginals.length} inscriptions`);
    res.json(doginals);
  } catch (error) {
    const rid = (req as any).requestId as string | undefined;
    const log = rid ? withRequest({ requestId: rid }) : undefined;
    log?.error(`[DOGINALS] Error: ${(error as any)?.message || error}`);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

export default router;
