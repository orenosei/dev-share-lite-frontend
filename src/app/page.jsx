'use client';

import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Welcome to{' '}
          <span className="text-indigo-600">DevShare Lite</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          A community platform for developers to share knowledge, ask questions, and connect with peers.
        </p>
        
        {isAuthenticated ? (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Welcome back, {user.firstName || user.username}! 👋
            </h2>
            <div className="max-w-lg mx-auto">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                  href="/posts"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-base font-medium"
                >
                  Browse Posts
                </Link>
                <Link
                  href="/posts/new"
                  className="bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-600 px-6 py-3 rounded-md text-base font-medium"
                >
                  Create Post
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <div className="max-w-lg mx-auto">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                  href="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-base font-medium"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-600 px-6 py-3 rounded-md text-base font-medium"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-indigo-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Share Knowledge</h3>
            <p className="mt-2 text-base text-gray-500">
              Share your coding experiences, tips, and solutions with the community.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-indigo-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Learn Together</h3>
            <p className="mt-2 text-base text-gray-500">
              Ask questions, get answers, and learn from experienced developers.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-indigo-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Build Community</h3>
            <p className="mt-2 text-base text-gray-500">
              Connect with like-minded developers and build lasting professional relationships.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
