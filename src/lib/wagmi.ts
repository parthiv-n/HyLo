import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { mainnet, polygon, arbitrum, optimism, base, bsc } from "wagmi/chains"
import { hyperEVM } from "./chains"

export const config = getDefaultConfig({
  appName: "HyLo",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "demo",
  chains: [
    mainnet,
    polygon,
    arbitrum,
    optimism,
    base,
    bsc,
    hyperEVM,
  ],
  ssr: true,
})
