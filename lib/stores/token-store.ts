import { create } from 'zustand';
import { Chain, Token } from '@/types';
import { tokenApi } from '@/lib/api/token-api';

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
  fetchTokens: (chainId: number) => Promise<void>;
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
  
  // Async actions
  fetchChains: async () => {
    try {
      const chains = await tokenApi.fetchChains();
      set({ chains });
      
      // Set Ethereum as default
      const ethereum = chains.find((chain: Chain) => chain.chainId === 1);
      if (ethereum) {
        set({ selectedChain: ethereum });
        get().fetchTokens(ethereum.chainId);
      }
    } catch (error) {
      console.error('Error fetching chains:', error);
    }
  },
  
  fetchTokens: async (chainId: number) => {
    set({ loading: true });
    try {
      const tokens = await tokenApi.fetchTokens(chainId);
      set({ tokens });
    } catch (error) {
      console.error('Error fetching tokens:', error);
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