import React from 'react'
import { Link } from 'react-router-dom'
import { XCircle, ArrowLeft, Heart } from 'lucide-react'
import { BackgroundRippleEffect } from '../components/ui/background-ripple-effect'

const Cancel: React.FC = () => {
  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 relative">
      <BackgroundRippleEffect />
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Cancel Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-red-500/20 rounded-full mb-6 border-4 border-red-500">
              <XCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
              Payment Cancelled
            </h1>
            <p className="text-base sm:text-lg text-gray-300 px-4">
              Your payment was cancelled. No charges have been made.
            </p>
          </div>

          {/* Message */}
          <div className="card p-6 sm:p-8 mb-6 border-red-500/50">
            <div className="text-center">
              <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
                Your Dog Still Deserves to be Immortalized
              </h2>
              <p className="text-base sm:text-lg text-gray-300 mb-6 leading-relaxed">
                We understand that sometimes things don't go as planned. 
                Your dog's memory is still precious, and we'd love to help you 
                preserve it forever on the blockchain.
              </p>
              
              <div className="space-y-4">
                <Link 
                  to="/" 
                  className="btn-primary w-full text-center text-lg py-4 flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Try Again</span>
                </Link>
                
                <div className="text-sm sm:text-base text-gray-300 pt-2">
                  Having trouble?{' '}
                  <a href="mailto:hello@eternal.dog" className="text-doge-400 hover:text-doge-300 font-semibold underline touch-manipulation">
                    Contact us
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="card p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
              Why Choose eternal.dog?
            </h3>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-2 h-2 bg-doge-500 rounded-full mt-2.5 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-base sm:text-lg mb-1 text-white">Forever Secure</p>
                  <p className="text-sm sm:text-base text-gray-400">Your dog's memory is stored on the Dogecoin blockchain, which can never be deleted or lost</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-2 h-2 bg-doge-500 rounded-full mt-2.5 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-base sm:text-lg mb-1 text-white">Made with Love</p>
                  <p className="text-sm sm:text-base text-gray-400">Created by dog lovers who understand the special bond you share</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-2 h-2 bg-doge-500 rounded-full mt-2.5 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-base sm:text-lg mb-1 text-white">Easy & Fast</p>
                  <p className="text-sm sm:text-base text-gray-400">Simple process that takes just a few minutes to complete</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-2 h-2 bg-doge-500 rounded-full mt-2.5 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-base sm:text-lg mb-1 text-white">Get Started with Crypto</p>
                  <p className="text-sm sm:text-base text-gray-400">Receive a wallet with DOGE to begin your crypto journey</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cancel

