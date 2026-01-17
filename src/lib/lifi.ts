import { createConfig, getQuote, getRoutes, getStatus, executeRoute, type Route, type Token, type ExtendedChain, type LiFiStep } from "@lifi/sdk"
import { DEMO_CHAINS, DEMO_TOKENS, getDemoQuote, executeDemoRoute, getDemoStatus } from "./demo-lifi"

// Network mode from environment
const networkMode = process.env.NEXT_PUBLIC_NETWORK_MODE || "mainnet"

// Demo mode - simulates LI.FI for hackathon demo
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

// BuildBear sandbox RPC URLs (when in buildbear mode)
const buildBearRpcs: Record<number, string> = {
  1: process.env.NEXT_PUBLIC_BUILDBEAR_ETHEREUM_RPC || "",
  137: process.env.NEXT_PUBLIC_BUILDBEAR_POLYGON_RPC || "",
  42161: process.env.NEXT_PUBLIC_BUILDBEAR_ARBITRUM_RPC || "",
  10: process.env.NEXT_PUBLIC_BUILDBEAR_OPTIMISM_RPC || "",
  8453: process.env.NEXT_PUBLIC_BUILDBEAR_BASE_RPC || "",
}

// Filter out empty RPCs
const getActiveRpcs = () => {
  if (networkMode !== "buildbear") return undefined
  const activeRpcs: Record<number, string[]> = {}
  for (const [chainId, rpc] of Object.entries(buildBearRpcs)) {
    if (rpc) activeRpcs[Number(chainId)] = [rpc]
  }
  return Object.keys(activeRpcs).length > 0 ? activeRpcs : undefined
}

// Initialize LI.FI SDK with optional BuildBear RPCs
export const lifiConfig = createConfig({
  integrator: "hylo-payments",
  rpcUrls: getActiveRpcs(),
})

// Supported chain IDs for HyLo (use testnet HyperEVM in non-mainnet modes)
const hyperEvmChainId = networkMode === "mainnet" ? 999 : 998
export const SUPPORTED_CHAIN_IDS = [1, 137, 42161, 10, 8453, hyperEvmChainId]

// Get chains supported by LI.FI
export async function getSupportedChains(): Promise<ExtendedChain[]> {
  // Demo mode: return mock chains
  if (isDemoMode) {
    return DEMO_CHAINS
  }

  try {
    const { getChains } = await import("@lifi/sdk")
    return await getChains()
  } catch (error) {
    console.error("Failed to fetch chains:", error)
    return []
  }
}

// Get tokens for a specific chain
export async function getTokensForChain(chainId: number): Promise<Token[]> {
  // Demo mode: return mock tokens
  if (isDemoMode) {
    return DEMO_TOKENS[chainId] || []
  }

  try {
    const { getTokens } = await import("@lifi/sdk")
    const result = await getTokens({ chains: [chainId] })
    return result.tokens[chainId] || []
  } catch (error) {
    console.error("Failed to fetch tokens:", error)
    return []
  }
}

// Quote parameters type
export interface QuoteParams {
  fromChain: number
  toChain: number
  fromToken: string
  toToken: string
  fromAmount: string
  fromAddress: string
  toAddress: string
}

// Get a quote for cross-chain swap/bridge
export async function getLifiQuote(params: QuoteParams): Promise<Route | null> {
  // Demo mode: return mock quote
  if (isDemoMode) {
    return getDemoQuote(params)
  }

  try {
    const result = await getRoutes({
      fromChainId: params.fromChain,
      toChainId: params.toChain,
      fromTokenAddress: params.fromToken,
      toTokenAddress: params.toToken,
      fromAmount: params.fromAmount,
      fromAddress: params.fromAddress,
      toAddress: params.toAddress,
    })
    return result.routes[0] || null
  } catch (error) {
    console.error("Failed to get quote:", error)
    throw error
  }
}

// Execute a route with status callbacks
export interface ExecuteCallbacks {
  onStepStarted?: (step: number) => void
  onStepCompleted?: (step: number) => void
  onError?: (error: Error) => void
  onSuccess?: (route: Route) => void
}

export async function executeLifiRoute(
  route: Route,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletClient: any,
  callbacks?: ExecuteCallbacks
): Promise<Route> {
  // Demo mode: simulate execution
  if (isDemoMode) {
    return executeDemoRoute(route, callbacks)
  }

  try {
    const executedRoute = await executeRoute(route, {
      updateRouteHook: (updatedRoute) => {
        // Track step progress
        const completedSteps = updatedRoute.steps.filter(
          (step) => step.execution?.status === "DONE"
        ).length
        callbacks?.onStepCompleted?.(completedSteps)
      },
      switchChainHook: async (requiredChainId) => {
        // Handle chain switching
        if (walletClient?.switchChain) {
          await walletClient.switchChain({ id: requiredChainId })
        }
        return walletClient
      },
    })

    callbacks?.onSuccess?.(executedRoute)
    return executedRoute
  } catch (error) {
    callbacks?.onError?.(error as Error)
    throw error
  }
}

// Get transaction status
export async function getTransactionStatus(txHash: string, fromChainId: number, toChainId: number) {
  try {
    const status = await getStatus({
      txHash,
      fromChain: fromChainId,
      toChain: toChainId,
    })
    return status
  } catch (error) {
    console.error("Failed to get status:", error)
    return null
  }
}

// Format route for display
export function formatRouteInfo(route: Route) {
  const steps = route.steps.map((step) => ({
    type: step.type,
    tool: step.tool,
    fromChain: step.action.fromChainId,
    toChain: step.action.toChainId,
    fromToken: step.action.fromToken.symbol,
    toToken: step.action.toToken.symbol,
    estimatedTime: step.estimate?.executionDuration || 0,
  }))

  const totalTime = steps.reduce((acc, step) => acc + step.estimatedTime, 0)
  const gasCost = route.gasCostUSD || "0"
  const outputAmount = route.toAmountMin

  return {
    steps,
    totalTime,
    gasCost,
    outputAmount,
    outputToken: route.toToken.symbol,
  }
}
