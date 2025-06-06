import { Chain, Token } from '@/types';

interface ChainResponse {
  success: boolean;
  result: Chain[];
}

interface TokenResponse {
  success: boolean;
  result: Record<number, Token[]>;
}

interface SearchResponse {
  success: boolean;
  result: {
    tokens: Record<string, Token[]>;
  };
}

export const BASE_URL = 'https://public-backend.bungee.exchange/api/v1';

class TokenApiService {
  async fetchChains(): Promise<Chain[]> {
    const response = await fetch(`${BASE_URL}/supported-chains`);
    const data: ChainResponse = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to fetch chains');
    }
    
    return data.result;
  }

  async fetchTokens(chainId: number): Promise<Token[]> {
    const response = await fetch(`${BASE_URL}/tokens/list?chainIds=${chainId}`);
    const data: TokenResponse = await response.json();
    
    if (!data.success || !data.result[chainId]) {
      throw new Error(`Failed to fetch tokens for chain ${chainId}`);
    }
    
    return data.result[chainId];
  }

  async searchTokens(query: string, userAddress?: string): Promise<Token[]> {
    const url = new URL(`${BASE_URL}/tokens/search`);
    url.searchParams.append('q', query);
    
    if (userAddress) {
      url.searchParams.append('userAddress', userAddress);
    }

    const response = await fetch(url.toString());
    const data: SearchResponse = await response.json();
    
    if (!data.success || !data.result?.tokens) {
      return [];
    }
    
    const allTokens: Token[] = [];
    Object.values(data.result.tokens).forEach((chainTokens) => {
      if (Array.isArray(chainTokens)) {
        allTokens.push(...chainTokens);
      }
    });
    
    return allTokens;
  }
}

export const tokenApi = new TokenApiService(); 