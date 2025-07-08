'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    identifier: '', // Can be username or email
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Get redirect URL from search params or sessionStorage
  const getRedirectUrl = () => {
    const redirectParam = searchParams.get('redirect');
    const redirectFromStorage = typeof window !== 'undefined' ? sessionStorage.getItem('redirectAfterLogin') : null;
    return redirectParam || redirectFromStorage || '/';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Username or email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(formData.identifier, formData.password);

      if (result.success) {
        alert('Login successful!');
        setFormData({
          identifier: '',
          password: '',
        });
        
        // Clear redirect from sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('redirectAfterLogin');
        }
        
        // Redirect to the original page or home
        const redirectUrl = getRedirectUrl();
        router.push(redirectUrl);
      } else {
        if (result.error) {
          setErrors({ general: result.error });
        } else {
          setErrors({ general: 'Login failed. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Network error. Please check your connection.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
            </a>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {errors.general}
              </div>
            )}

            {/* Username or Email */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Username or Email
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                value={formData.identifier}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.identifier ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter your username or email"
              />
              {errors.identifier && (
                <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <div className="text-sm text-gray-600 text-center">
                <p>Test with:</p>
                <p><strong>Username:</strong> testuser | <strong>Password:</strong> password123</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
