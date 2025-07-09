'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { postsService } from '../services';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  User,
  Tag,
  X,
  Clock,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdvancedSearchModal({ 
  onSearch, 
  initialSearchTerm = '', 
  initialFilters = {},
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [filters, setFilters] = useState({
    author: '',
    tags: [],
    dateFrom: null,
    dateTo: null,
    sortBy: 'latest',
    ...initialFilters
  });
  
  const [suggestions, setSuggestions] = useState([]);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [filteredTagSuggestions, setFilteredTagSuggestions] = useState([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [showDateFrom, setShowDateFrom] = useState(false);
  const [showDateTo, setShowDateTo] = useState(false);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    
    // Load tag suggestions
    fetchTagSuggestions();
  }, []);

  useEffect(() => {
    // Filter tag suggestions based on search term
    if (tagSearchTerm.trim()) {
      const filtered = tagSuggestions.filter(tag => 
        tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase())
      );
      setFilteredTagSuggestions(filtered);
    } else {
      setFilteredTagSuggestions(tagSuggestions.slice(0, 10)); // Show top 10 by default
    }
  }, [tagSearchTerm, tagSuggestions]);

  useEffect(() => {
    // Debounced search suggestions
    const timer = setTimeout(() => {
      if (searchTerm.length > 2) {
        fetchSearchSuggestions(searchTerm);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchTagSuggestions = async () => {
    try {
      const result = await postsService.getTags();
      if (result.success) {
        setTagSuggestions(result.data);
        setFilteredTagSuggestions(result.data.slice(0, 10)); // Show top 10 initially
      }
    } catch (err) {
      console.error('Error fetching tag suggestions:', err);
    }
  };

  const fetchSearchSuggestions = async (term) => {
    try {
      const result = await postsService.searchPosts(term, { limit: 5 });
      if (result.success) {
        const titles = result.data.posts?.map(post => post.title) || [];
        setSuggestions(titles);
      }
    } catch (err) {
      console.error('Error fetching search suggestions:', err);
    }
  };

  const saveToRecentSearches = (term) => {
    if (!term.trim()) return;
    
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = () => {
    saveToRecentSearches(searchTerm);
    onSearch({
      searchTerm,
      filters
    });
    setIsOpen(false);
  };

  const handleQuickSearch = (term) => {
    setSearchTerm(term);
    saveToRecentSearches(term);
    onSearch({
      searchTerm: term,
      filters
    });
    setIsOpen(false);
  };

  const addTag = (tagName) => {
    if (!filters.tags.includes(tagName)) {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, tagName]
      }));
    }
  };

  const removeTag = (tagName) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagName)
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      author: '',
      tags: [],
      dateFrom: null,
      dateTo: null,
      sortBy: 'latest'
    });
    setSearchTerm('');
    setTagSearchTerm('');
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Filter className="h-4 w-4 mr-2" />
          Advanced Search
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Posts</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search"
                type="text"
                placeholder="Search by title, content, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-sm">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSearch(suggestion)}
                    className="w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Searches
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                    onClick={() => handleQuickSearch(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Author Filter */}
          <div className="space-y-2">
            <Label htmlFor="author" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Author
            </Label>
            <Input
              id="author"
              type="text"
              placeholder="Search by author username..."
              value={filters.author}
              onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
            />
          </div>

          {/* Tags Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </Label>
            
            {/* Selected Tags */}
            {filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {filters.tags.map((tag) => (
                  <Badge key={tag} variant="default" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900 rounded"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Tag Search Input */}
            <div className="relative mb-2">
              <Input
                type="text"
                placeholder="Search tags..."
                value={tagSearchTerm}
                onChange={(e) => setTagSearchTerm(e.target.value)}
                className="pr-8"
              />
              {tagSearchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setTagSearchTerm('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Tag Suggestions */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-2 max-h-40 overflow-y-auto bg-white dark:bg-gray-800">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                {tagSearchTerm ? `Search results (${filteredTagSuggestions.length})` : 'Popular Tags'}
              </div>
              <div className="flex flex-wrap gap-1">
                {filteredTagSuggestions.length > 0 ? (
                  filteredTagSuggestions.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-xs ${
                        filters.tags.includes(tag.name) ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600' : ''
                      }`}
                      onClick={() => addTag(tag.name)}
                    >
                      {tag.name} ({tag._count?.posts || 0})
                    </Badge>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 dark:text-gray-400 py-2">
                    {tagSearchTerm ? 'No tags found' : 'No tags available'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Popover open={showDateFrom} onOpenChange={setShowDateFrom}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {filters.dateFrom ? format(filters.dateFrom, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => {
                      setFilters(prev => ({ ...prev, dateFrom: date }));
                      setShowDateFrom(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover open={showDateTo} onOpenChange={setShowDateTo}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {filters.dateTo ? format(filters.dateTo, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => {
                      setFilters(prev => ({ ...prev, dateTo: date }));
                      setShowDateTo(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Sort and Status */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest Posts</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="oldest">Oldest Posts</SelectItem>
                  <SelectItem value="mostCommented">Most Commented</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSearch} className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
