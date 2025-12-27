import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { BackgroundRippleEffect } from '../components/ui/background-ripple-effect';

export default function Confirmation() {
  const shareText = encodeURIComponent(
    'I immortalized my dog on Dogecoin! 🐶 Join the Eternal Pack at eternal.dog!'
  );

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12 relative">
      <BackgroundRippleEffect />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="max-w-md mx-auto">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-500">
              <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-400" />
            </div>
          </div>

          {/* Header */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center text-white mb-4">
            🎉 Immortalized!
          </h1>
          <p className="text-lg sm:text-xl text-center text-gray-300 mb-2 leading-relaxed">
            Your dog is now eternal on Dogecoin!
          </p>
          <p className="text-base sm:text-lg text-center text-gray-400 mb-8">
            Check your email for your wallet with $4.20 DOGE and your DOGE ID badge.
          </p>

          {/* Info Card */}
          <div className="card p-6 sm:p-8 mb-8 border-green-500/50">
            <h2 className="font-bold text-lg text-white mb-4 text-center">
              What Happens Next?
            </h2>
            <div className="space-y-3 text-sm sm:text-base text-gray-300">
              <div className="flex items-start space-x-3">
                <span className="text-2xl flex-shrink-0">📧</span>
                <div>
                  <div className="font-semibold text-white">Check Your Email</div>
                  <div className="text-gray-400">Wallet credentials & claim link sent now</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl flex-shrink-0">🔗</span>
                <div>
                  <div className="font-semibold text-white">Claim Your Wallet</div>
                  <div className="text-gray-400">Use the link in your email to access</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl flex-shrink-0">🐕</span>
                <div>
                  <div className="font-semibold text-white">View in Gallery</div>
                  <div className="text-gray-400">See your dog in the Eternal Pack</div>
                </div>
              </div>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="space-y-4 mb-8">
            <button
              onClick={() => {
                window.open(
                  `https://www.tiktok.com/upload?text=${shareText}`,
                  '_blank'
                );
              }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-4 px-6 rounded-lg text-lg font-semibold transition-colors touch-manipulation"
            >
              📱 Share on TikTok
            </button>
            
            <button
              onClick={() => {
                window.open(
                  `https://www.instagram.com/?caption=${shareText}`,
                  '_blank'
                );
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 px-6 rounded-lg text-lg font-semibold transition-colors touch-manipulation"
            >
              📷 Share on Instagram
            </button>
          </div>

          {/* Action Links */}
          <div className="space-y-3">
            <Link
              to="/gallery"
              className="btn-primary w-full text-center text-lg py-4"
            >
              View Eternal Pack →
            </Link>
            
            <Link
              to="/"
              className="btn-secondary w-full text-center py-4"
            >
              Immortalize Another Dog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
