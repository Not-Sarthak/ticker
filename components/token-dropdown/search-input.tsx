"use client";

import React, { memo, useCallback } from 'react';
import { useTokenStore } from '@/lib/store/token-store';
import debounce from 'lodash/debounce';

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export const SearchInput = memo<SearchInputProps>(({ 
  placeholder = "Example: USDC Optimism",
  className = ""
}) => {
  const { searchQuery, setSearchQuery, searchTokens } = useTokenStore();

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      searchTokens(query);
    }, 300),
    [searchTokens]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  return (
    <div className={`relative ${className}`}>
      <svg 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#ffffff]" 
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
        className="w-full pl-10 py-1 text-sm bg-[#262830] border border-[#2e2f34] rounded-lg text-white placeholder-[#ffffff] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all duration-200"
      />
    </div>
  );
});