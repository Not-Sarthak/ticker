export interface BungeeQuoteParams {
  userAddress: string;
  receiverAddress: string;
  originChainId: string;
  destinationChainId: string;
  inputToken: string;
  inputAmount: string;
  outputToken: string;
}

export interface BungeeApprovalData {
  spenderAddress: string;
  amount: string;
  tokenAddress: string;
  userAddress: string;
}

export interface BungeeSignTypedData {
  domain: {
    name: string;
    chainId: number;
    verifyingContract: string;
  };
  types: Record<string, Array<{ name: string; type: string }>>;
  values: any;
}

export interface BungeeQuoteResponse {
  success: boolean;
  statusCode: number;
  result: {
    autoRoute: {
      userOp: string;
      requestHash: string;
      output: {
        token: {
          chainId: number;
          address: string;
          symbol: string;
          decimals: number;
        };
        amount: string;
        priceInUsd: number;
        valueInUsd: number;
      };
      approvalData: BungeeApprovalData;
      signTypedData: BungeeSignTypedData;
      quoteId: string;
    };
  };
}

export interface BungeeStatusResponse {
  bungeeStatusCode: number;
  destinationData?: {
    txHash: string;
  };
}

export const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
export const BUNGEE_API_BASE_URL = "https://public-backend.bungee.exchange"; 