"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useAccount, useChainId, useSwitchChain, useWalletClient } from "wagmi"
import { parseUnits } from "viem"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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
  X,
  Wallet,
} from "lucide-react"
import type { Route, Token } from "@lifi/sdk"

type WidgetStep = "connect" | "configure" | "quote" | "execute" | "success" | "error"

// Popular tokens to show first
const POPULAR_TOKENS = ["USDC", "USDT", "ETH", "WETH", "DAI"]

// Wrapper component to handle Suspense for useSearchParams
export default function WidgetPage() {
  return (
    <Suspense fallback={<WidgetLoading />}>
      <WidgetContent />
    </Suspense>
  )
}

function WidgetLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
    </div>
  )
}

function WidgetContent() {
  const searchParams = useSearchParams()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { data: walletClient } = useWalletClient()

  // URL params
  const recipient = searchParams.get("recipient") || ""
  const initialAmount = searchParams.get("amount") || ""
  const destinationToken = searchParams.get("token") || "USDC"
  const initialChainId = searchParams.get("chainId")
  const theme = searchParams.get("theme") || "dark"
  const primaryColor = searchParams.get("color") || "#22c55e"

  // State
  const [step, setStep] = useState<WidgetStep>("connect")
  const [selectedChain, setSelectedChain] = useState<number | null>(
    initialChainId ? parseInt(initialChainId) : null
  )
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState(initialAmount)
  const [tokens, setTokens] = useState<Token[]>([])
  const [tokensLoading, setTokensLoading] = useState(false)
  const [route, setRoute] = useState<Route | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [executeStatus, setExecuteStatus] = useState<string>("idle")
  const [currentExecuteStep, setCurrentExecuteStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  // Notify parent that widget is ready
  useEffect(() => {
    window.parent.postMessage({ type: "HYLO_READY" }, "*")
  }, [])

  // Update step based on connection
  useEffect(() => {
    if (isConnected && step === "connect") {
      setStep("configure")
    } else if (!isConnected && step !== "connect") {
      setStep("connect")
    }
  }, [isConnected, step])

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
      } catch {
        setTokens([])
      } finally {
        setTokensLoading(false)
      }
    }

    loadTokens()
  }, [selectedChain])

  // Close widget
  const handleClose = () => {
    window.parent.postMessage({ type: "HYLO_CLOSE" }, "*")
  }

  // Get quote
  const handleGetQuote = useCallback(async () => {
    if (!address || !selectedChain || !selectedToken || !amount || !recipient) return

    setQuoteLoading(true)
    setQuoteError(null)

    try {
      if (chainId !== selectedChain) {
        await switchChain({ chainId: selectedChain })
      }

      const amountInUnits = parseUnits(amount, selectedToken.decimals).toString()

      const quote = await getLifiQuote({
        fromChain: selectedChain,
        toChain: CHAIN_IDS.HYPEREVM,
        fromToken: selectedToken.address,
        toToken: "0x0000000000000000000000000000000000000000",
        fromAmount: amountInUnits,
        fromAddress: address,
        toAddress: recipient,
      })

      if (quote) {
        setRoute(quote)
        setStep("quote")
      } else {
        setQuoteError("No route found")
      }
    } catch (err) {
      setQuoteError(err instanceof Error ? err.message : "Failed to get quote")
    } finally {
      setQuoteLoading(false)
    }
  }, [address, selectedChain, selectedToken, amount, recipient, chainId, switchChain])

  // Execute deposit
  const handleExecute = useCallback(async () => {
    if (!route || !walletClient) return

    setStep("execute")
    setExecuteStatus("approving")
    setCurrentExecuteStep(0)
    setError(null)

    try {
      const result = await executeLifiRoute(route, walletClient, {
        onStepCompleted: (step) => setCurrentExecuteStep(step),
        onSuccess: (completedRoute) => {
          setStep("success")
          // Notify parent
          window.parent.postMessage({
            type: "HYLO_SUCCESS",
            payload: {
              txHash: txHash,
              amount: route.toAmountMin,
              token: route.toToken.symbol,
              recipient,
              fromChainId: route.fromChainId,
              toChainId: route.toChainId,
            },
          }, "*")
        },
        onError: (err) => {
          setError(err.message)
          setStep("error")
          window.parent.postMessage({
            type: "HYLO_ERROR",
            payload: {
              code: "BRIDGE_ERROR",
              message: err.message,
            },
          }, "*")
        },
      })

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Execution failed"
      setError(message)
      setStep("error")
      window.parent.postMessage({
        type: "HYLO_ERROR",
        payload: {
          code: "BRIDGE_ERROR",
          message,
        },
      }, "*")
    }
  }, [route, walletClient, recipient, txHash])

  // Render based on step
  return (
    <div className={cn("min-h-screen bg-zinc-950 text-white p-4", theme === "light" && "bg-white text-zinc-900")}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, #06b6d4)` }}
          >
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="font-semibold">HyLo</span>
        </div>
        <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Connect Step */}
      {step === "connect" && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-white/50" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Connect Wallet</h2>
          <p className="text-white/50 text-center mb-6">
            Connect your wallet to deposit to Hyperliquid
          </p>
          <ConnectButton />
        </div>
      )}

      {/* Configure Step */}
      {step === "configure" && (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold mb-1">Deposit to Hyperliquid</h2>
            <p className="text-white/50 text-sm">
              From any chain, receive {destinationToken} on HyperEVM
            </p>
          </div>

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
              <SelectContent className="bg-zinc-900 border-white/10 max-h-48">
                {tokens.slice(0, 20).map((token) => (
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

          {/* Amount */}
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
                className="bg-white/5 border-white/10 text-white h-12 rounded-xl pr-16 text-lg"
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
            <span className="text-white/50 text-sm">Receiving on</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                HyperEVM
              </Badge>
              <span className="text-sm">{destinationToken}</span>
            </div>
          </div>

          {/* Min warning */}
          {parseFloat(amount) > 0 && parseFloat(amount) < 5 && (
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <p className="text-amber-400 text-sm">Minimum deposit is 5 USDC</p>
            </div>
          )}

          {/* Quote error */}
          {quoteError && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{quoteError}</p>
            </div>
          )}

          {/* Get Quote Button */}
          <Button
            onClick={handleGetQuote}
            disabled={!selectedChain || !selectedToken || !amount || parseFloat(amount) <= 0 || quoteLoading}
            className="w-full h-12 rounded-xl font-semibold"
            style={{ background: primaryColor }}
          >
            {quoteLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Getting Quote...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      )}

      {/* Quote Step */}
      {step === "quote" && route && (
        <div className="space-y-4">
          <div className="text-center mb-2">
            <h2 className="text-xl font-semibold">Confirm Deposit</h2>
          </div>

          {/* Quote summary */}
          <Card className="bg-white/5 border-white/10 rounded-2xl">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {route.fromToken.logoURI && (
                    <img src={route.fromToken.logoURI} alt="" className="w-8 h-8 rounded-full" />
                  )}
                  <div>
                    <p className="font-medium">{formatAmount(amount)} {route.fromToken.symbol}</p>
                    <p className="text-white/50 text-sm">From {SUPPORTED_CHAINS.find(c => c.id === route.fromChainId)?.name}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/30" />
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-medium text-emerald-400">~{formatAmount(route.toAmountMin)} {route.toToken.symbol}</p>
                    <p className="text-white/50 text-sm">To HyperEVM</p>
                  </div>
                  {route.toToken.logoURI && (
                    <img src={route.toToken.logoURI} alt="" className="w-8 h-8 rounded-full" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-white/10 text-sm text-white/50">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  ~{Math.round(route.steps.reduce((a, s) => a + (s.estimate?.executionDuration || 0), 0) / 60)}min
                </div>
                <div className="flex items-center gap-1">
                  <Fuel className="w-4 h-4" />
                  ${formatAmount(route.gasCostUSD || "0", 2)} gas
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Route steps */}
          <div className="space-y-2">
            {route.steps.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-white/70">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">
                  {idx + 1}
                </div>
                <span className="capitalize">{s.type}</span>
                <span className="text-white/30">via {s.tool}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep("configure")}
              className="flex-1 border-white/10 text-white hover:bg-white/10 h-12 rounded-xl"
            >
              Back
            </Button>
            <Button
              onClick={handleExecute}
              className="flex-1 h-12 rounded-xl font-semibold"
              style={{ background: primaryColor }}
            >
              Deposit Now
            </Button>
          </div>
        </div>
      )}

      {/* Execute Step */}
      {step === "execute" && route && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: primaryColor }} />
          <h2 className="text-xl font-semibold mb-2">Processing Deposit</h2>
          <p className="text-white/50 text-sm mb-4">
            Step {currentExecuteStep + 1} of {route.steps.length}
          </p>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full transition-all"
              style={{ 
                width: `${((currentExecuteStep + 1) / route.steps.length) * 100}%`,
                background: primaryColor 
              }}
            />
          </div>
          <p className="text-white/30 text-sm mt-4">Please confirm in your wallet</p>
        </div>
      )}

      {/* Success Step */}
      {step === "success" && (
        <div className="flex flex-col items-center justify-center py-8">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: `${primaryColor}20` }}
          >
            <CheckCircle2 className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <h2 className="text-xl font-semibold mb-2">Deposit Successful!</h2>
          <p className="text-white/50 text-center mb-6">
            Your funds are now on HyperEVM
          </p>
          <Button onClick={handleClose} className="h-12 px-8 rounded-xl" style={{ background: primaryColor }}>
            Done
          </Button>
        </div>
      )}

      {/* Error Step */}
      {step === "error" && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Deposit Failed</h2>
          <p className="text-white/50 text-center mb-2">{error || "Something went wrong"}</p>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-white/10 text-white hover:bg-white/10 h-12 rounded-xl"
            >
              Close
            </Button>
            <Button
              onClick={() => setStep("configure")}
              className="h-12 rounded-xl"
              style={{ background: primaryColor }}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-white/20 text-xs">
          Powered by LI.FI × Hyperliquid
        </p>
      </div>
    </div>
  )
}
