"use client";

import React, { memo, useState } from 'react';
import Image from 'next/image';
import { Token, Chain } from '@/types';

interface TokenIconProps {
  token: Token;
  chain?: Chain;
  size?: 'sm' | 'md';
  className?: string;
}

const FallbackCircle = ({ size }: { size: number }) => (
  <div 
    className="rounded-full bg-gray-500/20 flex items-center justify-center"
    style={{ width: size, height: size }}
  >
    <span className="text-gray-500 text-xs">{size === 24 ? '' : '?'}</span>
  </div>
);

export const TokenIcon = memo<TokenIconProps>(({ 
  token, 
  chain,
  size = 'md',
  className = "" 
}) => {
  const [tokenImgError, setTokenImgError] = useState(false);
  const [chainImgError, setChainImgError] = useState(false);

  const dimensions = {
    sm: {
      token: 24,
      chain: 14
    },
    md: {
      token: 40,
      chain: 20
    }
  };

  const { token: tokenSize, chain: chainSize } = dimensions[size];

  const shouldShowTokenFallback = tokenImgError || !token.logoURI;
  const shouldShowChainFallback = chainImgError || (chain && !chain.icon);

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {shouldShowTokenFallback ? (
        <FallbackCircle size={tokenSize} />
      ) : (
        <Image
          src={token.logoURI}
          alt={token.symbol}
          className={`w-${tokenSize/4} h-${tokenSize/4} rounded-full transition-transform group-hover:scale-105`}
          onError={() => setTokenImgError(true)}
          width={tokenSize}
          height={tokenSize}
        />
      )}
      {chain && (
        <div className="absolute -bottom-1 -right-1">
          {shouldShowChainFallback ? (
            <div className="border-2 border-[#1e2024] bg-[#1e2024]">
              <FallbackCircle size={chainSize} />
            </div>
          ) : (
            <Image
              src={chain.icon}
              alt={chain.name}
              className="rounded-full border-2 border-[#1e2024] bg-[#1e2024]"
              style={{ width: chainSize, height: chainSize }}
              onError={() => setChainImgError(true)}
              width={chainSize}
              height={chainSize}
            />
          )}
        </div>
      )}
    </div>
  );
});