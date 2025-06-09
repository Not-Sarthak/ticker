import { useEffect, useState } from 'react';
import { Token } from '@/types';
import { getBalance, getUserTokenList } from '@/lib/api/api';
import { useAccount } from 'wagmi';
import { stockTokens } from '@/lib/stock-config';

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

      // Check if it's an RWA token
      const isRWA = stockTokens.some(
        (t) => t.tokenAddress.toLowerCase() === (token.address || (token as any).tokenAddress)?.toLowerCase()
      );

      if (isRWA) {
        // Use getUserTokenList for RWA tokens
        try {
          const result = await getUserTokenList(userAddress, [token.chainId.toString()]);
          if (result && result[token.chainId]) {
            const tokenData = result[token.chainId].find(
              (t) => t.address.toLowerCase() === (token.address || (token as any).tokenAddress)?.toLowerCase()
            );
            if (tokenData) {
              setBalance({
                raw: tokenData.balance,
                formatted: (parseFloat(tokenData.balance) / Math.pow(10, token.decimals)).toString()
              });
            }
          }
        } catch (error) {
          console.error('Error fetching RWA token balance:', error);
          setBalance(null);
        }
        return;
      }

      // For non-RWA tokens, use the existing RPC method
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