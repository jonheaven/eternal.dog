import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Heart, HeartHandshake } from 'lucide-react';
import DogCard from '../components/DogCard';

interface Dog {
  id: string;
  name: string;
  description?: string;
  dates?: string;
  imageUrl?: string;
  mintDate: string;
  inscriptionId?: string;
  explorerUrl?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface GalleryResponse {
  success: boolean;
  dogs: Dog[];
  pagination: Pagination;
}

interface StatsResponse {
  success: boolean;
  stats: {
    totalDogs: number;
    totalInscribed: number;
    recentDogs: number;
    publicPercentage: number;
  };
}

export default function Gallery() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [stats, setStats] = useState<StatsResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    loadGallery();
    loadStats();
  }, []);

  const loadGallery = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search ? { search } : {})
      });
      
      const response = await axios.get<GalleryResponse>(`${API_URL}/doginals?${params}`);
      
      if (response.data.success) {
        setDogs(response.data.dogs);
        setTotalPages(response.data.pagination.pages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get<StatsResponse>(`${API_URL}/doginals/stats`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) {
      loadGallery(1);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    await loadGallery(1, query);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-doge-500/20 text-doge-400 border border-doge-500/30 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <HeartHandshake className="h-4 w-4" />
            <span>Eternal Pack</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            The <span className="bg-gradient-to-r from-doge-400 to-doge-600 bg-clip-text text-transparent">Eternal Pack</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A collection of dogs immortalized on the Dogecoin blockchain. 
            Each one forever preserved in digital stone.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-doge-400 mb-2">
                {stats.totalDogs.toLocaleString()}
              </div>
              <div className="text-gray-300">Dogs in Pack</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-doge-400 mb-2">
                {stats.totalInscribed.toLocaleString()}
              </div>
              <div className="text-gray-300">Total Inscribed</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {stats.recentDogs}
              </div>
              <div className="text-gray-300">This Week</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {stats.publicPercentage}%
              </div>
              <div className="text-gray-300">Public</div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-8 px-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search dogs by name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="input-field w-full pl-12 pr-4 py-4"
            />
          </div>
        </div>

        {/* Dogs Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card p-4 sm:p-6 animate-pulse">
                <div className="bg-gray-700 h-32 sm:h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-700 h-4 rounded mb-2"></div>
                <div className="bg-gray-700 h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : dogs.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {isSearching ? 'No dogs found' : 'No dogs in the pack yet'}
            </h3>
            <p className="text-gray-300 mb-6">
              {isSearching 
                ? 'Try a different search term'
                : 'Be the first to immortalize your dog!'
              }
            </p>
            {!isSearching && (
              <Link to="/" className="btn-primary inline-block font-semibold py-3 px-8">
                Immortalize Your Dog
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0">
              {dogs.map((dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>

            {/* Pagination - Mobile Optimized */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 px-4">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap justify-center gap-2">
                  <button
                    onClick={() => loadGallery(currentPage - 1, searchQuery)}
                    disabled={currentPage === 1}
                    className="btn-secondary px-4 sm:px-5 py-3 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-sm sm:text-base touch-manipulation min-h-[44px]"
                  >
                    Previous
                  </button>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (page > totalPages) return null;
                      
                      return (
                        <button
                          key={page}
                          onClick={() => loadGallery(page, searchQuery)}
                          className={`px-4 py-3 rounded-lg text-sm sm:text-base font-medium min-w-[44px] min-h-[44px] touch-manipulation transition-all ${
                            page === currentPage
                              ? 'bg-doge-500 text-white shadow-lg scale-105'
                              : 'btn-secondary text-gray-300 hover:text-doge-400'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => loadGallery(currentPage + 1, searchQuery)}
                    disabled={currentPage === totalPages}
                    className="btn-secondary px-4 sm:px-5 py-3 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-sm sm:text-base touch-manipulation min-h-[44px]"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-doge-500 to-doge-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Your Dog Belongs Here Too
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Join the Eternal Pack and preserve your dog's memory forever on the blockchain
            </p>
            <Link to="/" className="inline-block bg-white text-doge-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              Immortalize Your Dog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
