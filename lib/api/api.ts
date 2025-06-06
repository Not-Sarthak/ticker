import {
  TokenListResponse,
  QuoteParams,
  TokenListResult,
  BridgeResponse,
  BridgeResult,
  SubmitRequest,
  SubmitRequestResponse,
} from "../types";
import {
  createPublicClient,
  http,
  formatUnits,
  Address,
  Chain,
  defineChain,
} from "viem";
import { ERC20_ABI } from "../utils";
import { PUBLIC_RPC_URLS } from "../rpc";

const BASE_URL = "https://public-backend.bungee.exchange";

interface ChainCurrency {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  icon?: string;
  minNativeCurrencyForGas: string;
}

interface SupportedChain {
  chainId: number;
  name: string;
  icon: string;
  currency: ChainCurrency;
  explorers: string[];
  sendingEnabled: boolean;
  receivingEnabled: boolean;
  isAutoEnabled: boolean;
  isManualEnabled: boolean;
}

interface SupportedChainsResponse {
  success: boolean;
  statusCode: number;
  result: SupportedChain[];
}

let supportedChainsCache: Record<string, Chain> | null = null;
let lastCacheFetch: number = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function getSupportedChains(): Promise<Record<string, Chain>> {
  if (supportedChainsCache && Date.now() - lastCacheFetch < CACHE_TTL) {
    return supportedChainsCache;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/v1/supported-chains`);
    const data: SupportedChainsResponse = await response.json();
    const chains: Record<string, Chain> = {};

    for (const chain of data.result) {
      const rpcUrls = PUBLIC_RPC_URLS[chain.chainId] || [
        `https://${chain.name.toLowerCase()}.publicnode.com`,
        `https://rpc.${chain.name.toLowerCase()}.org`,
      ];

      chains[chain.chainId.toString()] = defineChain({
        id: chain.chainId,
        name: chain.name,
        network: chain.name.toLowerCase(),
        nativeCurrency: {
          name: chain.currency.name,
          symbol: chain.currency.symbol,
          decimals: chain.currency.decimals,
        },
        rpcUrls: {
          default: {
            http: rpcUrls,
          },
          public: {
            http: rpcUrls,
          },
        },
        blockExplorers: {
          default: {
            name: chain.name,
            url: chain.explorers[0],
          },
        },
      });
    }

    supportedChainsCache = chains;
    lastCacheFetch = Date.now();

    return chains;
  } catch (error) {
    console.error("Error fetching supported chains:", error);
    throw error;
  }
}

async function getUserTokenList(
  userAddress: string,
  chainIds: string[]
): Promise<TokenListResult | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/tokens/list?userAddress=${userAddress}&chainIds=${chainIds.join(
        ","
      )}`
    );
    const data: TokenListResponse = await response.json();

    if (!data.success) {
      throw new Error("Failed to Fetch Tokens");
    }

    return data.result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getQuote(input: QuoteParams): Promise<BridgeResult | null> {
  const quoteParams = {
    userAddress: input.userAddress,
    receiverAddress: input.receiverAddress,
    originChainId: input.originChainId,
    destinationChainId: input.destinationChainId,
    inputToken: input.inputToken,
    inputAmount: input.inputAmount,
    outputToken: input.outputToken,
  };

  const queryParams = new URLSearchParams(quoteParams);
  const url = `${BASE_URL}/api/v1/bungee/quote?${queryParams.toString()}`;
  console.log("Full URL", url);
  try {
    const response = await fetch(url);
    const data: BridgeResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch quote");
    }

    console.log("Quote Returned", JSON.stringify(data, null, 2));

    return data.result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function submitRequest(quote: SubmitRequest) {
  const data = {
    request: quote.request,
    userSignature: quote.userSignature,
    requestType: quote.requestType,
    quoteId: quote.quoteId,
  };

  let body = JSON.stringify(data);

  try {
    const response = await fetch(`${BASE_URL}/api/v1/bungee/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body,
    });
    const data: SubmitRequestResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to submit request");
    }

    return data.result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
}

async function getBalance(
  userAddress: string,
  chainId: string,
  tokenAddress: string
): Promise<{ balance: string; formatted: string } | null> {
  try {
    if (!userAddress || !chainId) {
      throw new Error("Invalid input parameters");
    }

    const chains = await getSupportedChains();
    if (!chains[chainId]) {
      throw new Error(`Chain ID ${chainId} is not supported`);
    }

    const client = createPublicClient({
      chain: chains[chainId],
      transport: http(),
    });

    let balance: bigint;
    let decimals = 18;

    const isNativeToken =
      tokenAddress === "0x0000000000000000000000000000000000000000" ||
      tokenAddress.toLowerCase() ===
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

    if (isNativeToken) {
      balance = await retryOperation(() =>
        client.getBalance({ address: userAddress as Address })
      );
    } else {
      const tokenBalance = (await retryOperation(() =>
        client.readContract({
          address: tokenAddress as Address,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [userAddress as Address],
        })
      )) as bigint;

      balance = tokenBalance;

      try {
        const tokenDecimals = (await retryOperation(() =>
          client.readContract({
            address: tokenAddress as Address,
            abi: [
              {
                constant: true,
                inputs: [],
                name: "decimals",
                outputs: [{ name: "", type: "uint8" }],
                type: "function",
              },
            ],
            functionName: "decimals",
          })
        )) as number;

        decimals = tokenDecimals;
      } catch (error) {
        console.warn("Failed to get token decimals, using default:", error);
      }
    }

    return {
      balance: balance.toString(),
      formatted: formatUnits(balance, decimals),
    };
  } catch (error) {
    console.error("Error fetching balance:", error);
    return null;
  }
}

export {
  getSupportedChains,
  getUserTokenList,
  getQuote,
  submitRequest,
  getBalance,
};
