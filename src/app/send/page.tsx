"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAccount, useChainId, useSwitchChain } from "wagmi"
import { parseUnits } from "viem"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ConnectButton } from "@/components/wallet/ConnectButton"
import { QRScanner } from "@/components/payment/QRScanner"
import { TokenSelector } from "@/components/payment/TokenSelector"
import { QuotePreview } from "@/components/payment/QuotePreview"
import { TransactionProgress } from "@/components/payment/TransactionProgress"
import { useLifiQuote } from "@/hooks/useLifiQuote"
import { useLifiExecute } from "@/hooks/useLifiExecute"
import { useTransactionStore } from "@/hooks/useTransactionStore"
import { formatAddress } from "@/lib/utils"
import { CHAIN_IDS } from "@/lib/chains"
import { ArrowLeft, ScanLine, X, AlertCircle } from "lucide-react"
import type { Token } from "@lifi/sdk"

type Step = "recipient" | "amount" | "quote" | "execute"

export default function SendPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  // State
  const [step, setStep] = useState<Step>("recipient")
  const [showScanner, setShowScanner] = useState(false)
  const [recipient, setRecipient] = useState("")
  const [requestedAmount, setRequestedAmount] = useState("")
  const [selectedChain, setSelectedChain] = useState<number | null>(null)
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState("")

  // Hooks
  const { route, loading: quoteLoading, error: quoteError, fetchQuote, clearQuote } = useLifiQuote()
  const { status, currentStep, totalSteps, txHash, error: executeError, execute, reset } = useLifiExecute()
  const { addTransaction, updateTransaction } = useTransactionStore()

  // Handle QR scan
  const handleScan = useCallback((data: { address: string; amount?: string; chain?: number }) => {
    setRecipient(data.address)
    if (data.amount) {
      setRequestedAmount(data.amount)
      setAmount(data.amount)
    }
    setShowScanner(false)
    setStep("amount")
  }, [])

  // Handle recipient input
  const handleRecipientSubmit = () => {
    if (recipient && recipient.startsWith("0x") && recipient.length === 42) {
      setStep("amount")
    }
  }

  // Handle getting quote
  const handleGetQuote = async () => {
    if (!address || !selectedChain || !selectedToken || !amount || !recipient) return

    // Switch chain if needed
    if (chainId !== selectedChain) {
      try {
        await switchChain({ chainId: selectedChain })
      } catch {
        // User rejected or failed
        return
      }
    }

    const amountInSmallestUnit = parseUnits(amount, selectedToken.decimals).toString()

    await fetchQuote({
      fromChain: selectedChain,
      toChain: CHAIN_IDS.HYPEREVM,
      fromToken: selectedToken.address,
      toToken: "0x0000000000000000000000000000000000000000", // Native USDC on HyperEVM
      fromAmount: amountInSmallestUnit,
      fromAddress: address,
      toAddress: recipient,
    })

    setStep("quote")
  }

  // Handle confirm and execute
  const handleConfirm = async () => {
    if (!route || !selectedToken) return

    setStep("execute")

    const txId = addTransaction({
      fromChain: route.fromChainId,
      toChain: route.toChainId,
      fromToken: route.fromToken.symbol,
      toToken: route.toToken.symbol,
      fromAmount: amount,
      toAmount: route.toAmountMin,
      recipient,
      status: "pending",
    })

    const result = await execute(route)

    if (result) {
      updateTransaction(txId, { status: "completed", txHash: txHash || undefined })
    } else {
      updateTransaction(txId, { status: "failed" })
    }
  }

  // Handle retry
  const handleRetry = () => {
    reset()
    setStep("quote")
    handleGetQuote()
  }

  // Handle home
  const handleHome = () => {
    router.push("/")
  }

  // Handle back
  const handleBack = () => {
    if (step === "execute") return
    if (step === "quote") {
      clearQuote()
      setStep("amount")
    } else if (step === "amount") {
      setStep("recipient")
    } else {
      router.push("/")
    }
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
        <p className="text-white/50 mb-4">Connect your wallet to send payments</p>
        <ConnectButton />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Scanner overlay */}
      {showScanner && (
        <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}

      {/* Header */}
      <header className="flex items-center justify-between p-4 safe-top">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          disabled={step === "execute" && status !== "completed" && status !== "failed"}
          className="text-white hover:bg-white/10 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </Button>
        <h1 className="text-white font-semibold text-lg">Send Payment</h1>
        <div className="w-20" />
      </header>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Step 1: Recipient */}
        {step === "recipient" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Who are you paying?</h2>
              <p className="text-white/50">Scan a QR code or enter an address</p>
            </div>

            {/* Scan button */}
            <Button
              onClick={() => setShowScanner(true)}
              className="w-full h-32 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center gap-3"
            >
              <ScanLine className="w-10 h-10 text-emerald-400" />
              <span className="text-white font-semibold">Scan QR Code</span>
            </Button>

            {/* Or divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-sm">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Manual input */}
            <div>
              <label className="block text-sm text-white/50 mb-2">
                Recipient Address
              </label>
              <Input
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="bg-white/5 border-white/10 text-white font-mono h-14 rounded-xl"
              />
            </div>

            <Button
              onClick={handleRecipientSubmit}
              disabled={!recipient || !recipient.startsWith("0x") || recipient.length !== 42}
              className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/10 disabled:text-white/30 rounded-xl font-semibold"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Amount & Token Selection */}
        {step === "amount" && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-white mb-2">How much?</h2>
              <p className="text-white/50">
                Sending to{" "}
                <span className="text-white font-mono">{formatAddress(recipient)}</span>
              </p>
              {requestedAmount && (
                <p className="text-emerald-400 text-sm mt-1">
                  Requested: {requestedAmount} USDC
                </p>
              )}
            </div>

            <TokenSelector
              selectedChain={selectedChain}
              selectedToken={selectedToken}
              amount={amount}
              onChainChange={setSelectedChain}
              onTokenChange={setSelectedToken}
              onAmountChange={setAmount}
            />

            {/* Minimum warning */}
            {parseFloat(amount) > 0 && parseFloat(amount) < 5 && (
              <Card className="bg-amber-500/10 border-amber-500/20 rounded-xl">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-400 font-medium text-sm">Minimum Amount</p>
                    <p className="text-white/50 text-sm">
                      Hyperliquid requires a minimum of 5 USDC for deposits
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={handleGetQuote}
              disabled={!selectedChain || !selectedToken || !amount || parseFloat(amount) <= 0}
              className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/10 disabled:text-white/30 rounded-xl font-semibold"
            >
              Get Quote
            </Button>
          </div>
        )}

        {/* Step 3: Quote Preview */}
        {step === "quote" && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-white mb-2">Review Payment</h2>
              <p className="text-white/50">
                Sending to{" "}
                <span className="text-white font-mono">{formatAddress(recipient)}</span>
              </p>
            </div>

            <QuotePreview
              route={route}
              loading={quoteLoading}
              error={quoteError}
              onRefresh={handleGetQuote}
              onConfirm={handleConfirm}
            />
          </div>
        )}

        {/* Step 4: Execution */}
        {step === "execute" && (
          <TransactionProgress
            status={status}
            currentStep={currentStep}
            totalSteps={totalSteps}
            txHash={txHash}
            error={executeError}
            fromAmount={amount}
            fromToken={selectedToken?.symbol || ""}
            toAmount={route?.toAmountMin || "0"}
            toToken={route?.toToken.symbol || "USDC"}
            recipient={recipient}
            onRetry={handleRetry}
            onHome={handleHome}
          />
        )}
      </div>
    </main>
  )
}
