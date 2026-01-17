import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatAmount(amount: string | number, decimals: number = 4): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num)) return "0"
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })
}

// Format token amount from smallest units (e.g., wei) to human-readable format
export function formatTokenAmount(amount: string | number, tokenDecimals: number = 6, displayDecimals: number = 2): string {
  const rawAmount = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(rawAmount)) return "0"

  // Convert from smallest units to human-readable (divide by 10^tokenDecimals)
  const humanAmount = rawAmount / Math.pow(10, tokenDecimals)

  return humanAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: displayDecimals,
  })
}
