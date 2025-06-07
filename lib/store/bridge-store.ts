import { create } from 'zustand';
import { ERC20_ABI } from '../utils';
import { submitRequest } from '../api/api';
import { type WalletClient, type PublicClient } from 'viem';

interface BridgeState {
  isApproving: boolean;
  isBridging: boolean;
  error: string | null;
  bridgeStatus: 'idle' | 'approving' | 'signing' | 'submitting' | 'completed' | 'error';
  requestHash: string | null;

  handleBridge: (quoteData: any, walletClient: WalletClient, publicClient: PublicClient) => Promise<void>;
  resetState: () => void;
}

export const useBridgeStore = create<BridgeState>((set, get) => ({
  isApproving: false,
  isBridging: false,
  error: null,
  bridgeStatus: 'idle',
  requestHash: null,

  resetState: () => {
    set({
      isApproving: false,
      isBridging: false,
      error: null,
      bridgeStatus: 'idle',
      requestHash: null,
    });
  },

  handleBridge: async (quoteData, walletClient, publicClient) => {
    try {
      if (!walletClient.account) throw new Error('No account connected');
      
      set({ isBridging: true, bridgeStatus: 'approving', error: null });

      if (quoteData.autoRoute.approvalData) {
        const { approvalData } = quoteData.autoRoute;
        

        const currentAllowance = await publicClient.readContract({
          address: approvalData.tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [
            approvalData.userAddress as `0x${string}`,
            approvalData.spenderAddress === "0"
              ? "0x000000000022D473030F116dDEE9F6B43aC78BA3" as `0x${string}`
              : approvalData.spenderAddress as `0x${string}`,
          ],
        }) as bigint;

        if (currentAllowance < BigInt(approvalData.amount)) {
          const hash = await walletClient.writeContract({
            chain: null,
            account: walletClient.account,
            address: approvalData.tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [
              approvalData.spenderAddress === "0"
                ? "0x000000000022D473030F116dDEE9F6B43aC78BA3" as `0x${string}`
                : approvalData.spenderAddress as `0x${string}`,
              BigInt(approvalData.amount),
            ],
          });

          await publicClient.waitForTransactionReceipt({ hash });
        }

        set({ bridgeStatus: 'signing' });

        const signature = await walletClient.signTypedData({
          account: walletClient.account,
          domain: quoteData.autoRoute.signTypedData.domain,
          types: quoteData.autoRoute.signTypedData.types,
          primaryType: 'PermitWitnessTransferFrom',
          message: quoteData.autoRoute.signTypedData.values,
        });

        set({ bridgeStatus: 'submitting' });

        try {
          console.log('Submitting request with params:', {
            requestType: quoteData.autoRoute.requestType,
            request: quoteData.autoRoute.signTypedData.values.witness,
            userSignature: signature,
            quoteId: quoteData.autoRoute.quoteId,
          });

          const result = await submitRequest({
            requestType: quoteData.autoRoute.requestType,
            request: quoteData.autoRoute.signTypedData.values.witness,
            userSignature: signature,
            quoteId: quoteData.autoRoute.quoteId,
          });

          if (result?.requestHash) {
            set({ requestHash: result.requestHash, bridgeStatus: 'completed' });
          }
        } catch (submitError: any) {
          if (submitError.message?.includes('Request hash already exists')) {
            set({ 
              requestHash: quoteData.autoRoute.requestHash, 
              bridgeStatus: 'completed' 
            });
          } else {
            throw submitError;
          }
        }
      } 
      else if (quoteData.autoRoute.txData) {
        const { txData } = quoteData.autoRoute;
        
        set({ bridgeStatus: 'submitting' });
        
        const hash = await walletClient.sendTransaction({
          chain: null,
          account: walletClient.account,
          to: txData.to as `0x${string}`,
          value: BigInt(txData.value),
          data: txData.data as `0x${string}`,
        });

        await publicClient.waitForTransactionReceipt({ hash });
        
        set({ 
          requestHash: quoteData.autoRoute.requestHash, 
          bridgeStatus: 'completed' 
        });
      }

    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to bridge tokens', 
        bridgeStatus: 'error' 
      });
      console.error('Bridge error:', error);
    } finally {
      set({ isBridging: false });
    }
  },
})); 