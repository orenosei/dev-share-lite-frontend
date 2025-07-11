'use client';

import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { uploadService } from '../services';
import { useAuth } from '../hooks';
import { 
  Upload, 
  X, 
  Image as ImageIcon,
  Loader2 
} from 'lucide-react';

export default function ImageUpload({ postId, onImagesUploaded, onImageDeleted }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate file types
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit to match backend
        alert(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    if (!user) {
      alert('Please login to upload images');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      // Call API directly
      const formData = new FormData();
      Array.from(selectedFiles).forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`http://localhost:4000/posts/${postId}/images`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        setSelectedFiles([]);
        setUploadProgress(0);
        
        if (onImagesUploaded) {
          // Transform response to match expected format
          const transformedData = {
            success: true,
            data: data
          };
          onImagesUploaded(transformedData);
        }
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        alert(`Successfully uploaded ${data.images?.length || 1} image(s)!`);
      } else {
        alert(data.message || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading images: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!user) {
      alert('Please login to delete images');
      return;
    }

    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const result = await uploadService.deletePostImage(imageId, user.id);
      
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

  return (
    <div className="space-y-4">
      {/* File Input */}
      <div className="flex items-center space-x-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id={`image-upload-${postId}`}
        />
        <Button 
          variant="outline" 
          type="button" 
          className="cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Select Images
        </Button>
        
        {selectedFiles.length > 0 && (
          <Button 
            onClick={handleUpload} 
            disabled={uploading}
            className="flex items-center"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading... {uploadProgress}%
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {selectedFiles.length} image{selectedFiles.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg transform hover:scale-110"
                  title="Remove file"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full max-w-[calc(100%-1rem)] truncate">
                  {file.name}
                </div>
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  {(file.size / (1024 * 1024)).toFixed(1)}MB
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
