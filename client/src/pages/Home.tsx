import { useNavigate } from 'react-router-dom';
import { ArrowDown, Shield } from 'lucide-react';
import { BackgroundRippleEffect } from '../components/ui/background-ripple-effect';
import { useDogePrice } from '../hooks/useDogePrice';

export default function Home() {
  const navigate = useNavigate();
  const dogePrice = useDogePrice();

  const scrollToForm = () => {
    // Since we're navigating to upload page, we'll just navigate
    navigate('/upload');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <BackgroundRippleEffect />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Wizard Dog Hero */}
            <div className="flex flex-col items-center lg:items-start">
              {/* Wizard Dog Mascot - HUGE HERO ELEMENT */}
              <div className="flex items-center justify-center lg:justify-start mb-8">
                <div className="flex items-center space-x-4">
                  {/* Wizard Dog - MUCH LARGER */}
                  <img 
                    src="/wizarddog.gif" 
                    alt="Wizard Dog" 
                    className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 animate-doge-sparkle transform scale-x-[-1] drop-shadow-2xl" 
                  />
                  
                  {/* Speech Bubble - LARGER */}
                  <div className="bg-white text-gray-800 text-lg sm:text-xl lg:text-2xl font-bold px-6 py-4 sm:px-8 sm:py-6 rounded-3xl shadow-2xl border-2 border-gray-300 relative max-w-xs">
                    ✨ I inscribe every pup forever! ✨
                    {/* Speech bubble tail pointing left toward wizard dog */}
                    <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-white"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="text-center lg:text-left">
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Eternalize Your Dog on the{' '}
                  <span className="bg-gradient-to-r from-doge-400 to-doge-600 bg-clip-text text-transparent animate-doge-sparkle">Dogecoin Blockchain</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Upload photo • Pay $14.20 • Done in 69 seconds
                </p>
                
                {/* Hero CTA Button */}
                <button
                  onClick={scrollToForm}
                  className="btn-primary text-xl px-12 py-6 mb-4 shadow-2xl hover:scale-105 transform transition-transform duration-200 w-full lg:w-auto"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold">Eternalize My Dog - $14.20</span>
                    <span className="text-sm opacity-90">Get {dogePrice.shortDisplay} back • 3 inscriptions included</span>
                  </div>
                </button>
                
                <button
                  onClick={scrollToForm}
                  className="text-gray-400 hover:text-doge-400 transition-colors duration-200 flex items-center justify-center mx-auto lg:mx-0 space-x-2 mt-6"
                >
                  <ArrowDown className="h-5 w-5 animate-bounce" />
                  <span>Start Here</span>
                  <ArrowDown className="h-5 w-5 animate-bounce" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Benefits - Full Width Below */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-12">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-doge-400/30">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="text-white font-bold mb-1">Never Lose It</h3>
              <p className="text-gray-300 text-sm">
                Phone stolen? House fire? Cloud fails? Blockchain can't be destroyed.
              </p>
            </div>
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-doge-400/30">
              <div className="text-3xl mb-2">🐕</div>
              <h3 className="text-white font-bold mb-1">Dogs on Dog Coin</h3>
              <p className="text-gray-300 text-sm">
                Dogecoin is the original dog cryptocurrency - it's perfect alignment!
              </p>
            </div>
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-doge-400/30">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="text-white font-bold mb-1">$4.20 DOGE Back</h3>
              <p className="text-gray-300 text-sm">
                Really only $10 after refund. Plus your DOGE might increase in value!
              </p>
            </div>
          </div>

          {/* Privacy & How It Works Combined */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-12 border border-doge-500 max-w-2xl mx-auto mt-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-doge-400" />
              <h3 className="text-lg font-semibold text-white">100% Private & Secure</h3>
            </div>
            <p className="text-gray-300 text-center">
              <strong>Your personal data stays private!</strong> Only your dog's image goes on the blockchain. 
              We inscribe your dog's photo on Dogecoin's unchangeable blockchain forever.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
