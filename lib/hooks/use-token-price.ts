import { useEffect, useState } from 'react';

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const ALCHEMY_PRICE_API = `https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/by-address`;

export const useTokenPrice = (token: any | null) => {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      if (!token?.address || !token?.chainId) return;

      try {
        const networkName = getNetworkName(token.chainId);
        if (!networkName) return;

        const response = await fetch(ALCHEMY_PRICE_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addresses: [
              {
                network: networkName,
                address: token.address,
              },
            ],
          }),
        });

        const data = await response.json();
        const priceData = data.data?.[0]?.prices?.[0]?.value;
        
        if (priceData) {
          setPrice(parseFloat(priceData));
        } else {
          setPrice(null);
        }
      } catch (error) {
        console.error('Error fetching token price:', error);
        setPrice(null);
      }
    };

    fetchPrice();
  }, [token?.address, token?.chainId]);

  return price;
};

function getNetworkName(chainId: number): string | null {
  const networkMap: Record<number, string> = {
    1: 'eth-mainnet',
    8453: 'base-mainnet',
    42161: 'arb-mainnet',
    42170: 'arbnova-mainnet',
    10: 'opt-mainnet',
    137: 'polygon-mainnet',
    480: 'worldchain-mainnet',
    130: 'unichain-mainnet',
    1868: 'soneium-mainnet',
    8008: 'polynomial-mainnet',
    204: 'opbnb-mainnet',
    80094: 'berachain-mainnet',
  };

  return networkMap[chainId] || null;
} 