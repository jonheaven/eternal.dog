import axios from 'axios';

class DogePriceService {
  private cache: {
    price: number;
    lastUpdated: number | null;
    cacheDuration: number;
  };

  constructor() {
    this.cache = {
      price: 0.27, // Default fallback price
      lastUpdated: null,
      cacheDuration: 5 * 60 * 1000 // 5 minutes
    };
  }

  /**
   * Get current DOGE price in USD
   */
  async getCurrentDogePrice(): Promise<number> {
    try {
      // Check if we have a recent cached price
      if (this.cache.lastUpdated && 
          (Date.now() - this.cache.lastUpdated) < this.cache.cacheDuration) {
        console.log(`DogePriceService: Using cached DOGE price: $${this.cache.price}`);
        return this.cache.price;
      }

      console.log('DogePriceService: Fetching fresh DOGE price...');
      
      // Try multiple APIs for reliability
      const apis = [
        'https://api.coingecko.com/api/v3/simple/price?ids=dogecoin&vs_currencies=usd',
        'https://api.binance.com/api/v3/ticker/price?symbol=DOGEUSDT',
        'https://api.coinbase.com/v2/exchange-rates?currency=DOGE'
      ];

      for (const api of apis) {
        try {
          const response = await axios.get(api, { timeout: 5000 });
          let price: number | null = null;

          if (api.includes('coingecko')) {
            price = response.data.dogecoin?.usd;
          } else if (api.includes('binance')) {
            price = parseFloat(response.data.price);
          } else if (api.includes('coinbase')) {
            price = parseFloat(response.data.data.rates.USD);
          }

          if (price && price > 0) {
            this.cache.price = price;
            this.cache.lastUpdated = Date.now();
            console.log(`DogePriceService: DOGE price updated: $${price} (from ${api})`);
            return price;
          }
        } catch (error: any) {
          console.log(`DogePriceService: API ${api} failed:`, error.message);
          continue;
        }
      }

      // If all APIs fail, use cached price or fallback
      console.log(`DogePriceService: All APIs failed, using fallback price: $${this.cache.price}`);
      return this.cache.price;

    } catch (error: any) {
      console.error('DogePriceService: Error fetching DOGE price:', error);
      return this.cache.price; // Return cached or fallback price
    }
  }

  /**
   * Calculate DOGE amount needed for $4.20
   */
  async getDogeAmountFor420(): Promise<{ dogeAmount: number; dogePrice: number; usdValue: number }> {
    try {
      const dogePrice = await this.getCurrentDogePrice();
      const dogeAmount = 4.20 / dogePrice;
      const roundedAmount = Math.round(dogeAmount * 100) / 100; // Round to 2 decimals
      
      console.log(`DogePriceService: $4.20 = ${roundedAmount} DOGE (at $${dogePrice}/DOGE)`);
      return {
        dogeAmount: roundedAmount,
        dogePrice: dogePrice,
        usdValue: 4.20
      };
    } catch (error: any) {
      console.error('DogePriceService: Error calculating DOGE amount:', error);
      // Fallback to default calculation
      const fallbackPrice = 0.27;
      const fallbackAmount = 4.20 / fallbackPrice;
      return {
        dogeAmount: Math.round(fallbackAmount * 100) / 100,
        dogePrice: fallbackPrice,
        usdValue: 4.20
      };
    }
  }

  /**
   * Get formatted DOGE amount string for display
   */
  async getFormattedDogeAmount(): Promise<{ amount: number; price: number; display: string; shortDisplay: string }> {
    try {
      const { dogeAmount, dogePrice } = await this.getDogeAmountFor420();
      return {
        amount: dogeAmount,
        price: dogePrice,
        display: `~${dogeAmount} DOGE (~$${dogePrice.toFixed(2)}/DOGE)`,
        shortDisplay: `~${dogeAmount} DOGE (~$4.20)`
      };
    } catch (error: any) {
      console.error('DogePriceService: Error formatting DOGE amount:', error);
      return {
        amount: 15.56,
        price: 0.27,
        display: `~15.56 DOGE (~$0.27/DOGE)`,
        shortDisplay: `~15.56 DOGE (~$4.20)`
      };
    }
  }

  /**
   * Get current cache status
   */
  getCacheStatus(): { price: number; lastUpdated: number | null; isStale: boolean } {
    return {
      price: this.cache.price,
      lastUpdated: this.cache.lastUpdated,
      isStale: this.cache.lastUpdated ? 
        (Date.now() - this.cache.lastUpdated) > this.cache.cacheDuration : true
    };
  }

  /**
   * Force refresh of DOGE price
   */
  async refreshPrice(): Promise<number> {
    this.cache.lastUpdated = null;
    return await this.getCurrentDogePrice();
  }
}

export default new DogePriceService();

