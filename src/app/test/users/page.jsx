'use client';

import { useState, useEffect } from 'react';
import { userService } from '../../../services';

export default function UserServiceTestPage() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testFunction = async (name, testFn) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    try {
      const result = await testFn();
      setResults(prev => ({ ...prev, [name]: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, [name]: { success: false, error: error.message } }));
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  const tests = [
    {
      name: 'getAllUsers',
      label: 'Get All Users',
      fn: () => userService.getAll()
    },
    {
      name: 'getUserById',
      label: 'Get User by ID (7)',
      fn: () => userService.getById(7)
    },
    {
      name: 'getUserByUsername',
      label: 'Get User by Username (devuser)',
      fn: () => userService.getByUsername('devuser')
    },
    {
      name: 'getUserStats',
      label: 'Get User Stats (7)',
      fn: () => userService.getStats(7)
    },
    {
      name: 'searchUsers',
      label: 'Search Users (dev)',
      fn: () => userService.search('dev')
    },
    {
      name: 'getCurrentUser',
      label: 'Get Current User',
      fn: () => userService.getCurrentUser()
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Service Test</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Test all user service functions
            </p>
          </div>

          <div className="p-6">
            <div className="grid gap-4">
              {tests.map((test) => (
                <div key={test.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {test.label}
                    </h3>
                    <button
                      onClick={() => testFunction(test.name, test.fn)}
                      disabled={loading[test.name]}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {loading[test.name] ? 'Loading...' : 'Test'}
                    </button>
                  </div>
                  
                  {results[test.name] && (
                    <div className="mt-4">
                      <div className={`p-3 rounded-md text-sm ${
                        results[test.name].success 
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                          : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                      }`}>
                        <div className="font-medium mb-2">
                          {results[test.name].success ? '✅ Success' : '❌ Error'}
                        </div>
                        <pre className="whitespace-pre-wrap text-xs overflow-auto">
                          {JSON.stringify(results[test.name], null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Note:</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Make sure you're logged in as devuser to test authenticated endpoints. 
                Some functions like getCurrentUser and updateProfile require valid authentication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
