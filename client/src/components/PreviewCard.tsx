import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DoginalData } from '../types/doginal';
import { createCheckoutSession } from '../services/api';
import { BackgroundRippleEffect } from './ui/background-ripple-effect';

export default function PreviewCard() {
  const { state } = useLocation();
  const { image, text, userId } = (state || {}) as DoginalData;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if no state
  if (!state) {
    navigate('/upload');
    return null;
  }

  const handleSharePreview = () => {
    const shareText = encodeURIComponent(
      "Check out my dog's eternalization preview on Dogecoin! 🐶 Join eternal.dog"
    );
    window.open(`https://www.tiktok.com/upload?text=${shareText}`, '_blank');
  };

  const handlePayment = async () => {
    if (!email) {
      alert('Please enter your email.');
      return;
    }

    try {
      setLoading(true);

      // Create checkout session via API (includes UTM params)
      const { sessionId, sessionUrl } = await createCheckoutSession(
        userId,
        email
      );

      if (!sessionId) throw new Error('No session ID returned');

      // Prefer server-provided hosted URL; fall back to constructing path if missing
      const redirectUrl =
        sessionUrl || `https://checkout.stripe.com/c/pay/${sessionId}`;
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment initiation failed. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:py-8 relative">
      <BackgroundRippleEffect />
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
            Your Dog&#39;s Eternalization
          </h2>
          <p className="text-gray-300 text-lg sm:text-xl">
            This is how it will appear on the blockchain
          </p>
        </div>

        {/* Preview Card */}
        <div className="card p-6 sm:p-8 mb-6">
          <div className="border-4 border-doge-500 rounded-xl p-4 bg-black">
            <div className="aspect-square rounded-lg overflow-hidden mb-4">
              <img 
                src={image} 
                alt="Preview" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="bg-doge-500/20 rounded-lg p-4 border border-doge-400/30">
              <p className="text-center text-white text-base sm:text-lg font-semibold leading-relaxed">
                {text}
              </p>
            </div>
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                <span>✓</span>
                <span>Ready to immortalize</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="card p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Step 3: Your Email
          </h2>
          <p className="text-gray-400 text-sm mb-6">We'll send all 3 inscription links here</p>
          <div>
            <label className="block text-base font-medium text-gray-300 mb-3">
              Email Address *
            </label>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-2">
              Your wallet credentials and claim link will be sent here
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleSharePreview}
            className="btn-secondary w-full text-lg py-4"
          >
            📤 Share Preview
          </button>
          
          <button
            onClick={handlePayment}
            disabled={!email.trim() || loading}
            className="btn-primary text-2xl w-full px-12 py-6 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation shadow-2xl"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="font-bold">Immortalize for $14.20</span>
                <span className="text-sm opacity-90 mt-1">Get $4.20 DOGE back!</span>
              </div>
            )}
          </button>
          
          <p className="text-sm text-gray-400 text-center max-w-md mx-auto">
            🔒 Secure payment via Stripe • ⚡ Done in 69 seconds • ✅ 1,200+ happy customers
          </p>
        </div>
      </div>
    </div>
  );
}
