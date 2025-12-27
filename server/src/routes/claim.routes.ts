import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Doginal from '../models/Doginal.model.js';
import { withRequest } from '../utils/logger.js';

const router = Router();

/**
 * GET /claim/:uuid - Get claim data
 */
router.get('/:uuid', async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    const rid = (req as any).requestId as string | undefined;
    const log = rid ? withRequest({ requestId: rid }) : undefined;

    log?.info(`[CLAIM] Fetching claim data for uuid=${uuid}`);

    const dog = await Doginal.findOne({ claimUuid: uuid });

    if (!dog) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Check if claim has expired
    if (dog.claimExpiryDate && new Date() > dog.claimExpiryDate) {
      return res.status(410).json({ error: 'Claim has expired' });
    }

    // Return claim data (without sensitive information)
    const claimData = {
      id: dog._id?.toString(),
      dogName: dog.dogName || 'Eternal Dog',
      inscriptionId: dog.inscriptionId,
      walletAddress: dog.walletAddress,
      imageIpfsHash: dog.ipfsCid,
      description: dog.description,
      dates: dog.dates,
      isPublic: dog.isPublic || true,
      claimed: dog.claimed || false,
      expiryDate: dog.claimExpiryDate,
      tagInscriptionId: dog.tagInscriptionId,
      inscriptionsComplete: {
        photo: !!dog.inscriptionId,
        badge: !!dog.badgeIpfsCid,
        tag: !!dog.tagInscriptionId
      }
    };

    log?.info(`[CLAIM] Claim data retrieved for dog=${claimData.dogName}`);
    res.json(claimData);
  } catch (error: any) {
    const rid = (req as any).requestId as string | undefined;
    const log = rid ? withRequest({ requestId: rid }) : undefined;
    log?.error(`[CLAIM] Error fetching claim: ${error.message || error}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /claim/:uuid/details - Update dog details and optionally inscribe tag
 */
router.patch('/:uuid/details', async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    const { description, dates, isPublic } = req.body;
    const rid = (req as any).requestId as string | undefined;
    const log = rid ? withRequest({ requestId: rid }) : undefined;

    log?.info(`[CLAIM] Updating details for uuid=${uuid}`);

    const dog = await Doginal.findOne({ claimUuid: uuid });

    if (!dog) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Check if claim has expired
    if (dog.claimExpiryDate && new Date() > dog.claimExpiryDate && !dog.claimed) {
      return res.status(410).json({ error: 'Claim has expired - claim wallet first' });
    }

    // Update dog details
    await Doginal.updateOne(
      { claimUuid: uuid },
      {
        $set: {
          description: description || dog.description,
          dates: dates || dog.dates,
          isPublic: isPublic !== undefined ? isPublic : dog.isPublic
        }
      }
    );

    log?.info(`[CLAIM] Details updated for uuid=${uuid}`);

    res.json({
      success: true,
      message: 'Details updated successfully',
      tagInscribed: false // Tag inscription not implemented yet
    });
  } catch (error: any) {
    const rid = (req as any).requestId as string | undefined;
    const log = rid ? withRequest({ requestId: rid }) : undefined;
    log?.error(`[CLAIM] Error updating details: ${error.message || error}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /claim/:uuid/claim - Mark wallet as claimed
 * Note: In the new system, wallet credentials are already sent via email,
 * but this endpoint allows users to mark the wallet as "claimed" for tracking
 */
router.post('/:uuid/claim', async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    const rid = (req as any).requestId as string | undefined;
    const log = rid ? withRequest({ requestId: rid }) : undefined;

    log?.info(`[CLAIM] Marking wallet as claimed for uuid=${uuid}`);

    const dog = await Doginal.findOne({ claimUuid: uuid });

    if (!dog) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    if (dog.claimed) {
      return res.status(400).json({ error: 'Wallet already claimed' });
    }

    // Check if claim has expired
    if (dog.claimExpiryDate && new Date() > dog.claimExpiryDate) {
      return res.status(410).json({ error: 'Claim has expired' });
    }

    // Mark as claimed
    await Doginal.updateOne(
      { claimUuid: uuid },
      { $set: { claimed: true } }
    );

    log?.info(`[CLAIM] Wallet marked as claimed for uuid=${uuid}`);

    res.json({
      success: true,
      walletAddress: dog.walletAddress,
      message: 'Wallet marked as claimed'
    });
  } catch (error: any) {
    const rid = (req as any).requestId as string | undefined;
    const log = rid ? withRequest({ requestId: rid }) : undefined;
    log?.error(`[CLAIM] Error claiming wallet: ${error.message || error}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

