import { useEffect, useState } from 'react';
import { Token } from '@/types';
import { getBalance } from '@/lib/api/api';
import { useAccount } from 'wagmi';

interface BalanceCache {
  [key: string]: {
    balance: string;
    formatted: string;
    timestamp: number;
  };
}

const balanceCache: BalanceCache = {};
const CACHE_TTL = 30000; // 30 seconds

export function useTokenBalance(token: Token | null) {
  const { address: userAddress, isConnected } = useAccount();
  const [balance, setBalance] = useState<{ raw: string; formatted: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchBalance = async () => {
      if (!token || !isConnected || !userAddress) {
        setBalance(null);
        return;
      }

      const cacheKey = `${userAddress}-${token.chainId}-${token.address}`;
      const cachedData = balanceCache[cacheKey];
      
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
        setBalance({
          raw: cachedData.balance,
          formatted: cachedData.formatted
        });
        return;
      }

      setIsLoading(true);

      try {
        const result = await getBalance(
          userAddress,
          token.chainId.toString(),
          token.address
        );

        if (result && isMounted) {
          balanceCache[cacheKey] = {
            balance: result.balance,
            formatted: result.formatted,
            timestamp: Date.now()
          };

          setBalance({
            raw: result.balance,
            formatted: result.formatted
          });
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBalance();

    return () => {
      isMounted = false;
    };
  }, [token, userAddress, isConnected]);

  return { balance, isLoading };
} 