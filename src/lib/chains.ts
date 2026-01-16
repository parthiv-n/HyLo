import { defineChain } from "viem"

// HyperEVM Mainnet configuration
export const hyperEVM = defineChain({
  id: 999,
  name: "HyperEVM",
  nativeCurrency: {
    decimals: 18,
    name: "HYPE",
    symbol: "HYPE",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.hyperliquid.xyz/evm"],
    },
  },
  blockExplorers: {
    default: {
      name: "Hyperliquid Explorer",
      url: "https://explorer.hyperliquid.xyz",
    },
  },
})

// Common tokens on HyperEVM
export const HYPER_TOKENS = {
  USDC: {
    address: "0x0000000000000000000000000000000000000000" as `0x${string}`, // Native USDC - update with actual address
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
  },
  HYPE: {
    address: "0x0000000000000000000000000000000000000000" as `0x${string}`, // Native token
    symbol: "HYPE",
    name: "Hype",
    decimals: 18,
    logoURI: "/hype-logo.png",
  },
} as const

// Chain IDs for LI.FI
export const CHAIN_IDS = {
  ETHEREUM: 1,
  POLYGON: 137,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  BASE: 8453,
  BSC: 56,
  AVALANCHE: 43114,
  HYPEREVM: 999,
} as const

// Supported origin chains for bridging
export const SUPPORTED_CHAINS = [
  { id: 1, name: "Ethereum", symbol: "ETH", logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  { id: 137, name: "Polygon", symbol: "MATIC", logo: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png" },
  { id: 42161, name: "Arbitrum", symbol: "ETH", logo: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg" },
  { id: 10, name: "Optimism", symbol: "ETH", logo: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png" },
  { id: 8453, name: "Base", symbol: "ETH", logo: "https://assets.coingecko.com/coins/images/31164/small/base.png" },
  { id: 56, name: "BNB Chain", symbol: "BNB", logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
] as const
