"use client"

import { useState } from "react"
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Wallet, ChevronDown, Mail, ExternalLink } from "lucide-react"

// Hyperliquid's native email signup URL
const HYPERLIQUID_SIGNUP_URL = "https://app.hyperliquid.xyz"

export function ConnectButton() {
  const [showOptions, setShowOptions] = useState(false)

  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <>
                    {/* Primary button - opens choice dialog */}
                    <Button
                      onClick={() => setShowOptions(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 h-auto rounded-2xl"
                    >
                      <Wallet className="w-5 h-5 mr-2" />
                      Get Started
                    </Button>

                    {/* Wallet choice dialog */}
                    <Dialog open={showOptions} onOpenChange={setShowOptions}>
                      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-sm">
                        <DialogHeader>
                          <DialogTitle className="text-center text-xl">
                            Connect to HyLo
                          </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                          {/* PRIMARY: Email signup - for new users */}
                          <div className="space-y-2">
                            <p className="text-white/50 text-xs uppercase tracking-wide">
                              New to crypto?
                            </p>
                            <Button
                              onClick={() => {
                                window.open(HYPERLIQUID_SIGNUP_URL, "_blank")
                              }}
                              className="w-full h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl flex items-center justify-center gap-3"
                            >
                              <Mail className="w-5 h-5" />
                              Create Wallet with Email
                              <ExternalLink className="w-4 h-4 opacity-50" />
                            </Button>
                            <p className="text-white/40 text-xs text-center">
                              Powered by Hyperliquid - no seed phrase needed
                            </p>
                          </div>

                          {/* Divider */}
                          <div className="flex items-center gap-3 py-2">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-white/30 text-sm">or</span>
                            <div className="flex-1 h-px bg-white/10" />
                          </div>

                          {/* SECONDARY: Existing wallet - for crypto users */}
                          <div className="space-y-2">
                            <p className="text-white/50 text-xs uppercase tracking-wide">
                              Already have a wallet?
                            </p>
                            <Button
                              onClick={() => {
                                setShowOptions(false)
                                openConnectModal()
                              }}
                              variant="outline"
                              className="w-full h-12 border-white/20 text-white hover:bg-white/10 rounded-xl flex items-center justify-center gap-2"
                            >
                              <Wallet className="w-5 h-5" />
                              Connect Existing Wallet
                            </Button>
                            <p className="text-white/40 text-xs text-center">
                              MetaMask, Rainbow, WalletConnect, etc.
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                )
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    variant="destructive"
                    className="font-semibold px-6 py-3 h-auto rounded-2xl"
                  >
                    Wrong Network
                  </Button>
                )
              }

              return (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={openChainModal}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-4 py-2 h-auto rounded-xl"
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <img
                        alt={chain.name ?? "Chain icon"}
                        src={chain.iconUrl}
                        className="w-5 h-5 mr-2 rounded-full"
                      />
                    )}
                    {chain.name}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>

                  <Button
                    onClick={openAccountModal}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-4 py-2 h-auto rounded-xl font-mono"
                  >
                    {account.displayName}
                    {account.displayBalance && (
                      <span className="ml-2 text-white/70">
                        {account.displayBalance}
                      </span>
                    )}
                  </Button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </RainbowConnectButton.Custom>
  )
}

