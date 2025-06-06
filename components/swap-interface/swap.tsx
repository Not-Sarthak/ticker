"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Wallet } from "lucide-react";
import { Token } from "@/types";
import { TokenDropdown } from "../token-dropdown";
import { smoothEasing } from "@/lib/animation";
import { TextAnimate } from "../text-animate";
import { isValidEvmAddress } from "@/lib/utils";

const SwapUI: React.FC = () => {
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [conversionRate, setConversionRate] = useState<number>(2);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);
  const [showRecipientInput, setShowRecipientInput] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState<boolean>(true);

  useEffect(() => {
    const fetchbalance = async () => {
      try {
        setBalance(100);
      } catch (error) {
        console.error("Failed to fetch SOL balance", error);
      }
    };
    fetchbalance();
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

  const handleMaxClick = () => {
    const max = balance;
    setFromAmount(max.toString());
    setToAmount((max * conversionRate).toFixed(6));
  };

  const handleSwapTokens = () => {
    // Swap tokens
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);

    // Swap amounts and recalculate
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleAddressChange = (value: string) => {
    setRecipientAddress(value);
    setIsValidAddress(value === "" || isValidEvmAddress(value));
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleAddressChange(text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
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
        {/* Modal Content */}
        <div className="relative">
          <div className="[font-family:var(--font-bricolage)] text-xl pb-6 font-semibold text-white tracking-wider">
            Swap
          </div>

          <div className="relative bg-[#1e2024] p-4 rounded-lg">
            <div className="space-y-4">
              <div className="flex flex-col space-y-1 min-h-[80px]">
                <div className="flex items-center justify-between">
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="number"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    className="bg-transparent outline-none text-white text-2xl font-medium w-full placeholder-gray-400 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none font-roboto-mono"
                    style={{ fontFamily: "Roboto Mono, monospace" }}
                    placeholder="0.00"
                    min="0"
                  />
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <TokenDropdown
                      selectedToken={fromToken}
                      onSelect={setFromToken}
                    />
                  </motion.div>
                </div>
                <div className="flex mt-2 justify-end items-center space-x-1 text-sm">
                  <span
                    className="text-gray-400"
                    style={{ fontFamily: "Roboto Mono, monospace" }}
                  >
                    Bal:<span className="text-white">{balance}</span>
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMaxClick}
                    className="px-2 cursor-pointer hover:scale-95 duration-300 py-0.5 text-[#debb84] bg-[#262420] rounded-lg"
                    style={{ fontFamily: "Roboto Mono, monospace" }}
                  >
                    MAX
                  </motion.button>
                </div>
              </div>

              {/* Divider */}
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
                  <motion.input
                    type="number"
                    value={toAmount}
                    className="bg-transparent outline-none text-white text-2xl font-medium w-full placeholder-gray-400 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none font-roboto-mono"
                    style={{ fontFamily: "Roboto Mono, monospace" }}
                    placeholder="0.00"
                    readOnly
                  />
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <TokenDropdown
                      selectedToken={toToken}
                      onSelect={setToToken}
                    />
                    <div className="flex mt-2 justify-end items-center space-x-1 text-sm">
                      <span
                        className="text-gray-400"
                        style={{ fontFamily: "Roboto Mono, monospace" }}
                      >
                        Bal:<span className="text-white">{balance}</span>
                      </span>
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
                          className={`w-full bg-[#262830] border ${
                            isValidAddress ? "border-[#2e2f34]" : "border-red-500"
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
                        <p className="text-red-500 text-xs mt-1">Invalid EVM Address Format!</p>
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease: smoothEasing }}
            className="py-4"
          >
            <button
              disabled={!fromAmount || !fromToken || !toToken}
              className="w-full text-base font-medium py-3 cursor-pointer hover:scale-95 duration-300 rounded-xl transition-all bg-[#1e2024] text-[#9ca3af] disabled:opacity-50"
            >
              {fromAmount ? "Swap" : "Enter an Amount"}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SwapUI;
