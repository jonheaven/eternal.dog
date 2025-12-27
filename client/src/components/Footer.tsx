import React from 'react'
import { Heart, Github, Twitter, Mail } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-doge-400 to-doge-600 bg-clip-text text-transparent">eternal.dog</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Etching your dog onto the Dogecoin blockchain for eternity. 
              We etch your dogs memory very dog deserves to be immortalized.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com/eternaldog" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://github.com/eternaldog" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="mailto:hello@eternal.dog" 
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Service</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="/" className="hover:text-white transition-colors duration-200">
                  Immortalize Your Dog
                </a>
              </li>
              <li>
                <a href="/gallery" className="hover:text-white transition-colors duration-200">
                  Gallery
                </a>
              </li>
              <li>
                <a href="https://dogechain.info" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">
                  Blockchain Explorer
                </a>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="/faq" className="hover:text-white transition-colors duration-200">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/help" className="hover:text-white transition-colors duration-200">
                  Help Center
                </a>
              </li>
              <li>
                <a href="mailto:hello@eternal.dog" className="hover:text-white transition-colors duration-200">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-1 text-gray-400 mb-4 md:mb-0">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>for dog lovers</span>
          </div>
          <div className="text-gray-400 text-sm">
            © 2024 eternal.dog. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

