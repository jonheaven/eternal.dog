import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { DoginalData } from '../types/doginal';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY,
);

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
      'Check out my dog\'s eternalization preview on Dogecoin! 🐶 Join eternal.dog',
    );
    window.open(
      `https://www.tiktok.com/upload?text=${shareText}`,
      '_blank',
    );
  };

  const handlePayment = async () => {
    if (!email) {
      alert('Please enter your email.');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/payment/create-checkout-session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, email }),
        },
      );
      if (!response.ok) throw new Error('Payment initiation failed');
      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');
      await (stripe as any).redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment initiation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white min-h-screen flex flex-col">
      <h2 className="text-xl md:text-2xl font-bold text-center text-black mb-4">
        Your Dog's Eternalization
      </h2>
      <div className="border-4 border-dogecoin p-2 rounded bg-white">
        <img src={image} alt="Preview" className="w-full mx-auto" />
        <p className="text-center mt-2 text-black text-lg font-semibold">
          {text}
        </p>
      </div>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-4 w-full p-2 border rounded text-black text-lg focus:outline-none focus:ring-2 focus:ring-dogecoin"
      />
      <button
        onClick={handleSharePreview}
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded text-lg md:text-xl font-bold transition"
      >
        Share Preview
      </button>
      <button
        onClick={handlePayment}
        disabled={!email || loading}
        className="mt-4 w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded text-lg md:text-xl font-bold transition"
      >
        {loading ? 'Processing...' : 'Immortalize for $14.20'}
      </button>
    </div>
  );
}
