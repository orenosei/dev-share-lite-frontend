'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks';
import { uploadService } from '../services';
import { 
  X, 
  ZoomIn,
  Download,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  XCircle
} from 'lucide-react';

export default function PostImages({ images, isAuthor, postId, onImageDeleted }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { user } = useAuth();

  // Auto reset activeIndex when images change
  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  const handleDeleteImage = async (imageId) => {
    if (!user || !isAuthor) {
      alert('You do not have permission to delete this image');
      return;
    }

    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const result = await uploadService.deletePostImage(postId, imageId, user.id);
      
      if (result.success) {
        if (onImageDeleted) {
          onImageDeleted(imageId);
        }
      } else {
        alert(result.error || 'Failed to delete image');
      }
    } catch (error) {
      alert('Error deleting image: ' + error.message);
    }
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
    // Set active index for modal navigation
    const imageIndex = images.findIndex(img => img.id === image.id);
    setActiveIndex(imageIndex !== -1 ? imageIndex : 0);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const handlePrevImage = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleDotClick = (index) => {
    setActiveIndex(index);
  };

  // Keyboard navigation for main gallery
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, images.length]);

  const downloadImage = (imageUrl, imageName) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageName || 'image';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Images Gallery */}
      <div className="space-y-3">
        
        {images.length === 1 ? (
          // Single image - large display
          <div className="relative group max-w-4xl">
            <div className="w-full h-[500px] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <img
                src={images[0].url}
                alt="Post image"
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => openImageModal(images[0])}
              />
            </div>
            
            {/* Single image overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-3">
                <button
                  onClick={() => openImageModal(images[0])}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full transition-all shadow-lg transform hover:scale-110"
                  title="View full size"
                >
                  <ZoomIn className="w-5 h-5 text-gray-700" />
                </button>
                
                <button
                  onClick={() => downloadImage(images[0].url, 'post-image')}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full transition-all shadow-lg transform hover:scale-110"
                  title="Download image"
                >
                  <Download className="w-5 h-5 text-gray-700" />
                </button>
                
                {isAuthor && (
                  <button
                    onClick={() => handleDeleteImage(images[0].id)}
                    className="bg-red-500 bg-opacity-90 hover:bg-red-600 text-white p-3 rounded-full transition-all shadow-lg transform hover:scale-110"
                    title="Delete image"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Multiple images - carousel/slideshow
          <div className="relative group max-w-4xl">
            {/* Main image container */}
            <div className="w-full h-[500px] overflow-hidden rounded-xl relative bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              {images.map((image, index) => (
                <img
                  key={image.id || index}
                  src={image.url}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 cursor-pointer hover:scale-105 ${
                    index === activeIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                  alt={`Post image ${index + 1}`}
                  onClick={() => openImageModal(image)}
                />
              ))}
            </div>

            {/* Navigation controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>

                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </>
            )}

            {/* Action buttons overlay */}
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => openImageModal(images[activeIndex])}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition-all shadow-lg"
                title="View full size"
              >
                <ZoomIn className="w-4 h-4 text-gray-700" />
              </button>
              
              <button
                onClick={() => downloadImage(images[activeIndex].url, `post-image-${activeIndex + 1}`)}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition-all shadow-lg"
                title="Download image"
              >
                <Download className="w-4 h-4 text-gray-700" />
              </button>
              
              {isAuthor && (
                <button
                  onClick={() => handleDeleteImage(images[activeIndex].id)}
                  className="bg-red-500 bg-opacity-90 hover:bg-red-600 text-white p-2 rounded-full transition-all shadow-lg"
                  title="Delete image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dots indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`h-3 rounded-full transition-all ${
                    index === activeIndex 
                      ? 'bg-white w-6' 
                      : 'bg-white/50 hover:bg-white/70 w-3'
                  }`}
                  title={`Image ${index + 1}`}
                />
              ))}
            </div>

            {/* Image counter */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
              {activeIndex + 1} of {images.length}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal - Optional for viewing larger size */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-full max-h-full flex items-center justify-center group">
            <img
              src={selectedImage.url}
              alt="Full size image"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Navigation arrows in modal */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
                    setSelectedImage(images[prevIndex]);
                    setActiveIndex(prevIndex);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
                    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
                    setSelectedImage(images[nextIndex]);
                    setActiveIndex(nextIndex);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </>
            )}
            
            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              {/* Download button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage(selectedImage.url, 'post-image');
                }}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 p-3 rounded-full transition-all shadow-lg"
                title="Download image"
              >
                <Download className="w-5 h-5 text-gray-700" />
              </button>
              
              {/* Delete button (for authors) */}
              {isAuthor && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(selectedImage.id);
                    closeImageModal();
                  }}
                  className="bg-red-500 bg-opacity-80 hover:bg-red-600 text-white p-3 rounded-full transition-all shadow-lg"
                  title="Delete image"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              
              {/* Close button */}
              <button
                onClick={closeImageModal}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 p-3 rounded-full transition-all shadow-lg"
                title="Close"
              >
                <XCircle className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
              {images.findIndex(img => img.id === selectedImage.id) + 1} of {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
