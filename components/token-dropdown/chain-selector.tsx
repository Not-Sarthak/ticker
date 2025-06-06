"use client";

import React, { memo, useMemo } from 'react';
import { Chain } from '@/types';
import { useTokenStore } from '@/lib/stores/token-store';

interface ChainSelectorProps {
  maxVisible?: number;
  className?: string;
}

const ChainButton = memo<{
  chain: Chain;
  isSelected: boolean;
  onClick: (chain: Chain) => void;
}>(({ chain, isSelected, onClick }) => {
  const handleClick = () => {
    onClick(chain);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-3 rounded-lg transition-all duration-200 relative overflow-hidden group ${
        isSelected
          ? 'bg-blue-600/20 border border-blue-500/50 ring-1 ring-blue-500/30'
          : 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50'
      }`}
      title={chain.name}
    >
      <img
        src={chain.icon}
        alt={chain.name}
        className="w-7 h-7 rounded-full mx-auto transition-transform group-hover:scale-105"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder-chain.png';
        }}
      />
      {isSelected && (
        <div className="absolute inset-0 bg-blue-500/10 rounded-lg" />
      )}
    </button>
  );
});

ChainButton.displayName = 'ChainButton';

const ExpandButton = memo<{
  showAll: boolean;
  onClick: () => void;
}>(({ showAll, onClick }) => (
  <button
    onClick={onClick}
    className="p-3 bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50 rounded-lg transition-all duration-200"
    title={showAll ? 'Show less' : 'Show all chains'}
  >
    <div className="w-7 h-7 flex items-center justify-center">
      {showAll ? (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path 
            fillRule="evenodd" 
            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" 
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <span className="text-white font-bold text-lg">+</span>
      )}
    </div>
  </button>
));

ExpandButton.displayName = 'ExpandButton';

export const ChainSelector = memo<ChainSelectorProps>(({ 
  maxVisible = 7, 
  className = "" 
}) => {
  const {
    chains,
    selectedChain,
    showAllChains,
    setSelectedChain,
    setShowAllChains,
    fetchTokens,
    reset
  } = useTokenStore();

  const displayedChains = useMemo(() => 
    showAllChains ? chains : chains.slice(0, maxVisible),
    [chains, showAllChains, maxVisible]
  );

  const handleChainSelect = (chain: Chain) => {
    setSelectedChain(chain);
    fetchTokens(chain.chainId);
    reset();
  };

  const toggleShowAll = () => {
    setShowAllChains(!showAllChains);
  };

  if (chains.length === 0) {
    return null;
  }

  return (
    <div className={`grid grid-cols-4 gap-3 ${className}`}>
      {displayedChains.map((chain) => (
        <ChainButton
          key={chain.chainId}
          chain={chain}
          isSelected={selectedChain?.chainId === chain.chainId}
          onClick={handleChainSelect}
        />
      ))}
      
      {chains.length > maxVisible && (
        <ExpandButton
          showAll={showAllChains}
          onClick={toggleShowAll}
        />
      )}
    </div>
  );
});

ChainSelector.displayName = 'ChainSelector'; 