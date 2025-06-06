import { useSwapStore } from "@/lib/store/swap-store";
import { Shimmer } from "../ui/shimmer";
import { motion } from "framer-motion";

export const QuoteDisplay = () => {
  const { quoteData, quoteLoading } = useSwapStore();

  if (quoteLoading) {
    return (
      <div className="flex flex-col space-y-2 mt-4">
        <Shimmer className="h-8 w-full rounded-lg" />
        <Shimmer className="h-6 w-3/4 rounded-lg" />
      </div>
    );
  }

  if (!quoteData) return null;

  const inputAmount = (parseFloat(quoteData.input.amount) / Math.pow(10, quoteData.input.token.decimals)).toFixed(6);
  const outputAmount = (parseFloat(quoteData.output.amount) / Math.pow(10, quoteData.output.token.decimals)).toFixed(6);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col space-y-2 mt-4 text-white"
    >
      <div className="flex items-center justify-between bg-[#1e2024] p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            {/* {inputAmount} {quoteData.input.token.symbol} ~  */}
            {outputAmount} {quoteData.output.token.symbol}
          </span>
          <span className="text-gray-400">${quoteData.input.valueInUsd.toFixed(2)}</span>
        </div>
      </div>
    </motion.div>
  );
}; 