export interface TokenData {
    chainId: number;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
    isShortListed: boolean;
    tags: string[];
    trendingRank: number | null;
    marketCap: number | null;
    totalVolume: number | null;
    balance: string;
    balanceInUsd: number;
    isVerified: boolean;
}

export interface TokenListResult {
    [chainId: string]: TokenData[];
}

export interface TokenListResponse {
    success: boolean;
    statusCode: number;
    result: TokenListResult;
}

export interface BridgeToken {
    chainId: number;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
    icon: string;
}

export interface BridgeInput {
    token: BridgeToken;
    amount: string;
    priceInUsd: number;
    valueInUsd: number;
}

export interface BridgeResult {
    originChainId: number;
    destinationChainId: number;
    userAddress: string;
    receiverAddress: string;
    input: BridgeInput;
    destinationExec: null | any;
    autoRoute: AutoRoute;
    manualRoutes: any[];
}

export interface AutoRoute {
    userOp: string;
    requestHash: string;
    output: BridgeOutput;
    requestType: string;
    approvalData: null | any;
    affiliateFee: null | any;
    signTypedData: null | any;
    gasFee: GasFee;
    slippage: number;
    suggestedClientSlippage: number;
    txData: TxData;
    estimatedTime: number;
    routeDetails: RouteDetails;
    refuel: null | any;
    quoteId: string;
    quoteExpiry: number;
}

export interface BridgeOutput {
    token: BridgeToken;
    priceInUsd: number;
    valueInUsd: number;
    minAmountOut: string;
    amount: string;
    effectiveReceivedInUsd: number;
}

export interface GasFee {
    gasToken: BridgeToken;
    gasLimit: string;
    gasPrice: string;
    estimatedFee: string;
    feeInUsd: number;
}

export interface TxData {
    to: string;
    data: string;
    value: string;
    chainId: number;
}

export interface RouteDetails {
    name: string;
    logoURI: string;
    routeFee: null | any;
    dexDetails: null | any;
}

export interface BridgeResponse {
    success: boolean;
    statusCode: number;
    result: BridgeResult;
    message?: string;
}

export interface QuoteParams {
    userAddress: string;
    originChainId: string;
    destinationChainId: string;
    inputToken: string;
    inputAmount: string; // Amount in wei
    receiverAddress: string;
    outputToken: string;
}

export interface BasicRequest {
    originChainId: number;
    destinationChainId: number;
    deadline: number;
    nonce: string;
    sender: string;
    receiver: string;
    delegate: string;
    bungeeGateway: string;
    switchboardId: number;
    inputToken: string;
    inputAmount: string;
    outputToken: string;
    minOutputAmount: string;
    refuelAmount: string;
}

export interface Request {
    basicReq: BasicRequest;
    swapOutputToken: string;
    minSwapOutput: string;
    metadata: string;
    affiliateFees: string;
    minDestGas: string;
    destinationPayload: string;
    exclusiveTransmitter: string;
}

export interface SubmitRequest {
    request: Request;
    userSignature: string;
    requestType: string;
    quoteId: string;
}

export interface ResponseToken {
    chainId: number;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
    icon: string;
    chainAgnosticId: string;
    cgId: string;
}

export interface InputToken {
    token: ResponseToken;
    amount: string;
    chainId: number;
    valueInUsd: number;
    priceInUsd: number;
}

export interface OutputToken {
    token: ResponseToken;
    minAmountOut: string;
    promisedAmount: string;
    fulfilledAmount: string;
    chainId: number;
    minAmountOutInUsd: number;
    fulfilValueInUsd: number;
    priceInUsd: number;
}

export interface SubmitRequestResult {
    inputTokens: InputToken[];
    outputTokens: OutputToken[];
    orderTimestamp: string;
    status: string;
    statusCode: number;
    requestHash: string;
    ogSender: string;
    requestSource: string;
    userSignature: string;
    requestType: string;
    request: Request;
    createdAt: string;
    updatedAt: string;
}

export interface SubmitRequestResponse {
    success: boolean;
    statusCode: number;
    result: SubmitRequestResult;
    message?: string;
}
