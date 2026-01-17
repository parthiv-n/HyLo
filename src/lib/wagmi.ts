import { getDefaultConfig, connectorsForWallets } from "@rainbow-me/rainbowkit"
import {
  metaMaskWallet,
  coinbaseWallet,
  injectedWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets"
import { createConfig, http } from "wagmi"
import { mainnet, polygon, arbitrum, optimism, base, bsc } from "wagmi/chains"
import { hyperEVM, hyperEVMTestnet } from "./chains"

// Network mode: "mainnet" | "testnet" | "buildbear"
const networkMode = process.env.NEXT_PUBLIC_NETWORK_MODE || "mainnet"

// Use testnet HyperEVM for non-mainnet modes
const targetHyperEVM = networkMode === "mainnet" ? hyperEVM : hyperEVMTestnet

// Check if we have a valid WalletConnect Project ID
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
const hasValidProjectId = walletConnectProjectId && walletConnectProjectId !== "demo" && walletConnectProjectId.length > 10

// Define chains
const chains = [
  polygon,
  arbitrum,
  optimism,
  base,
  targetHyperEVM,
  ...(networkMode === "mainnet" ? [mainnet, bsc] : []),
] as const

// Create config based on whether we have a valid WalletConnect Project ID
export const config = hasValidProjectId
  ? getDefaultConfig({
    appName: "HyLo",
    projectId: walletConnectProjectId,
    chains,
    ssr: true,
  })
  : (() => {
    // Demo mode: only use injected wallets (no WalletConnect required)
    const connectors = connectorsForWallets(
      [
        {
          groupName: "Popular",
          wallets: [metaMaskWallet, coinbaseWallet, injectedWallet],
        },
      ],
      {
        appName: "HyLo",
        projectId: "demo", // Placeholder, WalletConnect won't be used
      }
    )

    return createConfig({
      connectors,
      chains,
      transports: {
        [polygon.id]: http(),
        [arbitrum.id]: http(),
        [optimism.id]: http(),
        [base.id]: http(),
        [targetHyperEVM.id]: http(),
        ...(networkMode === "mainnet"
          ? { [mainnet.id]: http(), [bsc.id]: http() }
          : {}),
      },
      ssr: true,
    })
  })()

// Export network mode for use in other files
export { networkMode }
