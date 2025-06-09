import { create } from 'zustand';
import { Chain, Token } from '@/types';
import { tokenApi } from '@/lib/api/token-api';
import { getUserTokenList } from '@/lib/api/api';

interface TokenStore {
  // State
  chains: Chain[];
  selectedChain: Chain | null;
  tokens: Token[];
  searchResults: Token[];
  loading: boolean;
  searchQuery: string;
  showAllChains: boolean;
  
  // Actions
  setChains: (chains: Chain[]) => void;
  setSelectedChain: (chain: Chain | null) => void;
  setTokens: (tokens: Token[]) => void;
  setSearchResults: (results: Token[]) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setShowAllChains: (show: boolean) => void;
  
  // Async actions
  fetchChains: () => Promise<void>;
  fetchTokens: (chainId: number, userAddress?: string) => Promise<void>;
  searchTokens: (query: string, userAddress?: string) => Promise<void>;
  
  // Reset
  reset: () => void;
}

export const useTokenStore = create<TokenStore>((set, get) => ({
  // Initial state
  chains: [],
  selectedChain: null,
  tokens: [],
  searchResults: [],
  loading: false,
  searchQuery: '',
  showAllChains: false,
  
  // Setters
  setChains: (chains) => set({ chains }),
  setSelectedChain: (chain) => set({ selectedChain: chain }),
  setTokens: (tokens) => set({ tokens }),
  setSearchResults: (results) => set({ searchResults: results }),
  setLoading: (loading) => set({ loading }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setShowAllChains: (show) => set({ showAllChains: show }),
  
  fetchChains: async () => {
    try {
      const chains = await tokenApi.fetchChains();
      
      const sortedChains = chains.sort((a, b) => {
        if (a.chainId === 1) return -1;
        if (b.chainId === 1) return 1;
        if (a.chainId === 8453) return -1;
        if (b.chainId === 8453) return 1;
        return 0;
      });

      set({ chains: sortedChains });
      
      const ethereum = sortedChains.find((chain: Chain) => chain.chainId === 1);
      if (ethereum) {
        set({ selectedChain: ethereum });
        get().fetchTokens(ethereum.chainId);
      }
    } catch (error) {
      console.error('Error fetching chains:', error);
    }
  },
  
  fetchTokens: async (chainId: number, userAddress?: string) => {
    set({ loading: true });
    try {
      if (userAddress) {
        const result = await getUserTokenList(userAddress, [chainId.toString()]);
        if (result && result[chainId] && Array.isArray(result[chainId])) {
          const sortedTokens = [...result[chainId]].sort((a, b) => {
            const balanceA = a.balanceInUsd || 0;
            const balanceB = b.balanceInUsd || 0;
            return balanceB - balanceA;
          });
          set({ tokens: sortedTokens });
          return;
        }
      }
      const tokens = await tokenApi.fetchTokens(chainId);
      set({ tokens });
    } catch (error) {
      console.error('Error fetching tokens:', error);
      set({ tokens: [] });
    } finally {
      set({ loading: false });
    }
  },
  
  searchTokens: async (query: string, userAddress?: string) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    
    set({ loading: true });
    try {
      const results = await tokenApi.searchTokens(query, userAddress);
      console.log(results);
      set({ searchResults: results });
    } catch (error) {
      console.error('Error searching tokens:', error);
      set({ searchResults: [] });
    } finally {
      set({ loading: false });
    }
  },
  
  reset: () => set({
    searchQuery: '',
    searchResults: [],
  }),
})); 