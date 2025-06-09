"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Wallet } from "lucide-react";
import { TokenDropdown } from "../token-dropdown";
import { smoothEasing } from "@/lib/animation";
import { TextAnimate } from "../text-animate";
import { isValidEvmAddress } from "@/lib/utils";
import { useTokenBalance } from "@/lib/hooks/use-token-balance";
import { Shimmer } from "../ui/shimmer";
import { useSwapStore } from "@/lib/store/swap-store";
import { QuoteDisplay } from "./quote-display";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { useBridgeStore } from "@/lib/store/bridge-store";
import { Button } from "../buttons/button";
import { sdk } from '@farcaster/frame-sdk'
import { getTxHash } from '@/lib/api/api';
import { createClient } from '@/lib/supabase/client';
import { useTokenPrice } from "@/lib/hooks/use-token-price";

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const SwapUI: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [localFromAmount, setLocalFromAmount] = useState("");
  const { address, connector } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    recipientAddress,
    isValidAddress,
    showRecipientInput,
    setFromToken,
    setToToken,
    setFromAmount,
    setToAmount,
    setRecipientAddress,
    setIsValidAddress,
    setShowRecipientInput,
    setUserAddress,
    fetchQuote,
    quoteData,
    quoteLoading,
  } = useSwapStore();

  const {
    handleBridge,
    isBridging,
    bridgeStatus,
    error: bridgeError,
    requestHash,
  } = useBridgeStore();

  const fromTokenPrice = useTokenPrice(fromToken);
  const toTokenPrice = useTokenPrice(toToken);

  // Debounce the local fromAmount
  const debouncedFromAmount = useDebounce(localFromAmount, 500);

  useEffect(() => {
    if (address) {
      setUserAddress(address);
    }
  }, [address, setUserAddress]);

  const { balance: fromBalance, isLoading: isLoadingFromBalance } =
    useTokenBalance(fromToken);
  const { balance: toBalance, isLoading: isLoadingToBalance } =
    useTokenBalance(toToken);

  const handleFromAmountChange = (value: string) => {
    setLocalFromAmount(value);
  };

  // Update global fromAmount when debounced value changes
  useEffect(() => {
    setFromAmount(debouncedFromAmount);
  }, [debouncedFromAmount, setFromAmount]);

  // Reset amounts when tokens change
  useEffect(() => {
    setLocalFromAmount("");
    setFromAmount("");
    setToAmount("");
  }, [fromToken, toToken, setFromAmount, setToAmount]);

  // Update toAmount when quote changes
  useEffect(() => {
    if (quoteData?.output && !quoteLoading) {
      const outputAmount = (
        parseFloat(quoteData.output.amount) /
        Math.pow(10, quoteData.output.token.decimals)
      ).toString();
      setToAmount(outputAmount);
    }
  }, [quoteData, quoteLoading, setToAmount]);

  useEffect(() => {
    if (fromToken && toToken && debouncedFromAmount && !quoteLoading) {
      fetchQuote();
    }
  }, [fromToken, toToken, debouncedFromAmount, recipientAddress, fetchQuote, quoteLoading]);

  const handleMaxClick = useCallback(() => {
    if (fromBalance) {
      const maxAmount = parseFloat(fromBalance.formatted).toString();
      setLocalFromAmount(maxAmount);
      setFromAmount(maxAmount);
    }
  }, [fromBalance, setFromAmount]);

  const handleSwapTokens = useCallback(() => {
    if (quoteLoading) return;

    // Batch the state updates for better performance
    const tempFromToken = fromToken;
    const tempToToken = toToken;

    // Reset amounts first to prevent any race conditions
    setLocalFromAmount("");
    setFromAmount("");
    setToAmount("");

    // Then swap the tokens
    setFromToken(tempToToken);
    setToToken(tempFromToken);
  }, [fromToken, toToken, quoteLoading, setFromToken, setToToken, setFromAmount, setToAmount]);

  const handleAddressChange = useCallback((value: string) => {
    setRecipientAddress(value);
    setIsValidAddress(value === "" || isValidEvmAddress(value));
  }, [setRecipientAddress, setIsValidAddress]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleAddressChange(text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const handleShareApp = async () => {
    const tokenSymbol = toToken?.symbol;
    await sdk.actions.composeCast({
      text: `Just got some $${tokenSymbol}, a Real World Asset, using Ticker⚡️ \n \n By @0xsarthak & @megabyte \n \n Powered by @bungee`,
      embeds: [
        "https://ticker.megabyte0x.xyz"
      ]
    })
  }

  useEffect(() => {
    if (requestHash) {
      const fetchTxHash = async () => {
        const txHash = await getTxHash(requestHash);
        if (txHash) {
          setTxHash(txHash);
          const supabase = createClient();
          const { error } = await supabase
            .from('tx_hash')
            .update({ tx_hash: txHash })
            .eq('request_hash', requestHash);

          if (error) {
            console.error('Error updating tx_hash:', error);
          }
        }
      };
      fetchTxHash();
    }
  }, [requestHash]);

  const BalanceDisplay = ({
    balance,
    isLoading,
  }: {
    balance: { formatted: string } | null;
    isLoading: boolean;
  }) => {
    if (isLoading) {
      return <Shimmer className="w-24 h-5" />;
    }
    return (
      <span
        className="text-gray-400"
        style={{ fontFamily: "Roboto Mono, monospace" }}
      >
        Bal:
        <span className="text-white">
          {balance ? Number(balance.formatted).toFixed(4) : "0.0000"}
        </span>
      </span>
    );
  };

  const hasInsufficientBalance =
    fromBalance && fromAmount
      ? parseFloat(fromAmount) > parseFloat(fromBalance.formatted)
      : false;

  const handleSwapClick = async () => {
    if (!walletClient || !publicClient || !quoteData?.autoRoute) {
      console.error("Missing Required Data");
      return;
    }

    await handleBridge(quoteData, walletClient, publicClient);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: smoothEasing }}
      className="w-full max-w-sm mx-auto px-4 py-6 sm:max-w-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: smoothEasing }}
        className="bg-[#171a1b] rounded-2xl px-4 py-4 shadow-sm border-[2px] border-[#1e2024] relative"
      >
        <div className="relative">
          <div className="[font-family:var(--font-bricolage)] text-xl pb-6 font-semibold text-white tracking-wider">
            Swap
          </div>

          <div className="relative bg-[#1e2024] p-4 rounded-lg">
            <div className="space-y-4">
              <div className="flex flex-col space-y-1 min-h-[80px]">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col w-full">
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="number"
                      value={localFromAmount}
                      onChange={(e) => handleFromAmountChange(e.target.value)}
                      className="bg-transparent outline-none text-white text-2xl font-medium w-full placeholder-gray-400 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none font-roboto-mono"
                      style={{ fontFamily: "Roboto Mono, monospace" }}
                      placeholder="0.00"
                      min="0"
                      disabled={quoteLoading}
                    />
                    {fromTokenPrice && localFromAmount && (
                      <span className="text-xs text-white mt-1">
                        ${(fromTokenPrice * parseFloat(localFromAmount || "0")).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <TokenDropdown
                      selectedToken={fromToken}
                      onSelect={setFromToken}
                      defaultTab="all"
                    />
                  </motion.div>
                </div>
                <div className="flex mt-2 justify-end items-center space-x-1 text-sm">
                  <BalanceDisplay
                    balance={fromBalance}
                    isLoading={isLoadingFromBalance}
                  />
                  {fromBalance && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleMaxClick}
                      className="px-2 cursor-pointer hover:scale-95 duration-300 py-0.5 text-[#debb84] bg-[#262420] rounded-lg"
                      style={{ fontFamily: "Roboto Mono, monospace" }}
                    >
                      MAX
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="relative flex flex-col items-center">
                <div className="w-full h-[1px] bg-[#242623] my-4"></div>
                <motion.div
                  className="absolute cursor-pointer top-1/2 -translate-y-1/2 flex gap-1"
                  onClick={handleSwapTokens}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="flex flex-col -space-y-4 border-[1px] border-[#24262a] rounded-full p-1"
                    animate={{ rotate: isHovered ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isHovered ? (
                      <>
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </>
                    )}
                  </motion.div>
                </motion.div>
              </div>

              <div className="flex flex-col space-y-1 min-h-[80px]">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col w-full">
                    <motion.input
                      type="number"
                      value={toAmount}
                      className="bg-transparent outline-none text-white text-2xl font-medium w-full placeholder-gray-400 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none font-roboto-mono"
                      style={{ fontFamily: "Roboto Mono, monospace" }}
                      placeholder="0.00"
                      readOnly
                    />
                    {toTokenPrice && toAmount && (
                      <span className="text-xs text-white mt-1">
                        ${(toTokenPrice * parseFloat(toAmount || "0")).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <TokenDropdown
                      selectedToken={toToken}
                      onSelect={setToToken}
                      defaultTab="featured"
                    />
                    <div className="flex mt-2 justify-end items-center space-x-1 text-sm">
                      <BalanceDisplay
                        balance={toBalance}
                        isLoading={isLoadingToBalance}
                      />
                    </div>
                  </motion.div>
                </div>
                <AnimatePresence mode="wait">
                  {showRecipientInput ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 relative"
                    >
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={recipientAddress}
                          onChange={(e) => handleAddressChange(e.target.value)}
                          placeholder="Enter recipient address"
                          className={`w-full bg-[#262830] border ${isValidAddress
                            ? "border-[#2e2f34]"
                            : "border-red-500"
                            } rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all duration-200 pr-[80px]`}
                        />
                        <button
                          onClick={handlePaste}
                          className="absolute right-2 px-3 py-1 text-sm text-white bg-[#262420] rounded-lg hover:bg-[#2a2824] transition-colors duration-200"
                        >
                          Paste
                        </button>
                      </div>
                      {!isValidAddress && recipientAddress && (
                        <p className="text-red-500 text-xs mt-1">
                          Invalid EVM Address Format!
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.button
                      onClick={() => setShowRecipientInput(true)}
                      className="flex w-full items-center justify-between mt-2 px-3 py-2 text-sm text-gray-400 hover:text-white bg-[#262830] rounded-lg transition-all duration-200 hover:bg-[#2a2d36] focus:outline-none"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        <TextAnimate animation="fadeIn" by="text">
                          Recipient Address
                        </TextAnimate>
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <QuoteDisplay />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease: smoothEasing }}
            className="py-4"
          >
            {bridgeStatus === "completed" && requestHash ? (
              <div className="flex flex-col gap-2">
                {!txHash ? (
                  <Button className="w-full cursor-pointer">
                    <TextAnimate animation="fadeIn" by="text">
                      Transaction Successful
                    </TextAnimate>
                  </Button>
                ) : (
                  <Button
                    className="w-full cursor-pointer"
                    onClick={() => {
                      const url = `https://www.socketscan.io/tx/${txHash}`;
                      if (sdk?.actions?.openUrl) {
                        sdk.actions.openUrl(url);
                      } else {
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    View Transaction
                  </Button>
                )}
                <Button className="w-full cursor-pointer" onClick={handleShareApp}>
                  Share App
                </Button>
              </div>
            ) : (
              <button
                disabled={
                  !localFromAmount ||
                  !fromToken ||
                  !toToken ||
                  hasInsufficientBalance ||
                  isBridging
                }
                onClick={handleSwapClick}
                className={`w-full text-base font-medium py-3 cursor-pointer hover:scale-95 duration-300 rounded-xl transition-all bg-[#1e2024] ${localFromAmount && fromToken && toToken && !hasInsufficientBalance && !isBridging
                  ? "text-[#ffd698]"
                  : "text-[#9ca3af]"
                  } disabled:opacity-50`}
              >
                {!localFromAmount
                  ? "Enter an Amount"
                  : hasInsufficientBalance
                    ? "Insufficient Balance"
                    : isBridging
                      ? bridgeStatus === "approving"
                        ? "Approving..."
                        : bridgeStatus === "signing"
                          ? "Signing..."
                          : bridgeStatus === "submitting"
                            ? "Submitting..."
                            : "Processing..."
                      : "Swap"}
              </button>
            )}
            {bridgeError && (
              <p className="text-red-500 text-sm mt-2">{bridgeError}</p>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SwapUI;
