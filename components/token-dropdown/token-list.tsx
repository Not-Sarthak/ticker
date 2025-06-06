"use client";

import React, { memo, useMemo } from 'react';
import { Token } from '@/types';
import { useTokenStore } from '@/lib/stores/token-store';
import { TokenListItem } from './token-list-item';

interface TokenListProps {
  onTokenSelect: (token: Token) => void;
  className?: string;
}

const ShimmerTokenItem = memo(() => (
  <div className="p-4 flex items-center space-x-3 animate-pulse">
    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-700 rounded w-24"></div>
      <div className="h-3 bg-gray-700 rounded w-16"></div>
    </div>
    <div className="w-16 h-4 bg-gray-700 rounded"></div>
  </div>
));

const EmptyState = memo<{ message: string }>(({ message }) => (
  <div className="p-8 text-center">
    <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
      </svg>
    </div>
    <div className="text-gray-400 text-sm">{message}</div>
  </div>
));

export const TokenList = memo<TokenListProps>(({ 
  onTokenSelect, 
  className = "" 
}) => {
  const {
    tokens,
    searchResults,
    searchQuery,
    loading,
    chains
  } = useTokenStore();

  const { displayedTokens, emptyMessage } = useMemo(() => {
    const isSearching = searchQuery.trim().length > 0;
    const tokensToShow = isSearching ? searchResults : tokens;
    
    const message = "No Results Found"

    return {
      displayedTokens: tokensToShow,
      emptyMessage: message
    };
  }, [searchQuery, searchResults, tokens]);

  const tokenListItems = useMemo(() => {
    return displayedTokens.map((token) => {
      const tokenChain = chains.find(chain => chain.chainId === token.chainId);
      
      return (
        <TokenListItem
          key={`${token.chainId}-${token.address}`}
          token={token}
          chain={tokenChain}
          onClick={onTokenSelect}
        />
      );
    });
  }, [displayedTokens, chains, onTokenSelect]);

  return (
    <div className={`max-h-80 overflow-y-auto ${className}`}>
      {loading ? (
        <div className="divide-y divide-gray-800/50">
          {[...Array(5)].map((_, index) => (
            <ShimmerTokenItem key={index} />
          ))}
        </div>
      ) : displayedTokens.length > 0 ? (
        <div className="divide-y divide-gray-800/50">
          {tokenListItems}
        </div>
      ) : (
        <EmptyState message={emptyMessage} />
      )}
    </div>
  );
});