import { useSwapStore } from "@/lib/store/swap-store";
import { Shimmer } from "../ui/shimmer";

const NoRoutesMessage = () => (
  <div className="flex flex-col space-y-2 mt-4">
    <div className="flex items-center justify-between bg-[#1e2024] p-4 rounded-lg">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-yellow-500">
          No routes available for this Swap
        </span>
      </div>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="flex flex-col space-y-2 mt-4">
    <Shimmer className="h-8 w-full rounded-lg" />
    <Shimmer className="h-6 w-3/4 rounded-lg" />
  </div>
);

export const QuoteDisplay = () => {
  const { quoteData, quoteLoading, fromToken, toToken, fromAmount } = useSwapStore();
  if (!fromToken || !toToken || !fromAmount) {
    return null;
  }

  if (quoteLoading) {
    return <LoadingState />;
  }

  if (quoteData && !quoteData.output && fromAmount !== '') {
    return <NoRoutesMessage />;
  }

  if (!quoteData?.output) {
    return null;
  }

  const amount = quoteData.output.amount;
  const decimals = quoteData.output.token.decimals;
  const symbol = quoteData.output.token.symbol;
  const usdValue = quoteData.input.valueInUsd;

  const formattedAmount = (parseFloat(amount) / Math.pow(10, decimals)).toFixed(6);
  const formattedUsd = usdValue.toFixed(2);

  return (
    <div className="flex flex-col space-y-2 mt-4">
      <div className="flex items-center justify-between bg-[#1e2024] p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-white">
            {formattedAmount} {symbol}
          </span>
          <span className="text-gray-400">
            ${formattedUsd}
          </span>
        </div>
      </div>
    </div>
  );
};