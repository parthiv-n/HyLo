"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check, Share2, Download } from "lucide-react"
import { formatAddress } from "@/lib/utils"

interface QRGeneratorProps {
  address: string
  onAmountChange?: (amount: string) => void
}

export function QRGenerator({ address, onAmountChange }: QRGeneratorProps) {
  const [amount, setAmount] = useState("")
  const [copied, setCopied] = useState(false)

  // Create QR data with address and optional amount
  const qrData = JSON.stringify({
    address,
    amount: amount || undefined,
    chain: 999, // HyperEVM
  })

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "HyLo Payment Request",
        text: `Send payment to ${formatAddress(address)}${amount ? ` - Amount: ${amount} USDC` : ""}`,
        url: window.location.href,
      })
    }
  }

  const handleDownload = () => {
    const svg = document.getElementById("hylo-qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = `hylo-payment-${formatAddress(address)}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
      onAmountChange?.(value)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* QR Code */}
      <Card className="bg-white p-4 rounded-3xl shadow-xl">
        <CardContent className="p-0">
          <QRCodeSVG
            id="hylo-qr-code"
            value={qrData}
            size={240}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#0a0a0a"
            imageSettings={{
              src: "/hylo-logo.svg",
              x: undefined,
              y: undefined,
              height: 40,
              width: 40,
              excavate: true,
            }}
          />
        </CardContent>
      </Card>

      {/* Address Display */}
      <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
        <span className="font-mono text-white/70">{formatAddress(address)}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/10"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>

      {/* Amount Input */}
      <div className="w-full max-w-xs">
        <label className="block text-sm text-white/50 mb-2 text-center">
          Request specific amount (optional)
        </label>
        <div className="relative">
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="bg-white/5 border-white/10 text-white text-center text-2xl font-semibold h-14 rounded-xl pr-16"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 font-medium">
            USDC
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleShare}
          className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button
          variant="outline"
          onClick={handleDownload}
          className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
        >
          <Download className="w-4 h-4 mr-2" />
          Save QR
        </Button>
      </div>
    </div>
  )
}
