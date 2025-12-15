import { useState, useEffect } from 'react';
import axios from 'axios';

interface DoginalCard {
  inscriptionId: string;
  ipfsCid: string;
  txid: string;
  createdAt: string;
}

export default function Gallery() {
  const [doginals, setDoginals] = useState<DoginalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoginals = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${API_URL}/doginals`);
        setDoginals(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load gallery:', err);
        setError('Failed to load eternal dog pack. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoginals();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="bg-amber-900 text-white py-8 text-center">
        <h1 className="text-4xl font-bold mb-2">🐕 The Eternal Dog Pack</h1>
        <p className="text-amber-100">
          Forever immortalized on the Dogecoin blockchain
        </p>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading the eternal pack...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && doginals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-500 mb-4">
              No eternal dogs yet...
            </p>
            <p className="text-gray-400 mb-8">
              Be the first to immortalize your dog on the blockchain!
            </p>
            <a
              href="/upload"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              Immortalize Your Dog
            </a>
          </div>
        )}

        {/* Gallery Grid */}
        {!loading && !error && doginals.length > 0 && (
          <>
            <div className="mb-8 text-center">
              <p className="text-gray-600">
                {doginals.length} dog{doginals.length !== 1 ? 's' : ''}{' '}
                immortalized forever
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doginals.map((doginal) => (
                <DoginalCard key={doginal.inscriptionId} doginal={doginal} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <a
                href="/upload"
                className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg transition"
              >
                + Add Your Dog to the Pack
              </a>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12 text-center text-sm text-gray-400">
        <p>Each dog is permanently stored on the Dogecoin blockchain</p>
        <p className="mt-2">View on blockchain:</p>
      </footer>
    </div>
  );
}

function DoginalCard({ doginal }: { doginal: DoginalCard }) {
  const [imageError, setImageError] = useState(false);
  const ipfsUrl = `https://ipfs.io/ipfs/${doginal.ipfsCid}`;
  const blockchainUrl = `https://dogechain.info/tx/${doginal.txid}`;
  const shortId = doginal.inscriptionId.substring(0, 16) + '...';
  const shortTxid = doginal.txid.substring(0, 12) + '...';
  const date = new Date(doginal.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
      {/* Image */}
      <div className="bg-gray-100 h-64 flex items-center justify-center overflow-hidden">
        {!imageError ? (
          <img
            src={ipfsUrl}
            alt="Eternal dog"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">🐕</div>
            <p className="text-sm">Image loading</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Inscription ID */}
        <div className="mb-3 text-xs text-gray-500 font-mono break-all">
          <span className="block text-gray-700 font-semibold mb-1">
            Inscription
          </span>
          {shortId}
        </div>

        {/* Transaction ID */}
        <div className="mb-4 text-xs text-gray-500 font-mono break-all">
          <span className="block text-gray-700 font-semibold mb-1">
            Blockchain
          </span>
          {shortTxid}
        </div>

        {/* Date */}
        <div className="mb-4 text-sm text-gray-600">
          <span className="block text-gray-700 font-semibold mb-1">
            Inscribed
          </span>
          {date}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <a
            href={ipfsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded text-sm font-semibold transition"
          >
            View Image
          </a>
          <a
            href={blockchainUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-amber-100 hover:bg-amber-200 text-amber-700 py-2 rounded text-sm font-semibold transition"
          >
            Blockchain
          </a>
        </div>
      </div>
    </div>
  );
}
