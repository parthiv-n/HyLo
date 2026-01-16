import { createConfig, getQuote, getRoutes, getStatus, executeRoute, type Route, type Token, type ExtendedChain, type LiFiStep } from "@lifi/sdk"

// Initialize LI.FI SDK
export const lifiConfig = createConfig({
  integrator: "hylo-payments",
})

// Supported chain IDs for HyLo
export const SUPPORTED_CHAIN_IDS = [1, 137, 42161, 10, 8453, 56, 999]

// Get chains supported by LI.FI
export async function getSupportedChains(): Promise<ExtendedChain[]> {
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
