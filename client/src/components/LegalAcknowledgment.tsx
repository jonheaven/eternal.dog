import React, { useState } from 'react'
import { AlertTriangle, Shield, Eye, Clock, TrendingUp } from 'lucide-react'

interface LegalAcknowledgmentProps {
  onAcknowledge: (acknowledged: boolean) => void
}

const LegalAcknowledgment: React.FC<LegalAcknowledgmentProps> = ({ onAcknowledge }) => {
  const [acknowledgments, setAcknowledgments] = useState({
    blockchainPublic: false,
    thirtyDayClaim: false,
    tradingMarkets: false,
    privacyWaiver: false
  })

  const handleCheckboxChange = (key: keyof typeof acknowledgments) => {
    setAcknowledgments(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const allAcknowledged = Object.values(acknowledgments).every(Boolean)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (allAcknowledged) {
      onAcknowledge(true)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Important Legal Notice</h2>
              <p className="text-gray-600">Please read and acknowledge before proceeding</p>
            </div>
          </div>

          {/* Critical Warnings */}
          <div className="space-y-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Eye className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Blockchain is Public Forever</h3>
                  <p className="text-red-800 text-sm">
                    Your dog's image will be <strong>PERMANENTLY and PUBLICLY</strong> visible on the Dogecoin blockchain. 
                    Anyone can view it using blockchain explorers. This cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">30-Day Claim Deadline</h3>
                  <p className="text-yellow-800 text-sm">
                    You must claim your wallet within 30 days or lose access forever. 
                    Unclaimed wallets may be transferred to charity.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Tradeable Assets</h3>
                  <p className="text-blue-800 text-sm">
                    Your inscribed asset may be tradeable on secondary markets. 
                    We have no control over trading or valuation.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Your Privacy is Protected</h3>
                  <p className="text-green-800 text-sm">
                    <strong>Only your dog's image goes on the blockchain.</strong> Your personal information (email, payment details, name) stays completely private and secure. We never share your personal data.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Acknowledgment Checkboxes */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgments.blockchainPublic}
                  onChange={() => handleCheckboxChange('blockchainPublic')}
                  className="mt-1 h-4 w-4 text-doge-600 focus:ring-doge-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I understand that my dog's image will be <strong>permanently and publicly visible</strong> on the Dogecoin blockchain and cannot be made private.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgments.thirtyDayClaim}
                  onChange={() => handleCheckboxChange('thirtyDayClaim')}
                  className="mt-1 h-4 w-4 text-doge-600 focus:ring-doge-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I understand that I must claim my wallet within 30 days or lose access forever.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgments.tradingMarkets}
                  onChange={() => handleCheckboxChange('tradingMarkets')}
                  className="mt-1 h-4 w-4 text-doge-600 focus:ring-doge-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I understand that my inscribed asset may be tradeable on secondary markets and this is a memorial service, not an investment platform.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgments.privacyWaiver}
                  onChange={() => handleCheckboxChange('privacyWaiver')}
                  className="mt-1 h-4 w-4 text-doge-600 focus:ring-doge-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I waive any expectation of privacy for the uploaded content and will not hold eternal.dog responsible for the public nature of blockchain data.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={!allAcknowledged}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  allAcknowledged
                    ? 'bg-doge-500 hover:bg-doge-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {allAcknowledged ? 'I Acknowledge and Agree' : 'Please Check All Boxes'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            By proceeding, you agree to our <a href="/legal/terms" target="_blank" className="text-doge-600 hover:underline">Terms and Conditions</a> and <a href="/legal/privacy" target="_blank" className="text-doge-600 hover:underline">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  )
}

export default LegalAcknowledgment

