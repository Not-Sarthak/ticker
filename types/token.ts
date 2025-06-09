export interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  isShortListed: boolean;
  tags: string[];
  trendingRank: number;
  marketCap: number;
  totalVolume: number;
  balance: string;
  balanceInUsd: number;
  isVerified: boolean;
}

export interface TokensByChain {
  [chainId: string]: Token[];
}

export interface TokenSearchResponse {
  success: boolean;
  statusCode: number;
  result: {
    tokens: TokensByChain;
  };
} 