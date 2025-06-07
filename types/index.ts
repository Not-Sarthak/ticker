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

export interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  isShortListed?: boolean;
  tags?: string[];
  trendingRank?: number | null;
  marketCap?: number | null;
  totalVolume?: number | null;
  balance?: string;
  balanceInUsd?: number;
  isVerified?: boolean;
}
