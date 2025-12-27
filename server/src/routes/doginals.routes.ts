import { Router, Request, Response } from 'express';
import Doginal from '../models/Doginal.model.js';
import { withRequest } from '../utils/logger.js';

const router = Router();

/**
 * GET /doginals
 * Returns all public inscribed dogs for the gallery
 * Supports search and pagination
 * Privacy-aware: does not expose user emails or wallet addresses
 */
router.get('/doginals', async (req: Request, res: Response) => {
  try {
    const rid = (req as any).requestId as string | undefined;
    const log = rid ? withRequest({ requestId: rid }) : undefined;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const skip = (page - 1) * limit;

    log?.info(`[DOGINALS] Fetching gallery - page: ${page}, limit: ${limit}, search: ${search}`);

    // Build query - only public dogs
    const query: any = { isPublic: true };
    
    // Add search filter if provided
    if (search && search.trim().length >= 2) {
      query.$or = [
        { dogName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const totalCount = await Doginal.countDocuments(query);

    // Get doginals with pagination
    const doginals = await Doginal.find(query)
      .select(['inscriptionId', 'ipfsCid', 'badgeIpfsCid', 'txid', 'createdAt', 'dogName', 'description', 'dates'])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform for frontend
    const dogs = doginals.map(dog => ({
      id: dog._id?.toString() || dog.inscriptionId,
      name: dog.dogName || 'Eternal Dog',
      description: dog.description,
      dates: dog.dates,
      imageUrl: dog.ipfsCid ? `https://ipfs.io/ipfs/${dog.ipfsCid}` : undefined,
      mintDate: dog.createdAt?.toString() || new Date().toISOString(),
      inscriptionId: dog.inscriptionId,
      explorerUrl: dog.txid ? `https://dogechain.info/tx/${dog.txid}` : undefined
    }));

    log?.info(`[DOGINALS] Found ${dogs.length} of ${totalCount} inscriptions`);
    
    res.json({
      success: true,
      dogs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    const rid = (req as any).requestId as string | undefined;
    const log = rid ? withRequest({ requestId: rid }) : undefined;
    log?.error(`[DOGINALS] Error: ${(error as any)?.message || error}`);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

/**
 * GET /doginals/stats
 * Returns gallery statistics
 */
router.get('/doginals/stats', async (req: Request, res: Response) => {
  try {
    const totalDogs = await Doginal.countDocuments({ isPublic: true });
    const totalInscribed = await Doginal.countDocuments({});
    const recentDogs = await Doginal.countDocuments({
      isPublic: true,
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    });
    const publicPercentage = totalInscribed > 0 ? Math.round((totalDogs / totalInscribed) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalDogs,
        totalInscribed,
        recentDogs,
        publicPercentage
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
