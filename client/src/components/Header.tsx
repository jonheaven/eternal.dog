import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HeartHandshake, Menu, X } from 'lucide-react'

const Header: React.FC = () => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <header className="bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50 border-b border-doge-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 touch-manipulation"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex items-center space-x-1">
              <HeartHandshake className="h-7 w-7 sm:h-8 sm:w-8 text-doge-500" />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-doge-400 to-doge-600 bg-clip-text text-transparent">
                eternal.dog
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium transition-colors duration-200 touch-manipulation ${
                location.pathname === '/' 
                  ? 'text-doge-400' 
                  : 'text-gray-300 hover:text-doge-400'
              }`}
            >
              Immortalize
            </Link>
            <Link 
              to="/gallery" 
              className={`font-medium transition-colors duration-200 touch-manipulation ${
                location.pathname === '/gallery' 
                  ? 'text-doge-400' 
                  : 'text-gray-300 hover:text-doge-400'
              }`}
            >
              Gallery
            </Link>
          </nav>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-doge-400 hover:bg-gray-700 transition-colors duration-200 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile navigation - Toggleable */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-doge-500/30 bg-gray-900/98 backdrop-blur-sm">
          <div className="px-4 py-3 space-y-1">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg font-medium transition-colors duration-200 touch-manipulation min-h-[44px] flex items-center ${
                location.pathname === '/' 
                  ? 'text-doge-400 bg-doge-500/20' 
                  : 'text-gray-300 hover:text-doge-400 hover:bg-gray-700'
              }`}
            >
              Immortalize
            </Link>
            <Link 
              to="/gallery" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg font-medium transition-colors duration-200 touch-manipulation min-h-[44px] flex items-center ${
                location.pathname === '/gallery' 
                  ? 'text-doge-400 bg-doge-500/20' 
                  : 'text-gray-300 hover:text-doge-400 hover:bg-gray-700'
              }`}
            >
              Gallery
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header

