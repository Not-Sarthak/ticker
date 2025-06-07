"use client";

import React, { memo, useMemo } from 'react';
import { Chain } from '@/types';
import { useTokenStore } from '@/lib/store/token-store';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from './dropdown';

interface ChainSelectorProps {
  maxVisible?: number;
  className?: string;
}

const ChainButton = memo<{
  chain: Chain;
  onClick: (chain: Chain) => void;
}>(({ chain, onClick }) => {
  const handleClick = () => {
    onClick(chain);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center p-2 cursor-pointer rounded-lg transition-all duration-200 hover:bg-[#2E2E2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4B4B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E1E1E]"
      title={chain.name}
    >
      <Image
        src={chain.icon}
        alt={chain.name}
        width={24}
        height={24}
        className="rounded-full"
      />
    </button>
  );
});

const ChainDropdownItem = memo<{
  chain: Chain;
  onClick: (chain: Chain) => void;
}>(({ chain, onClick }) => {
  const handleClick = () => {
    onClick(chain);
  };

  return (
    <DropdownMenuItem
      onClick={handleClick}
      className="flex items-center space-x-3 px-3 py-2 cursor-pointer hover:bg-[#2E2E2E] focus:bg-[#2E2E2E] outline-none"
    >
      <Image
        src={chain.icon}
        alt={chain.name}
        width={24}
        height={24}
        className="rounded-full"
      />
      <span className="text-sm font-medium text-white">{chain.name}</span>
    </DropdownMenuItem>
  );
});

const ExpandButton = memo<{
  showAll: boolean;
  onClick: () => void;
  remainingChains: Chain[];
  onChainSelect: (chain: Chain) => void;
}>(({ showAll, onClick, remainingChains, onChainSelect }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        className="relative cursor-pointer flex items-center justify-center w-10 h-7 rounded-lg transition-all duration-200 bg-[#262420] hover:bg-[#2E2E2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4B4B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E1E1E]"
        title="More Chains"
      >
        <span className="text-[#ffd698] font-medium text-lg">+</span>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      className="w-56 bg-[#1E1E1E] border border-none cursor-pointer border-[#2E2E2E] rounded-lg shadow-xl animate-in fade-in-0 zoom-in-95"
    >
      {remainingChains.map((chain) => (
        <ChainDropdownItem
          key={chain.chainId}
          chain={chain}
          onClick={onChainSelect}
        />
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
));

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

  const { address } = useAccount();

  const { displayedChains, remainingChains } = useMemo(() => ({
    displayedChains: chains.slice(0, maxVisible),
    remainingChains: chains.slice(maxVisible)
  }), [chains, maxVisible]);

  const handleChainSelect = (chain: Chain) => {
    setSelectedChain(chain);
    fetchTokens(chain.chainId, address);
    reset();
  };

  if (chains.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {displayedChains.map((chain) => (
        <ChainButton
          key={chain.chainId}
          chain={chain}
          onClick={handleChainSelect}
        />
      ))}
      
      {remainingChains.length > 0 && (
        <ExpandButton
          showAll={showAllChains}
          onClick={() => setShowAllChains(!showAllChains)}
          remainingChains={remainingChains}
          onChainSelect={handleChainSelect}
        />
      )}
    </div>
  );
});