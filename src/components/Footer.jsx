import React from 'react';
import Link from 'next/link';

function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">DevShare Lite</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              A community platform for developers to share knowledge, ask questions, and connect with peers.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/posts" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Browse Posts
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Join Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} DevShare Lite. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;