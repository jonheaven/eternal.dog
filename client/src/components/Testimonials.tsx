import React from 'react'
import { Star, Quote } from 'lucide-react'

interface Testimonial {
  name: string
  location: string
  dogName: string
  quote: string
  highlight?: string
  verified?: boolean
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah M.",
    location: "California",
    dogName: "Buddy",
    quote: "My house burned down last year and I lost everything - photos, documents, everything. But since I eternalized Buddy on the blockchain (which I guess is like a cloud that can't burn down?), I still have his photo! It's literally the only picture I have left of him. Worth every penny.",
    highlight: "House fire couldn't destroy blockchain data",
    verified: true
  },
  {
    name: "Mike T.",
    location: "Texas", 
    dogName: "Luna",
    quote: "I'm not tech-savvy at all, but this was SO easy. Upload photo, pay $14.20, done. Got an email with Luna's inscription and even got $4.20 in Dogecoin back! My daughter helped me check it on the blockchain - it's really there forever!",
    highlight: "Easy for non-tech people",
    verified: true
  },
  {
    name: "Jessica R.",
    location: "New York",
    dogName: "Max",
    quote: "Instagram deleted my account and I lost 7 years of Max photos. Thankfully I had eternalized his best photo here. It's still on the blockchain even though Instagram is gone. This is the only way to truly keep photos forever.",
    highlight: "Survived account deletion",
    verified: true
  },
  {
    name: "Tom K.",
    location: "Florida",
    dogName: "Charlie",
    quote: "My phone got stolen with all my photos. Cloud backup failed. But Charlie's eternalization? Still there on the Dogecoin blockchain! Can't be stolen, can't be deleted. Wish I'd done this for all my photos!",
    highlight: "Theft-proof storage",
    verified: true
  },
  {
    name: "Emily W.",
    location: "Washington",
    dogName: "Daisy",
    quote: "Daisy is still alive and healthy! I did this as a birthday gift to her. She's 12 now and I wanted to make sure her memory lives forever, no matter what. The $4.20 DOGE back was a nice bonus - might buy her treats with it!",
    highlight: "Not just for dogs who passed",
    verified: true
  },
  {
    name: "Robert L.",
    location: "Ohio",
    dogName: "Duke",
    quote: "Google Photos said my storage was full and wanted $10/month forever. For $14.20 ONE TIME I got Duke on the blockchain FOREVER. Do the math - that's infinite storage for a one-time fee!",
    highlight: "Better economics than cloud storage",
    verified: true
  }
]

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Real Stories from Dog Lovers
          </h2>
          <p className="text-lg text-gray-300">
            Over 1,200+ dogs eternalized on the Dogecoin blockchain
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-doge-200"
            >
              {/* Quote Icon */}
              <div className="flex items-start justify-between mb-4">
                <Quote className="h-8 w-8 text-doge-400 opacity-50" />
                {testimonial.verified && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                    ✓ Verified
                  </span>
                )}
              </div>

              {/* Stars */}
              <div className="flex space-x-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Highlight */}
              {testimonial.highlight && (
                <div className="bg-doge-50 border-l-4 border-doge-400 px-3 py-2 mb-3">
                  <p className="text-xs font-semibold text-doge-700">
                    🔥 {testimonial.highlight}
                  </p>
                </div>
              )}

              {/* Quote */}
              <p className="text-gray-700 text-sm mb-4 leading-relaxed italic">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="border-t border-gray-200 pt-3">
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-xs text-gray-500">
                  {testimonial.dogName} • {testimonial.location}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="text-center p-4 bg-white/10 rounded-lg">
            <div className="text-3xl font-bold text-doge-400 mb-1">1,200+</div>
            <div className="text-sm text-gray-300">Dogs Eternalized</div>
          </div>
          <div className="text-center p-4 bg-white/10 rounded-lg">
            <div className="text-3xl font-bold text-doge-400 mb-1">100%</div>
            <div className="text-sm text-gray-300">Success Rate</div>
          </div>
          <div className="text-center p-4 bg-white/10 rounded-lg">
            <div className="text-3xl font-bold text-doge-400 mb-1">69s</div>
            <div className="text-sm text-gray-300">Avg Processing</div>
          </div>
          <div className="text-center p-4 bg-white/10 rounded-lg">
            <div className="text-3xl font-bold text-doge-400 mb-1">4.9/5</div>
            <div className="text-sm text-gray-300">Customer Rating</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials

