import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, ExternalLink, Heart, ArrowRight, Download } from 'lucide-react'
import ShareButton from '../components/ShareButton'
import { generateShareLinks } from '../services/share.service'
import wizardDog from '../assets/wizard-dog.svg'

interface ClaimData {
  id: string
  dogName: string
  inscriptionId: string
  walletAddress: string
  imageIpfsHash: string
  description?: string
  dates?: string
  isPublic: boolean
  claimed: boolean
  expiryDate: string
  tagInscriptionId?: string
  inscriptionsComplete: {
    photo: boolean
    badge: boolean
    tag: boolean
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Claim: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>()
  const [claimData, setClaimData] = useState<ClaimData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({
    description: '',
    dates: '',
    isPublic: false
  })
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (uuid) {
      fetchClaimData()
    }
  }, [uuid])

  const fetchClaimData = async () => {
    try {
      const response = await fetch(`${API_URL}/claim/${uuid}`)
      if (!response.ok) {
        throw new Error('Claim not found or expired')
      }
      const data = await response.json()
      setClaimData(data)
      // Initialize edit form with existing data
      setEditData({
        description: data.description || '',
        dates: data.dates || '',
        isPublic: data.isPublic !== undefined ? data.isPublic : true
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load claim')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDetails = async () => {
    setUpdating(true)
    try {
      const response = await fetch(`${API_URL}/claim/${uuid}/details`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update details')
      }
      
      await fetchClaimData()
      setEditMode(false)
      alert('Details updated successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update details')
    } finally {
      setUpdating(false)
    }
  }

  const handleClaim = async () => {
    if (!claimData) return
    
    setClaiming(true)
    try {
      const response = await fetch(`${API_URL}/claim/${uuid}/claim`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Failed to claim wallet')
      }
      
      const result = await response.json()
      setClaimData({ ...claimData, claimed: true })
      alert('Wallet marked as claimed!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim wallet')
    } finally {
      setClaiming(false)
    }
  }

  const downloadWallet = () => {
    if (!claimData) return
    
    const walletData = {
      address: claimData.walletAddress,
      dogName: claimData.dogName,
      inscriptionId: claimData.inscriptionId
    }
    
    const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${claimData.dogName}-wallet.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-doge-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading claim...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Claim Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/" className="inline-block bg-doge-500 hover:bg-doge-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!claimData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Claim Not Found</h1>
          <Link to="/" className="inline-block bg-doge-500 hover:bg-doge-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-2xl mx-auto">
        {/* Wizard Dog Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src={wizardDog} alt="Wizard Dog" className="w-24 h-24 sm:w-32 sm:h-32" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            We eternalized {claimData.dogName}!
          </h1>
          <p className="text-lg text-gray-600">
            Living or passed, they're on the blockchain forever.
          </p>
        </div>

        {/* Claim Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            {claimData.claimed ? (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-doge-100 rounded-full">
                <Heart className="h-8 w-8 text-doge-600" />
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            {claimData.claimed ? 'Wallet Claimed!' : 'Wallet Ready'}
          </h2>
          
          {!claimData.claimed && (
            <div className="text-center mb-6">
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="bg-doge-500 hover:bg-doge-600 text-white font-semibold text-lg px-8 py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {claiming ? 'Marking as Claimed...' : 'Mark Wallet as Claimed'}
              </button>
              <p className="text-xs text-gray-500 mt-2">Wallet credentials were sent via email</p>
            </div>
          )}
        </div>

        {/* Inscription Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 bg-gradient-to-br from-doge-50 to-purple-50">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Inscriptions</h2>
          <p className="text-sm text-gray-600 mb-4">
            {claimData.inscriptionsComplete.photo && claimData.inscriptionsComplete.badge && claimData.inscriptionsComplete.tag
              ? '🎉 All inscriptions complete - fully eternal!'
              : `${Object.values(claimData.inscriptionsComplete).filter(Boolean).length} of 3 complete`
            }
          </p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className={`text-center p-4 rounded-lg ${claimData.inscriptionsComplete.photo ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}>
              <div className="text-3xl mb-2">{claimData.inscriptionsComplete.photo ? '✅' : '⏸️'}</div>
              <div className="font-bold">Photo</div>
              <div className="text-xs text-gray-600 mt-1">
                {claimData.inscriptionsComplete.photo ? 'Inscribed!' : 'Pending'}
              </div>
            </div>
            <div className={`text-center p-4 rounded-lg ${claimData.inscriptionsComplete.badge ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}>
              <div className="text-3xl mb-2">{claimData.inscriptionsComplete.badge ? '✅' : '⏸️'}</div>
              <div className="font-bold">Badge</div>
              <div className="text-xs text-gray-600 mt-1">
                {claimData.inscriptionsComplete.badge ? 'Expires: ♾️' : 'Pending'}
              </div>
            </div>
            <div className={`text-center p-4 rounded-lg ${claimData.inscriptionsComplete.tag ? 'bg-green-100 border-2 border-green-500' : 'bg-yellow-100 border-2 border-yellow-500'}`}>
              <div className="text-3xl mb-2">{claimData.inscriptionsComplete.tag ? '✅' : '⏸️'}</div>
              <div className="font-bold">Tag</div>
              <div className="text-xs text-gray-600 mt-1">
                {claimData.inscriptionsComplete.tag ? 'Inscribed!' : 'Optional'}
              </div>
            </div>
          </div>
        </div>

        {/* Dog Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Dog Details</h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="text-sm text-doge-600 hover:text-doge-700 font-medium"
              >
                Edit
              </button>
            )}
          </div>
          
          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Loves belly rubs and treats"
                  rows={3}
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dates</label>
                <input
                  type="text"
                  value={editData.dates}
                  onChange={(e) => setEditData({...editData, dates: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Born 2015"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editData.isPublic}
                  onChange={(e) => setEditData({...editData, isPublic: e.target.checked})}
                  className="h-4 w-4 text-doge-600"
                />
                <label className="ml-2 text-sm text-gray-700">Make public in gallery</label>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleUpdateDetails}
                  disabled={updating}
                  className="bg-doge-500 hover:bg-doge-600 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false)
                    setEditData({
                      description: claimData.description || '',
                      dates: claimData.dates || '',
                      isPublic: claimData.isPublic
                    })
                  }}
                  className="bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{claimData.dogName}</span>
              </div>
              {claimData.dates && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Dates:</span>
                  <span className="font-medium">{claimData.dates}</span>
                </div>
              )}
              {claimData.description && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium text-right max-w-xs">{claimData.description}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Public:</span>
                <span className={`font-medium ${claimData.isPublic ? 'text-green-600' : 'text-gray-600'}`}>
                  {claimData.isPublic ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Blockchain Proof */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Blockchain Proof</h2>
          <div className="bg-doge-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Inscription ID</h3>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm text-gray-600 break-all">
                {claimData.inscriptionId}
              </span>
              <a
                href={`https://dogechain.info/tx/${claimData.inscriptionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-doge-600 hover:text-doge-700 transition-colors duration-200 flex-shrink-0"
                title="View on Dogechain.info"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Wallet Address</h3>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm text-gray-600 break-all">
                {claimData.walletAddress}
              </span>
              <a
                href={`https://dogechain.info/address/${claimData.walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 transition-colors duration-200 flex-shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        {claimData.isPublic && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Share Your Eternal Dog</h2>
            <div className="space-y-3">
              <ShareButton 
                platform="tiktok"
                text={`I eternalized ${claimData.dogName} on Dogecoin! 🐶🚀 See them at eternal.dog/gallery #EternalDog`}
              />
              <ShareButton 
                platform="instagram"
                text={`I eternalized ${claimData.dogName} on Dogecoin! 🐶🚀 #EternalDog`}
              />
              <ShareButton 
                platform="facebook"
                text={`I eternalized ${claimData.dogName} on Dogecoin! 🐶🚀`}
              />
            </div>
          </div>
        )}

        {/* Download Wallet Info */}
        {claimData.claimed && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Download Wallet Info</h2>
            <p className="text-gray-600 mb-4">
              Download your wallet information (note: private key was sent via email only).
            </p>
            <button
              onClick={downloadWallet}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Wallet File</span>
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link to="/gallery" className="block bg-doge-500 hover:bg-doge-600 text-white font-semibold py-3 px-6 rounded-lg text-center flex items-center justify-center transition-colors duration-200">
            View Eternal Pack
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
          <Link to="/" className="block bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg text-center transition-colors duration-200">
            Immortalize Another Dog
          </Link>
        </div>

        {/* Security Warning */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">Security Reminder</h3>
          <p className="text-sm text-yellow-700">
            Your wallet credentials (mnemonic/private key) were sent to your email only. 
            Keep them secure and never share them with anyone.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Claim

