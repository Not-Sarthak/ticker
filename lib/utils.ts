import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function trimAddress(address: string) {
  if (!address) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTokenBalance(balance: string | number, decimals: number = 4): string {
  const numBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
  if (isNaN(numBalance)) return '0';
  
  if (numBalance === 0) return '0';
  if (numBalance < 0.0001) return '< 0.0001';
  
  return numBalance.toFixed(decimals);
}

export function getTokenDisplayName(symbol: string, name: string): { primary: string; secondary: string } {
  return {
    primary: symbol,
    secondary: name
  };
}

export function getImageWithFallback(src: string, fallback: string = '/placeholder-token.png'): string {
  return src || fallback;
}

export function handleApiError(error: unknown, context: string): void {
  console.error(`${context}:`, error);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function isValidEvmAddress(address: string): boolean {
  if (!address) return false;
  
  const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return evmAddressRegex.test(address);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export const ERC20_ABI = [{
  "constant": true,
  "inputs": [{"name": "_owner", "type": "address"}],
  "name": "balanceOf",
  "outputs": [{"name": "balance", "type": "uint256"}],
  "type": "function"
}, {
  "constant": false,
  "inputs": [
    {"name": "spender", "type": "address"},
    {"name": "amount", "type": "uint256"}
  ],
  "name": "approve",
  "outputs": [{"name": "", "type": "bool"}],
  "type": "function"
}, {
  "constant": true,
  "inputs": [
    {"name": "owner", "type": "address"},
    {"name": "spender", "type": "address"}
  ],
  "name": "allowance",
  "outputs": [{"name": "", "type": "uint256"}],
  "type": "function"
}, {
  "inputs": [
    {"name": "owner", "type": "address"},
    {"name": "spender", "type": "address"},
    {"name": "value", "type": "uint256"},
    {"name": "deadline", "type": "uint256"},
    {"name": "v", "type": "uint8"},
    {"name": "r", "type": "bytes32"},
    {"name": "s", "type": "bytes32"}
  ],
  "name": "permit",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}] as const;