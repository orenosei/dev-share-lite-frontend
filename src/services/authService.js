import { apiRequest } from './baseService';

export const authService = {

  login: async (identifier, password) => {
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      
      if (data && data.id) {
        const userWithToken = { ...data, token: data.id.toString() };
        return { success: true, user: userWithToken };
      }
      
      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  },

  register: async (userData) => {
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  },

  changePassword: async (currentPassword, newPassword, token = null) => {
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      };

      if (token) {
        options.headers = {
          'Authorization': `Bearer ${token}`,
        };
      }

      const data = await apiRequest('/auth/change-password', options);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to change password' };
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const data = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to send reset email' };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const data = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to reset password' };
    }
  },

  verifyEmail: async (token) => {
    try {
      const data = await apiRequest('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to verify email' };
    }
  },


  refreshToken: async () => {
    try {
      const data = await apiRequest('/auth/refresh', {
        method: 'POST',
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to refresh token' };
    }
  },

  getCurrentUser: async () => {
    try {
      const data = await apiRequest('/auth/me');
      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to get user profile' };
    }
  },
};

export default authService;
