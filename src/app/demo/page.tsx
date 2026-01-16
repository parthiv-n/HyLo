"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Copy, Check, ExternalLink } from "lucide-react"

export default function DemoPage() {
  const [recipient, setRecipient] = useState("0x742d35Cc6634C0532925a3b844Bc9e7595f...")
  const [amount, setAmount] = useState("100")
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const basicCode = `<!-- Add this to your HTML -->
<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js"></script>

<!-- Add a deposit button anywhere -->
<button data-hylo-deposit data-recipient="${recipient}">
  Deposit to Hyperliquid
</button>`

  const customCode = `<!-- Customized button with pre-filled amount -->
<button 
  data-hylo-deposit
  data-recipient="${recipient}"
  data-amount="${amount}"
  data-token="USDC"
>
  Deposit $${amount} USDC
</button>`

  const jsCode = `// Initialize with callbacks
HyLo.init({
  theme: 'dark',
  primaryColor: '#22c55e',
  onSuccess: (result) => {
    console.log('Deposit complete!', result.txHash);
    // Update your UI, redirect user, etc.
  },
  onError: (error) => {
    console.error('Deposit failed:', error.message);
  },
  onClose: () => {
    console.log('Widget closed');
  }
});

// Open programmatically
document.getElementById('my-button').onclick = () => {
  HyLo.open({
    recipient: '${recipient}',
    amount: '${amount}',
    destinationToken: 'USDC'
  });
};`

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 py-12 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          Developer Preview
        </Badge>
        <h1 className="text-4xl font-bold text-white mb-4">
          HyLo Embeddable Widget
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Add Hyperliquid deposits to your website in minutes. 
          One script tag, zero backend required.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Live Demo */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">
                1
              </span>
              Live Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/60">
              Try the widget right here. Click the button below to see it in action.
            </p>
            
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm text-white/50 mb-2 block">Recipient Address</label>
                <Input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="bg-white/5 border-white/10 text-white font-mono text-sm"
                />
              </div>
              <div className="w-32">
                <label className="text-sm text-white/50 mb-2 block">Amount</label>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="p-6 bg-zinc-900 rounded-xl border border-white/5 flex items-center justify-center">
              <Button
                data-hylo-deposit
                data-recipient={recipient}
                data-amount={amount}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-6 h-auto text-lg rounded-xl"
              >
                💰 Deposit ${amount} to Hyperliquid
              </Button>
            </div>

            <p className="text-white/40 text-sm text-center">
              ↑ This button uses the HyLo widget. Try clicking it!
            </p>
          </CardContent>
        </Card>

        {/* Basic Integration */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm">
                2
              </span>
              Basic Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/60">
              Add these two lines to your HTML. That's it!
            </p>
            
            <div className="relative">
              <pre className="bg-zinc-900 rounded-xl p-4 overflow-x-auto text-sm">
                <code className="text-emerald-400">{basicCode}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(basicCode, 'basic')}
                className="absolute top-2 right-2 text-white/50 hover:text-white hover:bg-white/10"
              >
                {copied === 'basic' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customized Button */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm">
                3
              </span>
              Customized Button
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/60">
              Pre-fill amount, token, and more using data attributes.
            </p>
            
            <div className="relative">
              <pre className="bg-zinc-900 rounded-xl p-4 overflow-x-auto text-sm">
                <code className="text-purple-400">{customCode}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(customCode, 'custom')}
                className="absolute top-2 right-2 text-white/50 hover:text-white hover:bg-white/10"
              >
                {copied === 'custom' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="bg-white/5 rounded-lg p-2">
                <code className="text-amber-400">data-recipient</code>
                <p className="text-white/40 text-xs">Required</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <code className="text-amber-400">data-amount</code>
                <p className="text-white/40 text-xs">Pre-fill amount</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <code className="text-amber-400">data-token</code>
                <p className="text-white/40 text-xs">USDC or HYPE</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <code className="text-amber-400">data-chain-id</code>
                <p className="text-white/40 text-xs">Origin chain</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* JavaScript API */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm">
                4
              </span>
              JavaScript API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/60">
              Full control with the JavaScript API. Initialize once, open anywhere.
            </p>
            
            <div className="relative">
              <pre className="bg-zinc-900 rounded-xl p-4 overflow-x-auto text-sm">
                <code className="text-amber-400">{jsCode}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(jsCode, 'js')}
                className="absolute top-2 right-2 text-white/50 hover:text-white hover:bg-white/10"
              >
                {copied === 'js' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <h4 className="text-emerald-400 font-medium mb-2">Callback Data</h4>
              <p className="text-white/60 text-sm mb-2">
                The <code className="text-emerald-400">onSuccess</code> callback receives:
              </p>
              <pre className="text-xs text-white/70">
{`{
  txHash: "0x...",
  amount: "99.50",
  token: "USDC",
  recipient: "0x...",
  fromChainId: 137,
  toChainId: 999
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Use Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Trading Bots", desc: "Let users fund their bot from any chain" },
                { title: "Portfolio Trackers", desc: "One-click deposit to start trading" },
                { title: "DeFi on HyperEVM", desc: "Bring liquidity from other chains" },
                { title: "NFT Marketplaces", desc: "Buy NFTs with funds from any chain" },
                { title: "Referral Sites", desc: "Seamless onboarding for new users" },
                { title: "Mobile Apps", desc: "WebView integration for native apps" },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-white font-medium mb-1">{item.title}</h4>
                  <p className="text-white/50 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center py-8">
          <p className="text-white/50 mb-4">
            Ready to integrate? Copy the code above and paste it into your site.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="https://github.com/your-repo/hylo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <Code className="w-4 h-4" />
              View on GitHub
            </a>
            <a
              href="/docs"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Full Documentation
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Load widget script for demo */}
      <script src="/widget.js" defer />
    </main>
  )
}
