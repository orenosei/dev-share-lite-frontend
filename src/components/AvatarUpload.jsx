'use client';

import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { useAuth } from '../hooks';
import { userService } from '../services';
import { 
  Upload, 
  X, 
  User,
  Loader2,
  Camera,
  Trash2
} from 'lucide-react';

export default function AvatarUpload({ userId, currentAvatarUrl, onAvatarUpdated, onAvatarDeleted }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    if (!user) {
      alert('Please login to upload avatar');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await userService.uploadAvatar(userId, selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
        
        if (onAvatarUpdated) {
          const avatarUrl = 
            result.data?.avatar?.url ||
            result.data?.user?.avatarUrl ||
            result.data?.avatarUrl;
          
          if (avatarUrl) {
            onAvatarUpdated(avatarUrl);
          } else {
            alert('Avatar uploaded but could not get URL. Please refresh the page.');
            return;
          }
        }
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        alert('Avatar uploaded successfully!');
      } else {
        alert(result.error || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user) {
      alert('Please login to delete avatar');
      return;
    }

    if (!currentAvatarUrl) {
      alert('No avatar to delete');
      return;
    }

    if (!confirm('Are you sure you want to delete your avatar?')) {
      return;
    }

    try {
      const result = await userService.deleteAvatar(userId);

      if (result.success) {
        if (onAvatarDeleted) {
          onAvatarDeleted();
        }
        alert('Avatar deleted successfully!');
      } else {
        alert(result.error || 'Failed to delete avatar');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting avatar: ' + error.message);
    }
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="space-y-3">
      {/* Avatar Preview */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
            {displayUrl ? (
              <img
                src={displayUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Loading overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1 w-full space-y-2 min-w-0">
          <div className="flex flex-col gap-2">
            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id={`avatar-upload-${userId}`}
            />
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              <Camera className="w-4 h-4 mr-2" />
              Choose Photo
            </Button>

            {currentAvatarUrl && !selectedFile && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDeleteAvatar}
                disabled={uploading}
                className="w-full text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Recommended: Square image, at least 200x200px, max 5MB
          </p>
        </div>
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

      {/* Selected File Actions */}
      {selectedFile && !uploading && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={handleUpload} 
              size="sm"
              className="flex-1 sm:flex-none flex items-center justify-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            
            <Button 
              onClick={cancelSelection} 
              variant="outline"
              size="sm"
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
