import { useState, useRef } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

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

                await axios.post(
                  `${import.meta.env.VITE_API_URL}/upload/preview`,
                  {
                    image: base64.split(',')[1],
                    text,
                    userId,
                  }
                );

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
    <div className="p-4 max-w-md mx-auto bg-white min-h-screen flex flex-col">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-4">
        Upload Your Dog
      </h1>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4 w-full text-black file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-dogecoin file:text-black cursor-pointer"
      />
      {image && (
        <Cropper
          ref={cropperRef}
          src={image}
          style={{ height: 300, width: '100%' }}
          aspectRatio={1}
          guides={true}
          viewMode={1}
          dragMode="move"
          autoCropArea={1}
          background={false}
          responsive={true}
          checkOrientation={false}
          className="mb-4"
        />
      )}
      <input
        type="text"
        placeholder="Dog's Name + Memory (100 chars)"
        maxLength={100}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mt-4 w-full p-2 border rounded text-black text-lg focus:outline-none focus:ring-2 focus:ring-dogecoin"
      />
      <p className="text-sm text-gray-600 mt-1">{text.length}/100</p>
      <button
        onClick={handleCrop}
        disabled={!image || !text || loading}
        className="mt-4 w-full bg-dogecoin hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-black p-3 rounded text-lg md:text-xl font-bold transition"
      >
        {loading ? 'Processing...' : 'Preview'}
      </button>
    </div>
  );
}
