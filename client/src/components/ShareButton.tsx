interface ShareButtonProps {
  platform: 'tiktok' | 'instagram' | 'facebook';
  text: string;
}

export default function ShareButton({ platform, text }: ShareButtonProps) {
  const handleShare = () => {
    const encodedText = encodeURIComponent(text);
    const urls: Record<string, string> = {
      tiktok: `https://www.tiktok.com/upload?text=${encodedText}`,
      instagram: `https://www.instagram.com/?caption=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`,
    };
    window.open(urls[platform], '_blank');
  };

  const colors: Record<string, string> = {
    tiktok: 'bg-black hover:bg-gray-800',
    instagram: 'bg-pink-500 hover:bg-pink-600',
    facebook: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <button
      onClick={handleShare}
      className={`mt-2 w-full ${colors[platform]} text-white p-2 rounded text-lg font-bold capitalize transition`}
    >
      Share on {platform}
    </button>
  );
}
