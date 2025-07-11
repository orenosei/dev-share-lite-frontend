import { apiRequest } from './baseService';

export const uploadService = {
  // Upload images for post
  uploadPostImages: async (postId, files) => {
    try {
      console.log('uploadPostImages called with:', { postId, files });
      
      const formData = new FormData();
      
      // Add files to FormData
      Array.from(files).forEach((file, index) => {
        console.log(`Adding file ${index}:`, file.name, file.type, file.size);
        formData.append('images', file);
      });

      console.log('FormData created, making API request to:', `/posts/${postId}/images`);
      
      const data = await apiRequest(`/posts/${postId}/images`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let browser handle it for FormData
        headers: {}
      });
      
      console.log('API response:', data);
      return { success: true, data };
    } catch (error) {
      console.error('uploadPostImages error:', error);
      return { success: false, error: error.message || 'Failed to upload images' };
    }
  },

  // Delete post image
  deletePostImage: async (postId, imageId, userId) => {
    try {
      const data = await apiRequest(`/posts/${postId}/images/${imageId}`, {
        method: 'DELETE',
        body: JSON.stringify({ userId: userId.toString() }),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to delete image' };
    }
  },

  // Upload user avatar
  uploadAvatar: async (userId, file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const data = await apiRequest(`/users/${userId}/avatar`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let browser handle it for FormData
        headers: {}
      });
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to upload avatar' };
    }
  },

  // Delete user avatar
  deleteAvatar: async (userId) => {
    try {
      const data = await apiRequest(`/users/${userId}/avatar`, {
        method: 'DELETE',
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to delete avatar' };
    }
  }
};
