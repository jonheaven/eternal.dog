import { useState, useEffect } from 'react';

interface DogePriceData {
  amount: number;
  price: number;
  display: string;
  shortDisplay: string;
  loading: boolean;
  error: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useDogePrice = (): DogePriceData => {
  const [data, setData] = useState<DogePriceData>({
    amount: 15.56, // Fallback amount
    price: 0.27,   // Fallback price
    display: '~15.56 DOGE (~$0.27/DOGE)',
    shortDisplay: '~15.56 DOGE (~$4.20)',
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDogePrice = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        
        // Try to fetch from our API
        const response = await fetch(`${API_URL}/doge-price`);
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const result = await response.json();
            setData({
              amount: result.dogeAmount || result.amount || 15.56,
              price: result.dogePrice || result.price || 0.27,
              display: result.display || `~${result.dogeAmount || 15.56} DOGE (~$${result.dogePrice || 0.27}/DOGE)`,
              shortDisplay: result.shortDisplay || `~${result.dogeAmount || 15.56} DOGE (~$4.20)`,
              loading: false,
              error: null
            });
          } else {
            throw new Error('API returned non-JSON response');
          }
        } else {
          throw new Error('Failed to fetch DOGE price');
        }
      } catch (error) {
        // Silently fall back to default values - no need to spam console
        setData(prev => ({
          ...prev,
          loading: false,
          error: null // Don't show error to user, just use fallback values
        }));
      }
    };

    fetchDogePrice();
  }, []);

  return data;
};

