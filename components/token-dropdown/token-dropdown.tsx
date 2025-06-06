"use client";

import React, { memo, useEffect, useMemo, useCallback, useState } from 'react';
import { Token } from '@/types';
import { useTokenStore } from '@/lib/stores/token-store';
import { useDebouncedSearch } from '@/lib/hooks/use-debounced-search';
import { SearchInput } from './search-input';
import { ChainSelector } from './chain-selector';
import { TokenList } from './token-list';

interface TokenDropdownProps {
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  userAddress?: string;
  className?: string;
  placeholder?: string;
}

const CloseButton = memo<{ onClick: () => void }>(({ onClick }) => (
  <button
    onClick={onClick}
    className="text-gray-400 hover:text-white transition-colors p-1"
  >
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path 
        fillRule="evenodd" 
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
        clipRule="evenodd"
      />
    </svg>
  </button>
));

CloseButton.displayName = 'CloseButton';

const DropdownArrow = memo<{ isOpen: boolean }>(({ isOpen }) => (
  <svg
    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
      isOpen ? "rotate-180" : ""
    }`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path 
      fillRule="evenodd" 
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
      clipRule="evenodd"
    />
  </svg>
));

DropdownArrow.displayName = 'DropdownArrow';

const SelectedTokenDisplay = memo<{ token: Token }>(({ token }) => (
  <div className="flex items-center min-w-0">
    <img
      src={token.logoURI}
      alt={token.symbol}
      className="w-8 h-8 mr-3 rounded-full flex-shrink-0"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = '/placeholder-token.png';
      }}
    />
    <div className="min-w-0">
      <div className="font-semibold text-white text-lg">{token.symbol}</div>
      <div className="text-sm text-gray-400 truncate">{token.name}</div>
    </div>
  </div>
));

SelectedTokenDisplay.displayName = 'SelectedTokenDisplay';

export const TokenDropdown = memo<TokenDropdownProps>(({
  selectedToken,
  onSelect,
  userAddress,
  className = "",
  placeholder = "Select a token"
}) => {
  // Local state for dropdown open/close - each instance independent
  const [isOpen, setIsOpen] = useState(false);

  const {
    tokens,
    searchResults,
    searchQuery,
    fetchChains,
    reset
  } = useTokenStore();

  // Initialize data on mount
  useEffect(() => {
    fetchChains();
  }, [fetchChains]);

  // Use debounced search hook
  useDebouncedSearch({ userAddress });

  const displayedTokensCount = useMemo(() => {
    const tokensToShow = searchQuery.trim() ? searchResults : tokens;
    return tokensToShow.length;
  }, [searchQuery, searchResults, tokens]);

  const handleToggleDropdown = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleCloseDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleTokenSelect = useCallback((token: Token) => {
    onSelect(token);
    setIsOpen(false);
    reset();
  }, [onSelect, reset]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-token-dropdown]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative w-80 ${className}`} data-token-dropdown>
      {/* Trigger Button */}
      <button
        onClick={handleToggleDropdown}
        className="w-full p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 hover:bg-gray-800/50 hover:border-gray-600/50"
      >
        {selectedToken ? (
          <SelectedTokenDisplay token={selectedToken} />
        ) : (
          <span className="text-gray-400 text-lg">{placeholder}</span>
        )}
        <DropdownArrow isOpen={isOpen} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={handleCloseDropdown}
          />
          
          {/* Panel */}
          <div className="absolute z-50 w-full mt-2 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-semibold text-lg">
                  Tokens ({displayedTokensCount})
                </span>
                <CloseButton onClick={handleCloseDropdown} />
              </div>

              {/* Chain Selection */}
              <ChainSelector className="mb-4" />

              {/* Search Input */}
              <SearchInput />
            </div>

            {/* Token List */}
            <TokenList onTokenSelect={handleTokenSelect} />
          </div>
        </>
      )}
    </div>
  );
});

TokenDropdown.displayName = 'TokenDropdown'; 