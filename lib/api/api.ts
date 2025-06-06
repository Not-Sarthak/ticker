import { TokenListResponse, QuoteParams, TokenListResult, BridgeResponse, BridgeResult, SubmitRequest, SubmitRequestResponse } from "../types";

const BASE_URL = "https://public-backend.bungee.exchange";

async function getUserTokenList(userAddress: string, chainIds: string[]): Promise<TokenListResult | null> {

    try {
        const response = await fetch(
            `${BASE_URL}/api/v1/tokens/list?userAddress=${userAddress}&chainIds=${chainIds.join(',')}`
        )
        const data: TokenListResponse = await response.json();

        if (!data.success) {
            throw new Error("Failed to fetch tokens");
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
    }

    const queryParams = new URLSearchParams(quoteParams);
    const url = `${BASE_URL}/api/v1/bungee/quote?${queryParams.toString()}`;
    console.log("Full URL", url);
    try {
        const response = await fetch(url);
        const data: BridgeResponse = await response.json();

        if (!data.success) {
            throw new Error(data.message || "Failed to fetch quote");
        }

        console.log("Quote returned", JSON.stringify(data, null, 2));

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
        quoteId: quote.quoteId
    }

    let body = JSON.stringify(data);



    try {
        const response = await fetch(
            `${BASE_URL}/api/v1/bungee/submit`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: body
            }
        )
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