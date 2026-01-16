"use client"

import Link from "next/link"
import { useAccount } from "wagmi"
import { ConnectButton } from "@/components/wallet/ConnectButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownLeft, Zap, Shield, Globe } from "lucide-react"

export default function HomePage() {
  const { isConnected } = useAccount()

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 safe-top">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="text-white font-bold text-xl">HyLo</span>
        </div>
        <ConnectButton />
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Send money
            <br />
            <span className="gradient-text">anywhere, instantly</span>
          </h1>
          <p className="text-white/60 text-lg max-w-md mx-auto">
            Cross-chain payments made simple. Send from any chain, receive on Hyperliquid.
          </p>
        </div>

        {/* Action buttons */}
        {isConnected ? (
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-12">
            <Link href="/send" className="block">
              <Card className="bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer group h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowUpRight className="w-8 h-8 text-emerald-400" />
                  </div>
                  <span className="text-white font-semibold text-lg">Send</span>
                  <span className="text-white/50 text-sm text-center">
                    Scan QR to pay
                  </span>
                </CardContent>
              </Card>
            </Link>

            <Link href="/receive" className="block">
              <Card className="bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20 transition-colors cursor-pointer group h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowDownLeft className="w-8 h-8 text-cyan-400" />
                  </div>
                  <span className="text-white font-semibold text-lg">Receive</span>
                  <span className="text-white/50 text-sm text-center">
                    Show your QR
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>
        ) : (
          <div className="text-center mb-12">
            <p className="text-white/50 mb-4">Connect your wallet to get started</p>
            <ConnectButton />
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-md">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-2">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-white/70 text-sm">Instant</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-2">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-white/70 text-sm">Secure</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-2">
              <Globe className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-white/70 text-sm">Any Chain</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 p-4 text-center safe-bottom">
        <p className="text-white/30 text-sm">
          Powered by{" "}
          <a
            href="https://li.fi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400/70 hover:text-emerald-400"
          >
            LI.FI
          </a>
          {" "}×{" "}
          <a
            href="https://hyperliquid.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400/70 hover:text-cyan-400"
          >
            Hyperliquid
          </a>
        </p>
      </footer>
    </main>
  )
}
