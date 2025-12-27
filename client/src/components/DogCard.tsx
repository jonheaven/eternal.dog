import React from 'react'
import { ExternalLink, Calendar, Heart } from 'lucide-react'

interface Dog {
  id: string
  name: string
  description?: string
  dates?: string
  imageUrl?: string
  mintDate: string
  inscriptionId?: string
  explorerUrl?: string
}

interface DogCardProps {
  dog: Dog
}

const DogCard: React.FC<DogCardProps> = ({ dog }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg group hover:shadow-xl active:shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:scale-98 touch-manipulation">
      {/* Image */}
      <div className="aspect-square relative overflow-hidden rounded-t-xl sm:rounded-t-2xl">
        {dog.imageUrl ? (
          <img
            src={dog.imageUrl}
            alt={dog.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-doge-100 to-doge-200 flex items-center justify-center">
            <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-doge-400" />
          </div>
        )}
        
        {/* Overlay - Always visible on mobile for better UX */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 active:bg-black/30 transition-colors duration-300 flex items-center justify-center">
          {dog.explorerUrl && (
            <a
              href={dog.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/90 active:bg-white hover:bg-white text-gray-900 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg flex items-center space-x-2 text-xs sm:text-sm font-medium transition-all duration-200 opacity-90 group-hover:opacity-100 touch-manipulation min-h-[44px]"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">View on Blockchain</span>
              <span className="sm:hidden">View</span>
            </a>
          )}
        </div>
      </div>

      {/* Content - Mobile Optimized */}
      <div className="p-4 sm:p-5">
        <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2 truncate">
          {dog.name}
        </h3>
        
        {dog.description && (
          <p className="text-gray-600 text-sm sm:text-base mb-3 line-clamp-2 leading-relaxed">
            "{dog.description}"
          </p>
        )}
        
        {dog.dates && (
          <div className="flex items-center space-x-2 text-gray-500 text-xs sm:text-sm mb-3">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{dog.dates}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 gap-2">
          <span className="truncate flex-1">Minted {formatDate(dog.mintDate)}</span>
          {dog.inscriptionId && (
            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap font-medium">
              ✓ Inscribed
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default DogCard

