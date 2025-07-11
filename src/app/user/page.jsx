'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks';
import { userService } from '../../services';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  User, 
  Mail, 
  Calendar, 
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  FileText,
  Heart,
  MessageCircle,
  X,
  Filter
} from 'lucide-react';
import Link from 'next/link';

export default function UsersPage() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]); // Store all users from API
  const [filteredUsers, setFilteredUsers] = useState([]); // Users after client-side filtering
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Real-time search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performClientSideSearch();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, originalUsers]);

  useEffect(() => {
    if (filteredUsers.length >= 0) {
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      setUsers(paginatedUsers);
    }
  }, [filteredUsers, pagination.page, pagination.limit]);

  const performClientSideSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(originalUsers);
      updatePagination(originalUsers.length);
      return;
    }

    setIsSearching(true);
    
    const filtered = originalUsers.filter(user => {
      const fullName = getUserFullName(user).toLowerCase();
      const username = (user.username || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const bio = (user.bio || '').toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return (
        fullName.includes(searchLower) ||
        username.includes(searchLower) ||
        email.includes(searchLower) ||
        bio.includes(searchLower)
      );
    });
    
    setFilteredUsers(filtered);
    updatePagination(filtered.length);
    setPagination(prev => ({ ...prev, page: 1 }));
    
    setTimeout(() => setIsSearching(false), 150); 
  };

  const updatePagination = (totalItems) => {
    const limit = pagination.limit;
    setPagination(prev => ({
      ...prev,
      total: totalItems,
      totalPages: Math.ceil(totalItems / limit)
    }));
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching users...');
      
      const options = {};
      const result = await userService.getUsers(options);
      
      console.log('User service result:', result);
      
      if (result.success) {
        const data = result.data;
        console.log('User data:', data);
        
        const usersArray = Array.isArray(data) ? data : data.users || [];
        setOriginalUsers(usersArray); // Store original data
        setAllUsers(usersArray);
        setFilteredUsers(usersArray); // Initially show all users
        
        // Set pagination info
        updatePagination(usersArray.length);
        setPagination(prev => ({ ...prev, page: 1 }));
      } else {
        console.error('Failed to fetch users:', result.error);
        setError(result.error || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


  const clearSearch = () => {
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getUserFullName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || user.username || user.email;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && pagination.page === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
        <div className="max-w-8xl mx-auto">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-3xl mx-auto mb-6"></div>
              <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl mb-4 max-w-md mx-auto"></div>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl max-w-2xl mx-auto"></div>
            </div>
            
            {/* Search skeleton */}
            <div className="max-w-xl mx-auto mb-10">
              <div className="flex gap-4">
                <div className="flex-1 h-14 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl"></div>
                <div className="w-32 h-14 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl"></div>
              </div>
            </div>
            
            {/* Grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full mr-4"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg mb-2"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-3/4"></div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-5/6"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl"></div>
                    ))}
                  </div>
                  <div className="h-11 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mb-6">
              <User className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed max-w-md mx-auto">{error}</p>
            <Button 
              onClick={fetchUsers}
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl mb-6 shadow-lg">
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
            Community Members
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Discover and connect with talented developers, designers, and creators from around the world
          </p>
        </div>

        {/* Search */}
        <div className="mb-10">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                <Input
                  type="text"
                  placeholder="Search users by name, username, email, or bio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-12 h-14 text-base border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 transition-all duration-200 hover:shadow-md focus:shadow-lg"
                />
                {/* Clear button */}
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                
                {/* Loading indicator */}
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              {/* Search suggestions or tips */}
              {searchTerm && searchTerm.length > 0 && searchTerm.length < 3 && (
                <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg shadow-sm z-20">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    💡 Type at least 3 characters for better search results
                  </p>
                </div>
              )}
            </div>
            
            {/* Search info */}
            {searchTerm && filteredUsers.length >= 0 && !loading && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} matching "{searchTerm}"</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Users Grid */}
        {users.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
              {searchTerm ? (
                <Search className="h-12 w-12 text-gray-400" />
              ) : (
                <User className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              {searchTerm ? 'No matching users found' : 'No users found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              {searchTerm 
                ? `No users match your search for "${searchTerm}". Try using different keywords.`
                : 'No users are available at the moment. Please check back later.'
              }
            </p>
            {searchTerm && (
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={clearSearch}
                  variant="outline"
                  className="px-6 py-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Search
                </Button>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    fetchUsers();
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Show All Users
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {users.map((user, index) => (
              <div
                key={user.id}
                className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all duration-300 transform hover:scale-105 animate-fade-in"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                <div className="flex items-center mb-6">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={`${getUserFullName(user)}'s avatar`}
                      className="w-16 h-16 rounded-full object-cover mr-4 ring-4 ring-gray-100 dark:ring-gray-700 group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all duration-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center mr-4 ring-4 ring-gray-100 dark:ring-gray-700 group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all duration-200">
                      <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {getUserFullName(user)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      @{user.username}
                    </p>
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4 mr-3 flex-shrink-0 text-blue-500" />
                    <span className="truncate font-medium">{user.email}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-3 flex-shrink-0 text-green-500" />
                    <span className="font-medium">Joined {formatDate(user.createdAt)}</span>
                  </div>

                  {user.phone && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4 mr-3 flex-shrink-0 text-purple-500" />
                      <span className="truncate font-medium">{user.phone}</span>
                    </div>
                  )}

                  {(user.address?.city || user.address?.country) && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-3 flex-shrink-0 text-red-500" />
                      <span className="truncate font-medium">
                        {[user.address?.city, user.address?.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                {user._count && (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-blue-900 dark:text-blue-100">{user._count.posts || 0}</div>
                      <div className="text-xs text-blue-700 dark:text-blue-300">Posts</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl">
                      <Heart className="h-5 w-5 text-red-600 dark:text-red-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-red-900 dark:text-red-100">{user._count.likes || 0}</div>
                      <div className="text-xs text-red-700 dark:text-red-300">Likes</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                      <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                      <div className="text-lg font-bold text-green-900 dark:text-green-100">{user._count.comments || 0}</div>
                      <div className="text-xs text-green-700 dark:text-green-300">Comments</div>
                    </div>
                  </div>
                )}

                {/* Bio */}
                {user.bio && (
                  <div className="mb-6">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
                        {user.bio.replace(/[#*`]/g, '').substring(0, 120)}
                        {user.bio.length > 120 && '...'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <Link href={`/user/${user.id}`} className="flex-1 mr-3">
                    <Button variant="outline" className="w-full h-11 font-semibold border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
                      View Profile
                    </Button>
                  </Link>
                  
                  {currentUser && currentUser.id === user.id && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold px-3 py-1">
                      You
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 mt-12">
            <Button
              variant="outline"
              disabled={pagination.page === 1 || loading}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="h-12 px-6 font-semibold rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else {
                  const start = Math.max(1, pagination.page - 2);
                  const end = Math.min(pagination.totalPages, start + 4);
                  pageNum = start + i;
                  if (pageNum > end) return null;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={`h-12 w-12 rounded-xl font-semibold transition-all duration-200 ${
                      pagination.page === pageNum 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105' 
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              }).filter(Boolean)}
              
              {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
                <>
                  <span className="text-gray-500 px-2">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={loading}
                    className="h-12 w-12 rounded-xl font-semibold border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    {pagination.totalPages}
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              disabled={pagination.page === pagination.totalPages || loading}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="h-12 px-6 font-semibold rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Results Info */}
        {users.length > 0 && (
          <div className="text-center mt-8 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Showing <span className="font-bold text-blue-600 dark:text-blue-400">{users.length}</span> of <span className="font-bold text-blue-600 dark:text-blue-400">{pagination.total}</span> members
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
