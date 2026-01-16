"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatAmount } from "@/lib/utils"
import { ArrowRight, Clock, Fuel, RefreshCw, AlertCircle, Loader2 } from "lucide-react"
import type { Route } from "@lifi/sdk"

interface QuotePreviewProps {
  route: Route | null
  loading: boolean
  error: string | null
  onRefresh: () => void
  onConfirm: () => void
}

export function QuotePreview({
  route,
  loading,
  error,
  onRefresh,
  onConfirm,
}: QuotePreviewProps) {
  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10 rounded-2xl">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
          <p className="text-white/70">Finding best route...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-500/10 border-red-500/20 rounded-2xl">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
          <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
          <p className="text-red-400 text-center mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={onRefresh}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!route) {
    return null
  }

  const totalTime = route.steps.reduce(
    (acc, step) => acc + (step.estimate?.executionDuration || 0),
    0
  )
  const gasCost = route.gasCostUSD || "0"
  const fromToken = route.fromToken
  const toToken = route.toToken

  return (
    <Card className="bg-white/5 border-white/10 rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        {/* Header with tokens */}
        <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {fromToken.logoURI && (
                <img
                  src={fromToken.logoURI}
                  alt={fromToken.symbol}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="text-white font-semibold">
                  {formatAmount(route.fromAmount, 6)} {fromToken.symbol}
                </p>
                <p className="text-white/50 text-sm">
                  From {route.fromChainId === 1 ? "Ethereum" : `Chain ${route.fromChainId}`}
                </p>
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-emerald-400" />

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-white font-semibold">
                  {formatAmount(route.toAmountMin, 6)} {toToken.symbol}
                </p>
                <p className="text-white/50 text-sm">To HyperEVM</p>
              </div>
              {toToken.logoURI && (
                <img
                  src={toToken.logoURI}
                  alt={toToken.symbol}
                  className="w-10 h-10 rounded-full"
                />
              )}
            </div>
          </div>
        </div>

        {/* Route steps */}
        <div className="p-6 border-t border-white/5">
          <h4 className="text-white/50 text-sm mb-3">Route Steps</h4>
          <div className="space-y-2">
            {route.steps.map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium capitalize">
                    {(step.type as string) === "swap" ? "Swap" : (step.type as string) === "cross" ? "Bridge" : step.type}
                  </p>
                  <p className="text-white/50 text-xs">via {step.tool}</p>
                </div>
                <Badge variant="outline" className="border-white/20 text-white/50">
                  ~{Math.round((step.estimate?.executionDuration || 0) / 60)}min
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 pb-4 flex gap-4">
          <div className="flex items-center gap-2 text-white/50">
            <Clock className="w-4 h-4" />
            <span className="text-sm">~{Math.round(totalTime / 60)} min</span>
          </div>
          <div className="flex items-center gap-2 text-white/50">
            <Fuel className="w-4 h-4" />
            <span className="text-sm">${formatAmount(gasCost, 2)} gas</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="ml-auto text-white/50 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Confirm button */}
        <div className="p-4 bg-white/5">
          <Button
            onClick={onConfirm}
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg rounded-xl"
          >
            Confirm & Send
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
