"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Camera, X, FlashlightOff, Flashlight } from "lucide-react"

interface QRScannerProps {
  onScan: (data: { address: string; amount?: string; chain?: number }) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flashOn, setFlashOn] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true

    const startScanner = async () => {
      if (!containerRef.current) return

      try {
        const html5QrCode = new Html5Qrcode("qr-reader", {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        })
        scannerRef.current = html5QrCode

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText) => {
            if (!mounted) return

            try {
              // Try to parse as JSON (HyLo format)
              const data = JSON.parse(decodedText)
              if (data.address) {
                onScan(data)
                html5QrCode.stop()
                return
              }
            } catch {
              // Not JSON, treat as plain address
              if (decodedText.startsWith("0x") && decodedText.length === 42) {
                onScan({ address: decodedText })
                html5QrCode.stop()
                return
              }
            }
            setError("Invalid QR code format")
          },
          () => {
            // Ignore scan errors (no QR in frame)
          }
        )

        if (mounted) {
          setIsScanning(true)
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to start camera. Please check permissions."
          )
        }
      }
    }

    startScanner()

    return () => {
      mounted = false
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [onScan])

  const toggleFlash = async () => {
    if (!scannerRef.current) return
    try {
      const capabilities = scannerRef.current.getRunningTrackCapabilities()
      if ("torch" in capabilities) {
        await scannerRef.current.applyVideoConstraints({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          advanced: [{ torch: !flashOn } as any],
        })
        setFlashOn(!flashOn)
      }
    } catch {
      // Flash not supported
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 absolute top-0 left-0 right-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white bg-black/30 backdrop-blur-sm rounded-full h-10 w-10 p-0"
        >
          <X className="w-5 h-5" />
        </Button>
        <span className="text-white font-medium bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
          Scan QR Code
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFlash}
          className="text-white bg-black/30 backdrop-blur-sm rounded-full h-10 w-10 p-0"
        >
          {flashOn ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
        </Button>
      </div>

      {/* Scanner */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center relative overflow-hidden"
      >
        <div id="qr-reader" className="w-full h-full" />

        {/* Scanning overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Dark overlay with cutout */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-64">
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                {/* Scanning line animation */}
                <div className="absolute inset-x-2 h-0.5 bg-emerald-400 animate-scan" />
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center p-6">
              <Camera className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/70 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-6 text-center bg-gradient-to-t from-black to-transparent">
        <p className="text-white/70">Point your camera at a HyLo payment QR code</p>
      </div>
    </div>
  )
}
