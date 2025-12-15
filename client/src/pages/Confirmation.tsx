export default function Confirmation() {
  return (
    <div className="p-4 max-w-md mx-auto bg-white min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-4">
        🎉 Immortalized!
      </h1>
      <p className="text-lg md:text-xl text-center mb-6">
        Your dog is now eternal on Dogecoin! Check your email for your wallet
        with $4.20 DOGE and your DOGE ID badge.
      </p>
      <button
        onClick={() => {
          const shareText = encodeURIComponent(
            'I immortalized my dog on Dogecoin! 🐶 Join the Eternal Pack at eternal.dog!'
          );
          window.open(
            `https://www.tiktok.com/upload?text=${shareText}`,
            '_blank'
          );
        }}
        className="mt-4 w-full max-w-xs bg-blue-500 hover:bg-blue-600 text-white p-3 rounded text-lg md:text-xl font-bold transition"
      >
        Share on TikTok
      </button>
      <button
        onClick={() => {
          const shareText = encodeURIComponent(
            'I immortalized my dog on Dogecoin! 🐶 eternal.dog'
          );
          window.open(
            `https://www.instagram.com/?caption=${shareText}`,
            '_blank'
          );
        }}
        className="mt-2 w-full max-w-xs bg-pink-500 hover:bg-pink-600 text-white p-3 rounded text-lg md:text-xl font-bold transition"
      >
        Share on Instagram
      </button>
      <a
        href="/"
        className="mt-6 text-dogecoin font-bold underline hover:text-yellow-600"
      >
        Back to Home
      </a>
    </div>
  );
}
