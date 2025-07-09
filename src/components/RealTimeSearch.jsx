'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { userService, postsService } from '../services';
import { 
  Search, 
  Clock, 
  TrendingUp, 
  X, 
  Command,
  Hash,
  User as UserIcon
} from 'lucide-react';

export default function RealTimeSearch({ 
  onSearch, 
  onTagClick, 
  placeholder = "Search posts, tags, or users...",
  className = "" 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const searchRef = useRef(null);
  const suggestionRefs = useRef([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Debounced search
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        fetchSuggestions(searchTerm);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (term) => {
    setIsLoading(true);
    try {
      const [postsResult, tagsResult, usersResult] = await Promise.all([
        postsService.searchPosts(term, { limit: 3 }),
        postsService.getTags(),
        userService.getUsers({ search: term, limit: 3 })
      ]);

      const postsData = postsResult.success ? postsResult.data : { posts: [] };
      const tagsData = tagsResult.success ? tagsResult.data : [];

      const usersData = usersResult.success ? usersResult.data : [];

      const postSuggestions = postsData.posts?.map(post => ({
        type: 'post',
        title: post.title,
        subtitle: `by ${post.user?.firstName} ${post.user?.lastName}`,
        value: post.title,
        id: post.id
      })) || [];

      const tagSuggestions = tagsData
        .filter(tag => tag.name.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 3)
        .map(tag => ({
          type: 'tag',
          title: `#${tag.name}`,
          subtitle: `${tag._count?.posts || 0} posts`,
          value: tag.name,
          id: tag.id
        }));

      const userSuggestions = usersData
        .filter(user => 
          user.username?.toLowerCase().includes(term.toLowerCase()) ||
          user.firstName?.toLowerCase().includes(term.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(term.toLowerCase())
        )
        .slice(0, 3)
        .map(user => ({
          type: 'user',
          title: `${user.firstName} ${user.lastName}`,
          subtitle: `@${user.username}`,
          value: user.username,
          id: user.id
        }));

      setSuggestions([...postSuggestions, ...tagSuggestions, ...userSuggestions]);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
    setActiveIndex(-1);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleSearch = (term = searchTerm) => {
    if (!term.trim()) return;
    
    saveToRecentSearches(term);
    onSearch(term);
    setShowSuggestions(false);
    setSearchTerm(term);
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'tag') {
      onTagClick(suggestion.value);
    } else if (suggestion.type === 'user') {
      onSearch(`author:${suggestion.value}`);
    } else {
      handleSearch(suggestion.value);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    const totalItems = suggestions.length + recentSearches.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          if (activeIndex < suggestions.length) {
            handleSuggestionClick(suggestions[activeIndex]);
          } else {
            handleSearch(recentSearches[activeIndex - suggestions.length]);
          }
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveIndex(-1);
        break;
    }
  };

  const saveToRecentSearches = (term) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'tag':
        return <Hash className="h-4 w-4 text-blue-500" />;
      case 'user':
        return <UserIcon className="h-4 w-4 text-green-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-12"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setSearchTerm('');
              setSuggestions([]);
              setShowSuggestions(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (searchTerm.length >= 2 || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <span className="text-sm">Searching...</span>
            </div>
          )}

          {/* Suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="p-2 text-xs font-medium text-gray-500 bg-gray-50 flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Suggestions ({suggestions.length})
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`suggestion-${index}`}
                  ref={el => suggestionRefs.current[index] = el}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 flex items-center gap-3 ${
                    index === activeIndex ? 'bg-gray-50' : ''
                  }`}
                >
                  {getIconForType(suggestion.type)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{suggestion.title}</div>
                    <div className="text-xs text-gray-500 truncate">{suggestion.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results Message */}
          {!isLoading && searchTerm.length >= 2 && suggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <div className="text-sm">No results found for "{searchTerm}"</div>
              <div className="text-xs text-gray-400 mt-1">Try different keywords or check your spelling</div>
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="p-2 text-xs font-medium text-gray-500 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={`recent-${index}`}
                  ref={el => suggestionRefs.current[suggestions.length + index] = el}
                  onClick={() => handleSearch(search)}
                  className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 flex items-center gap-3 ${
                    suggestions.length + index === activeIndex ? 'bg-gray-50' : ''
                  }`}
                >
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Keyboard Shortcuts Help */}
          {(suggestions.length > 0 || recentSearches.length > 0) && (
            <div className="p-2 text-xs text-gray-400 bg-gray-50 border-t">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Command className="h-3 w-3" />
                  ↑↓ to navigate
                </span>
                <span>Enter to search</span>
                <span>Esc to close</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
