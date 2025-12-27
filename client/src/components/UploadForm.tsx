import { useState, useRef } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import { useNavigate } from 'react-router-dom';
import { uploadPreview } from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import { BackgroundRippleEffect } from './ui/background-ripple-effect';

export default function UploadForm() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleCrop = async () => {
    const imageElement = cropperRef.current;
    if (!imageElement) {
      alert('Please wait for the image to load completely.');
      return;
    }

    try {
      setLoading(true);
      const cropper = imageElement.cropper;
      if (!cropper) {
        throw new Error('Cropper instance not initialized');
      }

      const canvas = cropper.getCroppedCanvas();

      if (!canvas) {
        throw new Error('Failed to generate canvas from cropped image');
      }

      // Convert to webp blob
      canvas.toBlob(
        async (blob: Blob | null) => {
          if (!blob) {
            alert('Failed to process image. Try again.');
            setLoading(false);
            return;
          }

          try {
            const reader = new FileReader();
            reader.onloadend = async () => {
              try {
                const base64 = reader.result as string;
                const userId = uuidv4();

                await uploadPreview(base64.split(',')[1], text, userId);

                navigate('/preview', {
                  state: { image: base64, text, userId },
                });
              } catch (error) {
                console.error('Upload failed:', error);
                alert('Failed to save preview. Try again.');
                setLoading(false);
              }
            };
            reader.readAsDataURL(blob);
          } catch (error) {
            console.error('File reader error:', error);
            alert('Failed to process image. Try again.');
            setLoading(false);
          }
        },
        'image/webp',
        0.8
      );
    } catch (error) {
      console.error('Crop failed:', error);
      alert('Failed to crop image. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:py-8 relative">
      <BackgroundRippleEffect />
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
            Upload Your Dog
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl">
            Choose a photo to immortalize forever
          </p>
        </div>

        {/* Upload Section */}
        <div className="card p-6 sm:p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Step 1: Upload Your Dog's Photo
          </h2>
          
          {!image ? (
            <label className="block">
              <div className="drag-drop-area cursor-pointer touch-manipulation">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center space-y-4 py-8">
                  <div className="p-6 bg-doge-500/20 rounded-full">
                    <div className="text-4xl">📸</div>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-xl font-medium text-white mb-2">
                      Upload your dog photo
                    </p>
                    <p className="text-base text-gray-400 mb-2">
                      Tap here or choose from gallery
                    </p>
                    <div className="inline-flex items-center space-x-2 bg-doge-500 text-white px-4 py-2 rounded-lg text-sm font-medium mt-4">
                      <span>Choose Photo</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 text-center px-4">
                    Supports JPEG, PNG, GIF, WebP • Max 5MB
                  </div>
                </div>
              </div>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-2xl">✓</div>
                  <div>
                    <p className="text-white font-medium">Photo selected</p>
                    <p className="text-gray-400 text-sm">Ready to crop</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Crop to Perfect Square (420×420)
                </h3>
                <div className="w-full overflow-hidden rounded-lg bg-black">
                  <Cropper
                    ref={cropperRef}
                    src={image}
                    style={{ 
                      height: 'auto',
                      maxHeight: '60vh',
                      width: '100%',
                      minHeight: '300px'
                    }}
                    aspectRatio={1}
                    guides={true}
                    viewMode={1}
                    dragMode="move"
                    autoCropArea={0.8}
                    background={false}
                    responsive={true}
                    restore={false}
                    checkOrientation={false}
                    modal={false}
                    cropBoxResizable={true}
                    cropBoxMovable={true}
                    toggleDragModeOnDblclick={false}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Drag to position • Pinch to zoom on mobile
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dog Details Section */}
        <div className="card p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Step 2: Dog's Name + Memory
          </h2>
          <p className="text-gray-400 text-sm mb-6">Tell us about your dog (optional details can be added later)</p>
          <div className="space-y-4">
            <div>
              <label className="block text-base font-medium text-gray-300 mb-3">
                What's your dog's name? *
              </label>
              <textarea
                placeholder="e.g., Buddy - The best friend I ever had, loved chasing squirrels"
                maxLength={100}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="input-field resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  You can add more details after checkout
                </p>
                <p className={`text-sm font-medium ${text.length >= 100 ? 'text-red-400' : 'text-gray-400'}`}>
                  {text.length}/100
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleCrop}
            disabled={!image || !text.trim() || loading}
            className="btn-primary text-2xl w-full px-12 py-6 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation shadow-2xl"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="font-bold">Continue to Preview</span>
                <span className="text-sm opacity-90 mt-1">Secure Stripe Checkout</span>
              </div>
            )}
          </button>
          <p className="text-sm text-gray-400 mt-4 max-w-md mx-auto">
            🔒 Secure payment • ⚡ Done in 69 seconds • ✅ 1,200+ happy customers
          </p>
        </div>
      </div>
    </div>
  );
}
