"use client";

import React, { memo } from "react";
import { Token, Chain } from "@/types";
import { TokenIcon } from "./token-icon";

interface TokenListItemProps {
  token: Token;
  chain?: Chain;
  onClick: (token: Token) => void;
  className?: string;
}

export const TokenListItem = memo<TokenListItemProps>(({ 
  token, 
  chain, 
  onClick,
  className = ""
}) => {
  const handleClick = () => onClick(token);

  return (
    <button
      onClick={handleClick}
      className={`w-full p-4 py-1 px-3 text-left hover:bg-[#262830] cursor-pointer flex items-center justify-between transition-all duration-200 group ${className}`}
    >
      <div className="flex items-center">
        <TokenIcon token={token} chain={chain} className="mr-4" size="sm" />
        <div className="flex-1 flex-col -gap-1 min-w-0">
          <span className="font-semibold text-white truncate text-sm">
            {token.symbol}
          </span>
          <div className="text-xs text-[#9ca3af] truncate">
            {token.name}
          </div>
        </div>
      </div>
      <div className="text-sm text-white">
        ${(token.balanceInUsd || 0).toFixed(2)}
      </div>
    </button>
  );
});
