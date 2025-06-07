import { useEffect, useCallback } from 'react';
import { useTokenStore } from '@/lib/store/token-store';

interface UseDebounceSearchProps {
  userAddress?: string;
  delay?: number;
}

export const useDebouncedSearch = ({ 
  userAddress, 
  delay = 300 
}: UseDebounceSearchProps = {}) => {
  const { searchQuery, searchTokens } = useTokenStore();

  const debouncedSearchTokens = useCallback(
    async (query: string) => {
      await searchTokens(query, userAddress);
    },
    [searchTokens, userAddress]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedSearchTokens(searchQuery);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, debouncedSearchTokens, delay]);

  return {
    searchQuery,
    isSearching: searchQuery.trim().length > 0,
  };
}; 