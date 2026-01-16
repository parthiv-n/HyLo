"use client"

import { useRouter } from "next/navigation"
import { useTransactionStore } from "@/hooks/useTransactionStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatAddress, formatAmount } from "@/lib/utils"
import { ArrowLeft, ArrowUpRight, ExternalLink, Trash2 } from "lucide-react"

export default function HistoryPage() {
  const router = useRouter()
  const { transactions, clearTransactions } = useTransactionStore()

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-emerald-400 border-emerald-400/30"
      case "pending":
        return "text-amber-400 border-amber-400/30"
      case "failed":
        return "text-red-400 border-red-400/30"
      default:
        return "text-white/50 border-white/20"
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between p-4 safe-top">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="text-white hover:bg-white/10 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </Button>
        <h1 className="text-white font-semibold text-lg">Transaction History</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearTransactions}
          disabled={transactions.length === 0}
          className="text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 p-6">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <ArrowUpRight className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/50 mb-2">No transactions yet</p>
            <p className="text-white/30 text-sm">
              Your payment history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <Card
                key={tx.id}
                className="bg-white/5 border-white/10 rounded-2xl overflow-hidden"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {formatAmount(tx.fromAmount)} {tx.fromToken}
                        </p>
                        <p className="text-white/40 text-sm">
                          → {formatAmount(tx.toAmount)} {tx.toToken}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={getStatusColor(tx.status)}
                    >
                      {tx.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-white/40">To: </span>
                      <span className="text-white/70 font-mono">
                        {formatAddress(tx.recipient)}
                      </span>
                    </div>
                    <span className="text-white/30">{formatDate(tx.timestamp)}</span>
                  </div>

                  {tx.txHash && (
                    <a
                      href={`https://explorer.hyperliquid.xyz/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-emerald-400/70 hover:text-emerald-400 text-sm mt-3"
                    >
                      View on Explorer
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
