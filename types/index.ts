export type Chain = {
  chainId: number;
  name: string;
  icon: string;
  currency: {
    address: string;
    icon: string;
    name: string;
    symbol: string;
    decimals: number;
    minNativeCurrencyForGas: string;
  };
  explorers: string[];
  sendingEnabled: boolean;
  receivingEnabled: boolean;
  isAutoEnabled: boolean;
  isManualEnabled: boolean;
};

export type Token = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  isShortListed?: boolean;
  tags?: string[];
  trendingRank?: number;
  marketCap?: number;
  totalVolume?: number;
  balance?: string;
  balanceInUsd?: number;
  isVerified?: boolean;
};
