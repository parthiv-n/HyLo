"use client"

/**
 * DepositToHyperliquid - A reusable component for bridging tokens to HyperEVM
 *
 * This component provides a complete flow for:
 * 1. Selecting origin chain and token
 * 2. Getting a quote via LI.FI
 * 3. Executing the swap + bridge
 * 4. Tracking progress
 *
 * Usage:
 * ```tsx
 * import { DepositToHyperliquid } from '@/components/deposit/DepositToHyperliquid'
 *
 * function MyComponent() {
 *   return (
 *     <DepositToHyperliquid
 *       recipientAddress="0x..."
 *       defaultAmount="100"
 *       destinationToken="USDC"
 *       onSuccess={(route) => console.log('Deposit successful!', route)}
 *       onError={(error) => console.error('Deposit failed:', error)}
 *     />
 *   )
 * }
 * ```
 */

import { useState, useCallback, useEffect } from "react"
import { useAccount, useChainId, useSwitchChain, useWalletClient } from "wagmi"
import { parseUnits } from "viem"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn, formatAmount } from "@/lib/utils"
import { SUPPORTED_CHAINS, CHAIN_IDS } from "@/lib/chains"
import { getLifiQuote, executeLifiRoute, getTokensForChain } from "@/lib/lifi"
import {
  ArrowRight,
  Clock,
  Fuel,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import type { Route, Token } from "@lifi/sdk"

// Props interface
export interface DepositToHyperliquidProps {
  /** The recipient address on HyperEVM */
  recipientAddress: string
  /** Default amount to deposit (optional) */
  defaultAmount?: string
  /** Destination token symbol on HyperEVM (default: "USDC") */
  destinationToken?: "USDC" | "HYPE"
  /** Callback when deposit succeeds */
  onSuccess?: (route: Route) => void
  /** Callback when deposit fails */
  onError?: (error: Error) => void
  /** Custom class name for the container */
  className?: string
  /** Whether to show the compact version */
  compact?: boolean
}

// Component state
type DepositState = "idle" | "quoting" | "ready" | "executing" | "success" | "error"

// Popular tokens to prioritize
const POPULAR_TOKENS = ["USDC", "USDT", "ETH", "WETH", "DAI"]

export function DepositToHyperliquid({
  recipientAddress,
  defaultAmount = "",
  destinationToken = "USDC",
  onSuccess,
  onError,
  className,
  compact = false,
}: DepositToHyperliquidProps) {
  // Wallet hooks
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { data: walletClient } = useWalletClient()

  // Form state
  const [selectedChain, setSelectedChain] = useState<number | null>(null)
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState(defaultAmount)
  const [tokens, setTokens] = useState<Token[]>([])
  const [tokensLoading, setTokensLoading] = useState(false)

  // Transaction state
  const [state, setState] = useState<DepositState>("idle")
  const [route, setRoute] = useState<Route | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  // Load tokens when chain changes
  useEffect(() => {
    if (!selectedChain) return

    const loadTokens = async () => {
      setTokensLoading(true)
      try {
        const chainTokens = await getTokensForChain(selectedChain)
        const sorted = chainTokens.sort((a, b) => {
          const aIdx = POPULAR_TOKENS.indexOf(a.symbol)
          const bIdx = POPULAR_TOKENS.indexOf(b.symbol)
          if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
          if (aIdx !== -1) return -1
          if (bIdx !== -1) return 1
          return a.symbol.localeCompare(b.symbol)
        })
        setTokens(sorted)
      } catch (err) {
        console.error("Failed to load tokens:", err)
        setTokens([])
      } finally {
        setTokensLoading(false)
      }
    }

    loadTokens()
  }, [selectedChain])

  // Get quote
  const handleGetQuote = useCallback(async () => {
    if (!address || !selectedChain || !selectedToken || !amount) return

    setState("quoting")
    setError(null)

    try {
      // Switch chain if needed
      if (chainId !== selectedChain) {
        await switchChain({ chainId: selectedChain })
      }

      const amountInUnits = parseUnits(amount, selectedToken.decimals).toString()

      const quote = await getLifiQuote({
        fromChain: selectedChain,
        toChain: CHAIN_IDS.HYPEREVM,
        fromToken: selectedToken.address,
        toToken: "0x0000000000000000000000000000000000000000", // Native token placeholder
        fromAmount: amountInUnits,
        fromAddress: address,
        toAddress: recipientAddress,
      })

      if (quote) {
        setRoute(quote)
        setState("ready")
      } else {
        setError("No route found for this swap")
        setState("error")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get quote"
      setError(message)
      setState("error")
      onError?.(err instanceof Error ? err : new Error(message))
    }
  }, [address, selectedChain, selectedToken, amount, chainId, switchChain, recipientAddress, onError])

  // Execute deposit
  const handleExecute = useCallback(async () => {
    if (!route || !walletClient) return

    setState("executing")
    setCurrentStep(0)
    setError(null)

    try {
      const result = await executeLifiRoute(route, walletClient, {
        onStepCompleted: (step) => setCurrentStep(step),
        onSuccess: (completedRoute) => {
          setState("success")
          onSuccess?.(completedRoute)
        },
        onError: (err) => {
          setError(err.message)
          setState("error")
          onError?.(err)
        },
      })

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Execution failed"
      setError(message)
      setState("error")
      onError?.(err instanceof Error ? err : new Error(message))
    }
  }, [route, walletClient, onSuccess, onError])

  // Reset
  const handleReset = () => {
    setState("idle")
    setRoute(null)
    setError(null)
    setCurrentStep(0)
  }

  // Render compact version
  if (compact) {
    return (
      <div className={cn("p-4 rounded-xl bg-white/5 border border-white/10", className)}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">Deposit to HyperEVM</h3>
            <p className="text-white/50 text-sm">Bridge any token</p>
          </div>
        </div>

        {state === "success" ? (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span>Deposit successful!</span>
          </div>
        ) : (
          <Button
            onClick={() => setState("idle")}
            className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-lg"
            disabled={!isConnected}
          >
            {isConnected ? "Start Deposit" : "Connect Wallet"}
          </Button>
        )}
      </div>
    )
  }

  // Render full version
  return (
    <Card className={cn("bg-zinc-900/50 border-white/10", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </div>
          Deposit to HyperEVM
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Not connected state */}
        {!isConnected && (
          <div className="text-center py-6">
            <p className="text-white/50 mb-4">Connect your wallet to deposit</p>
          </div>
        )}

        {/* Idle / Form state */}
        {isConnected && (state === "idle" || state === "quoting" || state === "error") && (
          <>
            {/* Chain selector */}
            <div>
              <label className="text-sm text-white/50 mb-2 block">From Chain</label>
              <Select
                value={selectedChain?.toString() || ""}
                onValueChange={(v) => {
                  setSelectedChain(parseInt(v))
                  setSelectedToken(null)
                }}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl">
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {SUPPORTED_CHAINS.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      <div className="flex items-center gap-2">
                        <img src={chain.logo} alt={chain.name} className="w-5 h-5 rounded-full" />
                        {chain.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Token selector */}
            <div>
              <label className="text-sm text-white/50 mb-2 block">Token</label>
              <Select
                value={selectedToken?.address || ""}
                onValueChange={(v) => {
                  const token = tokens.find((t) => t.address === v)
                  if (token) setSelectedToken(token)
                }}
                disabled={!selectedChain || tokensLoading}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl">
                  {tokensLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    <SelectValue placeholder="Select token" />
                  )}
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 max-h-60">
                  {tokens.slice(0, 30).map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      <div className="flex items-center gap-2">
                        {token.logoURI && (
                          <img src={token.logoURI} alt={token.symbol} className="w-5 h-5 rounded-full" />
                        )}
                        {token.symbol}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount input */}
            <div>
              <label className="text-sm text-white/50 mb-2 block">Amount</label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    if (e.target.value === "" || /^\d*\.?\d*$/.test(e.target.value)) {
                      setAmount(e.target.value)
                    }
                  }}
                  placeholder="0.00"
                  className="bg-white/5 border-white/10 text-white h-12 rounded-xl pr-20 text-lg"
                />
                {selectedToken && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50">
                    {selectedToken.symbol}
                  </span>
                )}
              </div>
            </div>

            {/* Destination info */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <span className="text-white/50 text-sm">Destination</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                  HyperEVM
                </Badge>
                <span className="text-white text-sm">{destinationToken}</span>
              </div>
            </div>

            {/* Error message */}
            {error && state === "error" && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Get quote button */}
            <Button
              onClick={handleGetQuote}
              disabled={!selectedChain || !selectedToken || !amount || state === "quoting"}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/10 rounded-xl"
            >
              {state === "quoting" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Getting Quote...
                </>
              ) : (
                "Get Quote"
              )}
            </Button>
          </>
        )}

        {/* Ready state - show quote */}
        {state === "ready" && route && (
          <>
            {/* Quote summary */}
            <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/50">You pay</span>
                <span className="text-white font-medium">
                  {formatAmount(amount)} {selectedToken?.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">You receive</span>
                <span className="text-emerald-400 font-medium">
                  ~{formatAmount(route.toAmountMin)} {route.toToken.symbol}
                </span>
              </div>
              <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                <div className="flex items-center gap-1 text-white/50 text-sm">
                  <Clock className="w-4 h-4" />
                  ~{Math.round(route.steps.reduce((a, s) => a + (s.estimate?.executionDuration || 0), 0) / 60)}min
                </div>
                <div className="flex items-center gap-1 text-white/50 text-sm">
                  <Fuel className="w-4 h-4" />
                  ${formatAmount(route.gasCostUSD || "0", 2)}
                </div>
              </div>
            </div>

            {/* Route steps */}
            <div className="space-y-2">
              {route.steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-white/70">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">
                    {idx + 1}
                  </div>
                  <span className="capitalize">{step.type}</span>
                  <span className="text-white/30">via {step.tool}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 border-white/10 text-white hover:bg-white/10 h-12 rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={handleExecute}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-12 rounded-xl"
              >
                Confirm Deposit
              </Button>
            </div>
          </>
        )}

        {/* Executing state */}
        {state === "executing" && route && (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
            <div>
              <p className="text-white font-medium">Processing Deposit</p>
              <p className="text-white/50 text-sm">
                Step {currentStep + 1} of {route.steps.length}
              </p>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${((currentStep + 1) / route.steps.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Success state */}
        {state === "success" && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-medium">Deposit Successful!</p>
              <p className="text-white/50 text-sm">
                Your funds are now on HyperEVM
              </p>
            </div>
            <Button onClick={handleReset} variant="outline" className="border-white/10 text-white">
              Make Another Deposit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Export types for external use
export type { DepositState }
