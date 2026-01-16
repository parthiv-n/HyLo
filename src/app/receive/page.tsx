"use client"

import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { ConnectButton } from "@/components/wallet/ConnectButton"
import { QRGenerator } from "@/components/payment/QRGenerator"
import { ArrowLeft } from "lucide-react"

export default function ReceivePage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()

  if (!isConnected || !address) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
        <p className="text-white/50 mb-4">Connect your wallet to receive payments</p>
        <ConnectButton />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-1/4 w-1/2 h-1/2 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-1/4 w-1/2 h-1/2 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 safe-top">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="text-white hover:bg-white/10 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </Button>
        <h1 className="text-white font-semibold text-lg">Receive Payment</h1>
        <div className="w-20" />
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Your Payment QR</h2>
          <p className="text-white/50">
            Share this code to receive payments on HyperEVM
          </p>
        </div>

        <QRGenerator address={address} />

        {/* Info */}
        <div className="mt-8 max-w-sm text-center">
          <p className="text-white/40 text-sm">
            Senders can pay from any chain. Funds will arrive as USDC on HyperEVM.
          </p>
        </div>
      </div>
    </main>
  )
}
