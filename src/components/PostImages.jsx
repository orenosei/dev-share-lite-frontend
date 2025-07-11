'use client';

import { useState } from 'react';
import { useAuth } from '../hooks';
import { uploadService } from '../services';
import { 
  X, 
  ZoomIn,
  Download,
  Image as ImageIcon
} from 'lucide-react';

export default function PostImages({ images, isAuthor, postId, onImageDeleted }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const { user } = useAuth();

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
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

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
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
          <ImageIcon className="w-4 h-4 mr-2" />
          Images ({images.length})
        </h4>
        
        {/* Responsive Grid based on image count */}
        <div className={`grid gap-3 ${
          images.length === 1 ? 'grid-cols-1 max-w-md' :
          images.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
          images.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
          images.length === 4 ? 'grid-cols-2 lg:grid-cols-4' :
          'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
        }`}>
          {images.map((image, index) => (
            <div key={image.id || index} className="relative group">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={image.url}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => openImageModal(image)}
                />
              </div>
              
              {/* Image overlay with actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openImageModal(image)}
                    className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition-all shadow-lg transform hover:scale-110"
                    title="View full size"
                  >
                    <ZoomIn className="w-4 h-4 text-gray-700" />
                  </button>
                  
                  <button
                    onClick={() => downloadImage(image.url, `post-image-${index + 1}`)}
                    className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition-all shadow-lg transform hover:scale-110"
                    title="Download image"
                  >
                    <Download className="w-4 h-4 text-gray-700" />
                  </button>
                  
                  {isAuthor && (
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="bg-red-500 bg-opacity-90 hover:bg-red-600 text-white p-2 rounded-full transition-all shadow-lg transform hover:scale-110"
                      title="Delete image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Image index indicator */}
              {images.length > 1 && (
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                  {index + 1}/{images.length}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <img
              src={selectedImage.url}
              alt="Full size image"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              {/* Download button */}
              <button
                onClick={() => downloadImage(selectedImage.url, 'post-image')}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 p-3 rounded-full transition-all shadow-lg"
                title="Download image"
              >
                <Download className="w-5 h-5 text-gray-700" />
              </button>
              
              {/* Delete button (for authors) */}
              {isAuthor && (
                <button
                  onClick={() => {
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
                <X className="w-5 h-5 text-gray-700" />
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
