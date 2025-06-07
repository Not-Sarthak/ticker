"use client";

import React, { memo, useEffect, useCallback, useState } from "react";
import { Token } from "@/types";
import { useTokenStore } from "@/lib/store/token-store";
import { useDebouncedSearch } from "@/lib/hooks/use-debounced-search";
import { useAccount } from 'wagmi';
import { SearchInput } from "./search-input";
import { ChainSelector } from "./chain-selector";
import { TokenList } from "./token-list";
import { TokenIcon } from "./token-icon";
import { stockTokens } from "@/lib/stock-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "./dropdown";

interface TokenDropdownProps {
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  className?: string;
  placeholder?: string;
  defaultTab?: "featured" | "all";
}

const SelectedTokenDisplay = memo<{ token: Token }>(({ token }) => {
  const { chains } = useTokenStore();
  const chain = chains.find((c) => c.chainId === token.chainId);

  return (
    <div className="flex items-center min-w-0 cursor-pointer w-24">
      <TokenIcon token={token} chain={chain} size="sm" className="mr-3" />
      <div className="min-w-0">
        <div className="font-semibold text-white">{token.symbol}</div>
      </div>
    </div>
  );
});

export const TokenDropdown = memo<TokenDropdownProps>(
  ({
    selectedToken,
    onSelect,
    className = "",
    placeholder = "Select Token",
    defaultTab = "all"
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { fetchChains, reset } = useTokenStore();
    const { address } = useAccount();

    useEffect(() => {
      fetchChains();
    }, [fetchChains]);

    useDebouncedSearch({ userAddress: address });

    const handleTokenSelect = useCallback(
      (token: Token) => {
        onSelect(token);
        setIsOpen(false);
        reset();
      },
      [onSelect, reset]
    );

    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button className="min-w-30 cursor-pointer font-[var(--font-inter)] py-2 text-white px-2 bg-[#24262a] rounded-full text-sm flex items-center justify-between text-left focus:outline-none">
            {selectedToken ? (
              <SelectedTokenDisplay token={selectedToken} />
            ) : (
              <span className="text-white">{placeholder}</span>
            )}
            <svg
              className={`w-5 h-5 text-[#9ca3af] transition-transform duration-200 ${
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
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[320px] cursor-pointer p-0 bg-[#1e2024] font-[var(--font-inter)] border border-[#2e2f34] rounded-xl shadow-xl max-h-[400px]">
          <div className="p-4 pb-2 border-b border-[#2e2f34]">
            <SearchInput />
            <ChainSelector className="mt-2" />
          </div>

          <Tabs defaultValue={defaultTab} className="w-full flex flex-col h-[calc(400px-100px)]">
            <TabsList className="w-full flex p-2 bg-[#24262a] border-b border-[#2e2f34]">
              <TabsTrigger value="featured" className="flex-1 hover:scale-95 transition-all duration-200 cursor-pointer">Featured</TabsTrigger>
              <TabsTrigger value="all" className="flex-1 hover:scale-95 transition-all duration-200 cursor-pointer">All</TabsTrigger>
            </TabsList>
            <TabsContent value="featured" className="flex-1 overflow-y-auto">
              <TokenList 
                onTokenSelect={handleTokenSelect} 
                tokens={stockTokens.map(token => ({
                  ...token,
                  address: token.tokenAddress
                }))} 
              />
            </TabsContent>
            <TabsContent value="all" className="flex-1 overflow-y-auto">
              <TokenList onTokenSelect={handleTokenSelect} />
            </TabsContent>
          </Tabs>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);
