"use client";

import React, { memo } from 'react';
import { Token, Chain } from '@/types';
import { formatTokenBalance } from '@/lib/utils';

interface TokenListItemProps {
  token: Token;
  chain?: Chain;
  onClick: (token: Token) => void;
  className?: string;
}

const VerificationBadge = memo(() => (
  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path 
      fillRule="evenodd" 
      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
      clipRule="evenodd"
    />
  </svg>
));

VerificationBadge.displayName = 'VerificationBadge';

export const TokenListItem = memo<TokenListItemProps>(({ 
  token, 
  chain, 
  onClick, 
  className = "" 
}) => {
  const handleClick = () => {
    onClick(token);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full p-4 text-left hover:bg-gray-800/50 flex items-center transition-all duration-200 group ${className}`}
    >
      {/* Token Image with Chain Badge */}
      <div className="relative mr-4 flex-shrink-0">
        <img
          src={token.logoURI}
          alt={token.symbol}
          className="w-10 h-10 rounded-full transition-transform group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-token.png';
          }}
        />
        {chain && (
          <img
            src={chain.icon}
            alt={chain.name}
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-900 bg-gray-900"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-chain.png';
            }}
          />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-white truncate text-lg">{token.symbol}</span>
          {token.isVerified && <VerificationBadge />}
        </div>
        <div className="text-sm text-gray-400 truncate mb-1">{token.name}</div>
        {token.balance && (
          <div className="text-xs text-gray-500">
            Balance: {formatTokenBalance(token.balance)}
          </div>
        )}
      </div>
    </button>
  );
});

TokenListItem.displayName = 'TokenListItem'; 