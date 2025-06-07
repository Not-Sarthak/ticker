import { create } from 'zustand'
import { Token } from '@/types'
import { getQuote } from '../api/api'

interface QuoteData {
  input: {
    token: Token
    amount: string
    priceInUsd: number
    valueInUsd: number
  }
  output?: {
    token: Token
    amount: string
    priceInUsd: number
    valueInUsd: number
  }
  originChainId: number
  destinationChainId: number
  userAddress: string
  receiverAddress: string
  destinationExec: any
  autoRoute: any
  manualRoutes: any[]
}

interface SwapState {
  fromToken: Token | null
  toToken: Token | null
  fromAmount: string
  toAmount: string
  recipientAddress: string
  isValidAddress: boolean
  showRecipientInput: boolean
  userAddress: string | null
  quoteLoading: boolean
  quoteData: QuoteData | null
  setFromToken: (token: Token | null) => void
  setToToken: (token: Token | null) => void
  setFromAmount: (amount: string) => void
  setToAmount: (amount: string) => void
  setRecipientAddress: (address: string) => void
  setIsValidAddress: (isValid: boolean) => void
  setShowRecipientInput: (show: boolean) => void
  setUserAddress: (address: string | null) => void
  fetchQuote: () => Promise<void>
}

export const useSwapStore = create<SwapState>((set, get) => ({
  fromToken: null,
  toToken: null,
  fromAmount: '',
  toAmount: '',
  recipientAddress: '',
  isValidAddress: true,
  showRecipientInput: false,
  userAddress: null,
  quoteLoading: false,
  quoteData: null,
  setFromToken: (token) => set({ fromToken: token }),
  setToToken: (token) => set({ toToken: token }),
  setFromAmount: (amount) => set({ fromAmount: amount }),
  setToAmount: (amount) => set({ toAmount: amount }),
  setRecipientAddress: (address) => set({ recipientAddress: address }),
  setIsValidAddress: (isValid) => set({ isValidAddress: isValid }),
  setShowRecipientInput: (show) => set({ showRecipientInput: show }),
  setUserAddress: (address) => set({ userAddress: address }),
  fetchQuote: async () => {
    const state = get()

    const fromToken = state.fromToken as Token
    const toToken = state.toToken as Token
    const fromAmount = state.fromAmount
    const userAddress = state.userAddress as string

    set({ quoteLoading: true })

    const amountInDecimals = (parseFloat(fromAmount) * Math.pow(10, fromToken.decimals)).toString()

    const quoteParams = {
      userAddress,
      receiverAddress: state.recipientAddress || userAddress,
      originChainId: fromToken.chainId.toString(),
      destinationChainId: toToken.chainId.toString(),
      inputToken: fromToken.address,
      inputAmount: amountInDecimals,
      outputToken: toToken.address,
    }

    try {
      const quote = await getQuote(quoteParams)
      
      if (quote && quote.autoRoute?.output) {
        const formattedQuote: QuoteData = {
          ...quote,
          output: {
            token: toToken,
            amount: quote.autoRoute.output.amount,
            priceInUsd: quote.autoRoute.output.priceInUsd,
            valueInUsd: quote.autoRoute.output.valueInUsd
          }
        }
        set({ quoteData: formattedQuote })
      } else {
        const partialQuote: QuoteData = {
          ...quote,
          input: {
            token: fromToken,
            amount: amountInDecimals,
            priceInUsd: quote?.input?.priceInUsd || 1,
            valueInUsd: quote?.input?.valueInUsd || parseFloat(fromAmount)
          },
          originChainId: parseInt(fromToken.chainId.toString()),
          destinationChainId: parseInt(toToken.chainId.toString()),
          userAddress,
          receiverAddress: state.recipientAddress || userAddress,
          destinationExec: null,
          autoRoute: null,
          manualRoutes: []
        }
        set({ quoteData: partialQuote })
      }
    } catch (error) {
      console.error('Error fetching quote:', error)
      set({ quoteData: null })
    } finally {
      set({ quoteLoading: false })
    }
  }
})) 