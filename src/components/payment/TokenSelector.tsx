"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { SUPPORTED_CHAINS } from "@/lib/chains"
import { getTokensForChain } from "@/lib/lifi"
import { ChevronDown, Loader2 } from "lucide-react"
import type { Token } from "@lifi/sdk"

interface TokenSelectorProps {
  selectedChain: number | null
  selectedToken: Token | null
  amount: string
  onChainChange: (chainId: number) => void
  onTokenChange: (token: Token) => void
  onAmountChange: (amount: string) => void
}

// Common tokens to show first
const POPULAR_TOKENS = ["USDC", "USDT", "ETH", "WETH", "DAI", "MATIC", "BNB"]

export function TokenSelector({
  selectedChain,
  selectedToken,
  amount,
  onChainChange,
  onTokenChange,
  onAmountChange,
}: TokenSelectorProps) {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!selectedChain) return

    const fetchTokens = async () => {
      setLoading(true)
      try {
        const chainTokens = await getTokensForChain(selectedChain)
        // Sort popular tokens first
        const sorted = chainTokens.sort((a, b) => {
          const aPopular = POPULAR_TOKENS.indexOf(a.symbol)
          const bPopular = POPULAR_TOKENS.indexOf(b.symbol)
          if (aPopular !== -1 && bPopular !== -1) return aPopular - bPopular
          if (aPopular !== -1) return -1
          if (bPopular !== -1) return 1
          return a.symbol.localeCompare(b.symbol)
        })
        setTokens(sorted)
      } catch (error) {
        console.error("Failed to fetch tokens:", error)
        setTokens([])
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()
  }, [selectedChain])

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAmountChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      onAmountChange(value)
    }
  }

  return (
    <div className="space-y-4">
      {/* Chain Selector */}
      <div>
        <label className="block text-sm text-white/50 mb-2">From Chain</label>
        <Select
          value={selectedChain?.toString() || ""}
          onValueChange={(value) => {
            onChainChange(parseInt(value))
            onTokenChange(null as unknown as Token)
          }}
        >
          <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 text-white rounded-xl">
            <SelectValue placeholder="Select a chain" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            {SUPPORTED_CHAINS.map((chain) => (
              <SelectItem
                key={chain.id}
                value={chain.id.toString()}
                className="text-white hover:bg-white/10 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={chain.logo}
                    alt={chain.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{chain.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Token Selector */}
      <div>
        <label className="block text-sm text-white/50 mb-2">Token</label>
        <Select
          value={selectedToken?.address || ""}
          onValueChange={(value) => {
            const token = tokens.find((t) => t.address === value)
            if (token) onTokenChange(token)
          }}
          disabled={!selectedChain || loading}
        >
          <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 text-white rounded-xl">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-white/50">Loading tokens...</span>
              </div>
            ) : (
              <SelectValue placeholder="Select a token" />
            )}
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10 max-h-64">
            <div className="p-2 sticky top-0 bg-zinc-900 border-b border-white/10">
              <Input
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border-white/10 text-white h-10"
              />
            </div>
            {filteredTokens.slice(0, 50).map((token) => (
              <SelectItem
                key={token.address}
                value={token.address}
                className="text-white hover:bg-white/10 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {token.logoURI ? (
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                      {token.symbol.slice(0, 2)}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">{token.symbol}</span>
                    <span className="text-xs text-white/50">{token.name}</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm text-white/50 mb-2">Amount</label>
        <div className="relative">
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            disabled={!selectedToken}
            className="bg-white/5 border-white/10 text-white text-2xl font-semibold h-16 rounded-xl pr-24"
          />
          {selectedToken && (
            <Button
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-1 h-auto"
            >
              {selectedToken.symbol}
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
