"use client";

import React, { memo } from 'react';
import Image from 'next/image';
import { Token, Chain } from '@/types';

interface TokenIconProps {
  token: Token;
  chain?: Chain;
  size?: 'sm' | 'md';
  className?: string;
}

export const TokenIcon = memo<TokenIconProps>(({ 
  token, 
  chain,
  size = 'md',
  className = "" 
}) => {
  const dimensions = {
    sm: {
      token: 24,
      chain:14
    },
    md: {
      token: 40,
      chain: 20
    }
  };

  const { token: tokenSize, chain: chainSize } = dimensions[size];

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <Image
        src={token.logoURI}
        alt={token.symbol}
        className={`w-${tokenSize/4} h-${tokenSize/4} rounded-full transition-transform group-hover:scale-105`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '';
        }}
        width={tokenSize}
        height={tokenSize}
      />
      {chain && (
        <Image
          src={chain.icon}
          alt={chain.name}
          className="absolute -bottom-1 -right-1 rounded-full border-2 border-[#1e2024] bg-[#1e2024]"
          style={{ width: chainSize, height: chainSize }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '';
          }}
          width={chainSize}
          height={chainSize}
        />
      )}
    </div>
  );
});