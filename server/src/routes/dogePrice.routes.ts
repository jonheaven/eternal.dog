import { Router } from 'express';
import dogePriceService from '../services/dogePrice.service.js';

const router = Router();

/**
 * GET /doge-price - Get current DOGE price and $4.20 calculation
 */
router.get('/', async (req, res) => {
  try {
    const dogeAmount = await dogePriceService.getDogeAmountFor420();
    const formatted = await dogePriceService.getFormattedDogeAmount();
    
    res.json({
      success: true,
      dogeAmount: dogeAmount.dogeAmount,
      dogePrice: dogeAmount.dogePrice,
      usdValue: dogeAmount.usdValue,
      display: formatted.display,
      shortDisplay: formatted.shortDisplay,
      cacheStatus: dogePriceService.getCacheStatus()
    });

  } catch (error: any) {
    console.error('Error getting DOGE price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DOGE price',
      fallback: {
        dogeAmount: 15.56,
        dogePrice: 0.27,
        usdValue: 4.20,
        display: '~15.56 DOGE (~$0.27/DOGE)',
        shortDisplay: '~15.56 DOGE (~$4.20)'
      }
    });
  }
});

/**
 * GET /doge-price/refresh - Force refresh DOGE price
 */
router.get('/refresh', async (req, res) => {
  try {
    const newPrice = await dogePriceService.refreshPrice();
    const dogeAmount = await dogePriceService.getDogeAmountFor420();
    const formatted = await dogePriceService.getFormattedDogeAmount();
    
    res.json({
      success: true,
      message: 'DOGE price refreshed',
      dogeAmount: dogeAmount.dogeAmount,
      dogePrice: dogeAmount.dogePrice,
      usdValue: dogeAmount.usdValue,
      display: formatted.display,
      shortDisplay: formatted.shortDisplay
    });

  } catch (error: any) {
    console.error('Error refreshing DOGE price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh DOGE price'
    });
  }
});

export default router;

