import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Extract UTM parameters from URL
export const getUtmParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || 'direct',
    utmCampaign: params.get('utm_campaign') || 'organic',
    utmMedium: params.get('utm_medium') || 'organic',
    utmContent: params.get('utm_content') || undefined,
  };
};

export const uploadPreview = async (
  image: string,
  text: string,
  userId: string,
) => {
  const utm = getUtmParams();
  const response = await axios.post(`${API_URL}/upload/preview`, {
    image,
    text,
    userId,
    ...utm,
  });
  return response.data;
};

export const createCheckoutSession = async (userId: string, email: string) => {
  const utm = getUtmParams();
  const response = await fetch(`${API_URL}/payment/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, email, ...utm }),
  });
  if (!response.ok) throw new Error('Payment initiation failed');
  return response.json();
};
