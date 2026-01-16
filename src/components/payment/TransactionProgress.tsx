"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  ExternalLink,
  Home,
  RotateCcw,
} from "lucide-react"
import type { ExecutionStatus } from "@/hooks/useLifiExecute"

interface TransactionProgressProps {
  status: ExecutionStatus
  currentStep: number
  totalSteps: number
  txHash: string | null
  error: string | null
  fromAmount: string
  fromToken: string
  toAmount: string
  toToken: string
  recipient: string
  onRetry?: () => void
  onHome?: () => void
}

const STATUS_CONFIG: Record<
  ExecutionStatus,
  { label: string; description: string; icon: React.ReactNode }
> = {
  idle: {
    label: "Ready",
    description: "Transaction not started",
    icon: <Circle className="w-6 h-6 text-white/30" />,
  },
  approving: {
    label: "Approving",
    description: "Please approve the transaction in your wallet",
    icon: <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />,
  },
  swapping: {
    label: "Swapping",
    description: "Exchanging tokens on source chain",
    icon: <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />,
  },
  bridging: {
    label: "Bridging",
    description: "Transferring to HyperEVM",
    icon: <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />,
  },
  confirming: {
    label: "Confirming",
    description: "Waiting for final confirmation",
    icon: <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />,
  },
  completed: {
    label: "Completed!",
    description: "Payment sent successfully",
    icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
  },
  failed: {
    label: "Failed",
    description: "Transaction could not be completed",
    icon: <XCircle className="w-6 h-6 text-red-400" />,
  },
}

const STEPS = ["Approve", "Swap", "Bridge", "Confirm"]

export function TransactionProgress({
  status,
  currentStep,
  totalSteps,
  txHash,
  error,
  fromAmount,
  fromToken,
  toAmount,
  toToken,
  recipient,
  onRetry,
  onHome,
}: TransactionProgressProps) {
  const config = STATUS_CONFIG[status]
  const isCompleted = status === "completed"
  const isFailed = status === "failed"
  const isProcessing = !isCompleted && !isFailed && status !== "idle"

  return (
    <div className="flex flex-col items-center space-y-6 py-8">
      {/* Status Icon */}
      <div
        className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center",
          isCompleted && "bg-emerald-500/20",
          isFailed && "bg-red-500/20",
          isProcessing && "bg-white/10"
        )}
      >
        <div className="scale-150">{config.icon}</div>
      </div>

      {/* Status Text */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{config.label}</h2>
        <p className="text-white/50">{config.description}</p>
        {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
      </div>

      {/* Progress Steps */}
      {isProcessing && (
        <div className="w-full max-w-xs">
          <div className="flex justify-between mb-2">
            {STEPS.slice(0, totalSteps || 4).map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    index < currentStep
                      ? "bg-emerald-500 text-white"
                      : index === currentStep
                      ? "bg-white/20 text-white ring-2 ring-emerald-400"
                      : "bg-white/10 text-white/30"
                  )}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1",
                    index <= currentStep ? "text-white/70" : "text-white/30"
                  )}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{
                width: `${(currentStep / (totalSteps || 4)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Transaction Summary */}
      <Card className="w-full bg-white/5 border-white/10 rounded-2xl">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white/50 text-sm">Amount</span>
            <span className="text-white font-medium">
              {fromAmount} {fromToken} → {toAmount} {toToken}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/50 text-sm">Recipient</span>
            <span className="text-white font-mono text-sm">
              {recipient.slice(0, 6)}...{recipient.slice(-4)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Hash */}
      {txHash && (
        <a
          href={`https://explorer.hyperliquid.xyz/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <span className="font-mono text-sm">
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </span>
          <ExternalLink className="w-4 h-4" />
        </a>
      )}

      {/* Action Buttons */}
      {(isCompleted || isFailed) && (
        <div className="flex gap-3 w-full max-w-xs">
          {isFailed && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10 h-12 rounded-xl"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
          {onHome && (
            <Button
              onClick={onHome}
              className={cn(
                "flex-1 h-12 rounded-xl",
                isCompleted
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-white/10 hover:bg-white/20"
              )}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
