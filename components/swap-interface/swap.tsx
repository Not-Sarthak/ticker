"use client";

import React, { useEffect, useState } from "react";
import { Repeat } from "lucide-react";
import { Token, TokenDropdown } from "../token-dropdown";
import { Button } from "../buttons/button";

const SwapUI: React.FC = () => {
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [conversionRate, setConversionRate] = useState<number>(2);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch(
          "https://tokens.jup.ag/tokens?tags=verified"
        );
        const data = await response.json();
        setTokens(data);
      } catch (error) {
        console.error("Failed to fetch tokens", error);
      }
    };
    fetchTokens();
  }, []);

  useEffect(() => {
    const fetchSolBalance = async () => {
      try {
        setSolBalance(100); // mock value or fetch actual
      } catch (error) {
        console.error("Failed to fetch SOL balance", error);
      }
    };
    fetchSolBalance();
  }, []);

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    const numeric = parseFloat(value);
    if (!isNaN(numeric)) {
      setToAmount((numeric * conversionRate).toFixed(6));
    } else {
      setToAmount("");
    }
  };

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);

    const newFromAmount = toAmount;
    const newRate = conversionRate !== 0 ? 1 / conversionRate : conversionRate;

    setFromAmount(newFromAmount);
    setToAmount(
      newFromAmount && !isNaN(parseFloat(newFromAmount))
        ? (parseFloat(newFromAmount) * newRate).toFixed(6)
        : ""
    );

    setConversionRate(newRate);
  };

  const handleMaxClick = () => {
    const max = solBalance;
    setFromAmount(max.toString());
    setToAmount((max * conversionRate).toFixed(6));
  };

  const handleHalfClick = () => {
    const half = solBalance / 2;
    setFromAmount(half.toString());
    setToAmount((half * conversionRate).toFixed(6));
  };

  return (
    <div className="p-4 rounded-lg max-w-[600px] mx-auto bg-[#F7F7F7] shadow-md">
      <div className="-space-y-3">
        <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">You’re selling</span>
            <div className="flex space-x-2">
              <div className="px-2 py-1 bg-gray-200 text-[#6E6E6E] text-xs rounded-md">
                {parseFloat(fromAmount || "0").toFixed(2)}
              </div>
              <button
                onClick={handleHalfClick}
                className="px-2 py-1 bg-gray-200 text-xs rounded-md"
              >
                HALF
              </button>
              <button
                onClick={handleMaxClick}
                className="px-2 py-1 bg-gray-200 text-xs rounded-md"
              >
                MAX
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <TokenDropdown
              selectedToken={fromToken}
              onSelect={setFromToken}
              tokens={tokens}
            />
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              className="bg-transparent text-right outline-none text-gray-900 w-1/2"
              placeholder="0.00"
              min="0"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <div
            onClick={handleSwapTokens}
            className="bg-white cursor-pointer p-2 rounded-md transition-colors"
          >
            <Repeat className="rotate-90 text-[#6E6E6E]" />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">You’re buying</span>
          </div>
          <div className="flex items-center justify-between">
            <TokenDropdown
              selectedToken={toToken}
              onSelect={setToToken}
              tokens={tokens}
            />
            <div className="flex flex-col justify-end items-end pr-3">
              <div className="px-2 py-1 bg-gray-200 text-[#6E6E6E] text-xs rounded-md">
                {parseFloat(fromAmount || "0").toFixed(2)}
              </div>
              <input
                type="number"
                value={toAmount}
                readOnly
                className="bg-transparent outline-none text-right text-gray-900 w-full mt-1"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className={`mt-4 ${
          fromAmount && fromToken && toToken
            ? "cursor-pointer"
            : "cursor-not-allowed"
        }`}
      >
        <Button
          variant="default"
          size="lg"
          disabled={!fromAmount || !fromToken || !toToken}
        >
          {fromAmount ? "Swap" : "Enter an amount"}
        </Button>
      </div>
    </div>
  );
};

export default SwapUI;
