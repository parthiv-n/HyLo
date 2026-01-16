# HyLo

**Cross-chain deposits to Hyperliquid, simplified.**

HyLo turns a multi-step bridging nightmare into a one-click experience. Pick any token on any chain, and we handle the rest—routing through the best DEXs and bridges via LI.FI to land funds on HyperEVM.

---

## Why HyLo?

Getting money into Hyperliquid today means:
1. Figure out which bridge to use
2. Swap to the right token
3. Bridge to Arbitrum
4. Deposit via Hyperliquid UI
5. Hope nothing breaks along the way

**HyLo**: Scan a QR. Pick your token. Done.

---

## What We Built

### For Users: QR Payment App

A mobile-first payment experience where scanning a QR code triggers the entire deposit flow.

**The Send Flow:**
```
Scan QR → Select Chain & Token → Review Quote → Confirm → Track Progress → Done
```

- **Step-by-step progress tracking** - Users see exactly what's happening: "Swapping on Uniswap... Bridging via Stargate... Confirming on HyperEVM..."
- **Real-time estimates** - Gas costs, output amounts, and ETAs before confirming
- **Clear error states** - When something fails, users know why and can retry with one tap

**The Receive Flow:**
```
Connect Wallet → Show QR → Share with sender
```

Generate a scannable code that encodes your HyperEVM address. Optionally request a specific amount.

---

### For Builders: Embeddable Widget

Every dApp building on Hyperliquid needs deposit functionality. Instead of each team spending weeks integrating LI.FI, building UI, and handling edge cases—we built it once.

**One script tag. Five minutes to integrate.**

```html
<script src="https://hylo.dev/widget.js"></script>
<button data-hylo-deposit data-recipient="0x...">
  Deposit to Hyperliquid
</button>
```

The widget handles:
- Wallet connection (RainbowKit)
- Chain/token selection with search
- Quote fetching and route preview
- Multi-step execution with progress UI
- Error handling and retry logic
- Success/failure callbacks to your app

**JavaScript API for full control:**

```javascript
HyLo.init({
  theme: 'dark',
  onSuccess: (result) => {
    // { txHash, amount, token, fromChainId, toChainId }
    redirectToTrading(result.txHash);
  },
  onError: (error) => {
    showErrorToast(error.message);
  }
});

HyLo.open({ recipient: '0x...', amount: '100' });
```

---

### For React Apps: Drop-in Component

```tsx
import { DepositToHyperliquid } from 'hylo/components'

<DepositToHyperliquid
  recipientAddress="0x..."
  defaultAmount="100"
  destinationToken="USDC"
  onSuccess={handleDeposit}
/>
```

Same functionality as the widget, but as a React component you can style and customize.

---

## How We Use LI.FI

We don't just redirect to LI.FI's widget—we built a custom experience on top of their SDK.

### Route Discovery
```typescript
const routes = await getRoutes({
  fromChainId: 137,        // User's chain (Polygon)
  toChainId: 999,          // HyperEVM
  fromTokenAddress: usdc,  // User's token
  toTokenAddress: hyUsdc,  // Destination token
  fromAmount: amount,
  fromAddress: sender,
  toAddress: recipient,
});
```

LI.FI finds the optimal path across 15+ bridges and 30+ DEXs. We display the route steps, fees, and estimated time so users know exactly what they're signing.

### Execution with Progress Hooks
```typescript
await executeRoute(route, {
  updateRouteHook: (updatedRoute) => {
    // Real-time status updates
    const step = getCurrentStep(updatedRoute);
    setStatus(`${step.tool}: ${step.status}`);
  },
  switchChainHook: async (chainId) => {
    // Handle chain switching automatically
    await walletClient.switchChain({ id: chainId });
  }
});
```

### Status Tracking
Every transaction shows:
- Which step is executing (Swap → Bridge → Confirm)
- Progress percentage
- Estimated time remaining
- Transaction hashes for verification

---

## Handling Edge Cases

### Minimum Deposit Warning
Hyperliquid requires at least 5 USDC. We validate before the user can proceed:

```
⚠️ Minimum deposit is 5 USDC
```

### Insufficient Gas
If the user doesn't have enough native tokens for gas, we surface this clearly before they attempt the transaction.

### Failed Transactions
When a bridge fails or times out:
1. We show what went wrong in plain English
2. Offer a "Try Again" button that re-fetches a fresh quote
3. Preserve their inputs so they don't have to start over

### Network Switching
If the user is on the wrong chain, we prompt them to switch and handle the wallet interaction automatically.

---

## Supported Chains

| Chain | ID | Native Token |
|-------|-----|--------------|
| Ethereum | 1 | ETH |
| Polygon | 137 | MATIC |
| Arbitrum | 42161 | ETH |
| Optimism | 10 | ETH |
| Base | 8453 | ETH |
| BNB Chain | 56 | BNB |
| **HyperEVM** | **999** | **HYPE** |

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14 | App Router, RSC, fast builds |
| Styling | Tailwind + shadcn/ui | Mobile-first, accessible components |
| Wallet | wagmi + RainbowKit | Best-in-class wallet UX |
| Cross-chain | **LI.FI SDK** | Route optimization, multi-bridge support |
| QR | qrcode.react + html5-qrcode | Generation + scanning |
| State | Zustand | Persisted transaction history |

---

## Project Structure

```
hylo/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Home - Send/Receive toggle
│   │   ├── send/              # Full payment flow
│   │   ├── receive/           # QR generator
│   │   ├── widget/            # Embeddable iframe
│   │   └── demo/              # Widget playground
│   ├── components/
│   │   ├── payment/           # TokenSelector, QuotePreview, Progress
│   │   └── deposit/           # Reusable DepositToHyperliquid
│   ├── hooks/
│   │   ├── useLifiQuote.ts    # Quote fetching + caching
│   │   └── useLifiExecute.ts  # Execution + status tracking
│   └── lib/
│       └── lifi.ts            # SDK configuration
└── public/
    └── widget.js              # Standalone embeddable script
```

---

## Running Locally

```bash
git clone https://github.com/your-username/hylo.git
cd hylo
npm install

# Add your WalletConnect Project ID
echo "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=xxx" > .env.local

npm run dev
# Open http://localhost:3000
```

---

## Try It

| Page | What to Test |
|------|--------------|
| `/` | Connect wallet, see Send/Receive options |
| `/send` | Scan QR or enter address, select token, get quote |
| `/receive` | Generate your payment QR code |
| `/demo` | Copy widget code, see it in action |
| `/widget?recipient=0x...` | Direct widget access |

---

## Who This Helps

**New Hyperliquid Users**
- Don't need to understand bridging
- Don't need to find the right token
- Just scan and send

**Existing Crypto Users**
- Faster than manual bridging
- Best rates via LI.FI routing
- One approval instead of multiple

**Hyperliquid dApp Developers**
- Skip weeks of integration work
- Drop in our widget or component
- Focus on your core product

---

## Links

- **Live Demo**: [vercel-url]
- **Video Walkthrough**: [3-min demo]
- **GitHub**: [this repo]

---

## Team

[Your name]

---

MIT License
