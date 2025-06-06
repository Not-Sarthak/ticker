"use client";

import React, { memo } from 'react';
import { useTokenStore } from '@/lib/stores/token-store';

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export const SearchInput = memo<SearchInputProps>(({ 
  placeholder = "Search tokens...",
  className = ""
}) => {
  const { searchQuery, setSearchQuery } = useTokenStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <svg 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path 
          fillRule="evenodd" 
          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
          clipRule="evenodd"
        />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
      />
    </div>
  );
});

SearchInput.displayName = 'SearchInput'; 