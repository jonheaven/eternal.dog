const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'https://eternal.dog';

export const generateShareLinks = (dogName: string, dogId: string, isPublic: boolean = true) => {
  const packUrl = `${FRONTEND_URL}/gallery/${dogId}`;
  const shareText = `I eternalized ${dogName} on Dogecoin! 🐶🚀 See them at ${packUrl} #EternalDog`;
  
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(packUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(packUrl)}&quote=${encodeURIComponent(shareText)}`,
    tiktok: shareText + ' ' + packUrl, // TikTok doesn't have direct share URLs
    text: shareText,
    url: packUrl
  };
};

