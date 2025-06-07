"use client";

import React, { memo, useMemo } from 'react';
import { Token } from '@/types';
import { useTokenStore } from '@/lib/stores/token-store';
import { TokenListItem } from './token-list-item';

interface TokenListProps {
  onTokenSelect: (token: Token) => void;
  tokens?: Token[];
  className?: string;
}

export const TokenList = memo<TokenListProps>(({ 
  onTokenSelect, 
  tokens,
  className = "" 
}) => {
  const {
    tokens: filteredTokens,
    searchResults,
    searchQuery,
    chains
  } = useTokenStore();

  const displayTokens = tokens ?? filteredTokens ?? [];

  const tokenListItems = useMemo(() => {
    return displayTokens.map((token: Token) => {
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
  }, [displayTokens, chains, onTokenSelect]);

  return (
    <div className={`overflow-y-auto ${className}`}>
      {displayTokens.length > 0 ? (
        <div className="divide-y divide-gray-800/50">
          {tokenListItems}
        </div>
      ) : null}
    </div>
  );
});