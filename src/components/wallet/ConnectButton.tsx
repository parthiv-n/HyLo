"use client"

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit"
import { Button } from "@/components/ui/button"
import { Wallet, ChevronDown } from "lucide-react"

export function ConnectButton() {
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
                  <Button
                    onClick={openConnectModal}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 h-auto rounded-2xl"
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Wallet
                  </Button>
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
