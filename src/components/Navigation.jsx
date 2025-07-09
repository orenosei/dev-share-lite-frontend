'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';

export default function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">DevShare Lite</h1>
            </Link>
            
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                href="/"
                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              <Link
                href="/posts"
                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Posts
              </Link>
              {isAuthenticated && (
                <Link
                  href="/posts/new"
                  className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Create Post
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white rounded-md transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName || user.email)}&background=6366f1&color=fff`}
                    alt={user.firstName + ' ' + user.lastName || user.email}
                  />
                  <div className="ml-2 flex flex-col">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </span>
                  </div>
                </div>                  
                <div className="relative group">
                  <button className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Account
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <Link
                      href={`/user/${user.id}`}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
