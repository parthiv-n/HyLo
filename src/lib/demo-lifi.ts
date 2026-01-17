// Demo mode - simulated LI.FI responses for hackathon demo
// When NEXT_PUBLIC_DEMO_MODE=true, this replaces real LI.FI calls

import type { Route, Token, ExtendedChain } from "@lifi/sdk"

// Simulated delay to make it feel realistic
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock chains for demo
export const DEMO_CHAINS: ExtendedChain[] = [
    {
        id: 1,
        name: "Ethereum",
        key: "eth",
        chainType: "EVM",
        coin: "ETH",
        mainnet: true,
        logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    } as ExtendedChain,
    {
        id: 137,
        name: "Polygon",
        key: "pol",
        chainType: "EVM",
        coin: "MATIC",
        mainnet: true,
        logoURI: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
    } as ExtendedChain,
    {
        id: 42161,
        name: "Arbitrum",
        key: "arb",
        chainType: "EVM",
        coin: "ETH",
        mainnet: true,
        logoURI: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
    } as ExtendedChain,
    {
        id: 999,
        name: "Hyperliquid",
        key: "hyperliquid",
        chainType: "EVM",
        coin: "HYPE",
        mainnet: true,
        logoURI: "https://assets.coingecko.com/coins/images/40367/standard/hyperliquid.jpg",
    } as unknown as ExtendedChain,
]

// Mock tokens for demo
export const DEMO_TOKENS: Record<number, Token[]> = {
    1: [
        { chainId: 1, address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", name: "USD Coin", decimals: 6, logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png" } as Token,
        { chainId: 1, address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether USD", decimals: 6, logoURI: "https://assets.coingecko.com/coins/images/325/small/Tether.png" } as Token,
        { chainId: 1, address: "0x0000000000000000000000000000000000000000", symbol: "ETH", name: "Ethereum", decimals: 18, logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" } as Token,
    ],
    137: [
        { chainId: 137, address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", symbol: "USDC", name: "USD Coin", decimals: 6, logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png" } as Token,
        { chainId: 137, address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", symbol: "USDT", name: "Tether USD", decimals: 6, logoURI: "https://assets.coingecko.com/coins/images/325/small/Tether.png" } as Token,
        { chainId: 137, address: "0x0000000000000000000000000000000000000000", symbol: "MATIC", name: "Polygon", decimals: 18, logoURI: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png" } as Token,
    ],
    42161: [
        { chainId: 42161, address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", symbol: "USDC", name: "USD Coin", decimals: 6, logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png" } as Token,
        { chainId: 42161, address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", symbol: "USDT", name: "Tether USD", decimals: 6, logoURI: "https://assets.coingecko.com/coins/images/325/small/Tether.png" } as Token,
        { chainId: 42161, address: "0x0000000000000000000000000000000000000000", symbol: "ETH", name: "Ethereum", decimals: 18, logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" } as Token,
    ],
    999: [
        { chainId: 999, address: "0x0000000000000000000000000000000000000000", symbol: "USDC", name: "USD Coin", decimals: 6, logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png" } as Token,
        { chainId: 999, address: "0x0000000000000000000000000000000000000001", symbol: "HYPE", name: "Hyperliquid", decimals: 18, logoURI: "https://assets.coingecko.com/coins/images/40367/standard/hyperliquid.jpg" } as Token,
    ],
}

// Generate a mock route for demo
export async function getDemoQuote(params: {
    fromChain: number
    toChain: number
    fromToken: string
    toToken: string
    fromAmount: string
    fromAddress: string
    toAddress: string
}): Promise<Route | null> {
    // Simulate API call delay
    await delay(800 + Math.random() * 400)

    const fromTokenInfo = DEMO_TOKENS[params.fromChain]?.find(t =>
        t.address.toLowerCase() === params.fromToken.toLowerCase() ||
        t.symbol === params.fromToken
    ) || DEMO_TOKENS[params.fromChain]?.[0]

    if (!fromTokenInfo) return null

    // Calculate output (simulating ~0.5% slippage)
    const inputAmount = BigInt(params.fromAmount)
    const outputAmount = (inputAmount * BigInt(995)) / BigInt(1000)

    const mockRoute: Route = {
        id: `demo-route-${Date.now()}`,
        fromChainId: params.fromChain,
        toChainId: params.toChain,
        fromToken: fromTokenInfo,
        toToken: {
            chainId: params.toChain,
            address: "0x0000000000000000000000000000000000000000",
            symbol: "USDC",
            name: "USD Coin",
            decimals: 6,
            logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
        } as Token,
        fromAmount: params.fromAmount,
        toAmount: outputAmount.toString(),
        toAmountMin: outputAmount.toString(),
        gasCostUSD: "0.50",
        steps: [
            {
                id: "step-1",
                type: "swap",
                tool: "LI.FI → uniswap",
                action: {
                    fromChainId: params.fromChain,
                    toChainId: params.fromChain,
                    fromToken: fromTokenInfo,
                    toToken: fromTokenInfo,
                    fromAmount: params.fromAmount,
                },
                estimate: {
                    executionDuration: 30,
                    fromAmount: params.fromAmount,
                    toAmount: params.fromAmount,
                },
            },
            {
                id: "step-2",
                type: "cross",
                tool: "LI.FI → stargate",
                action: {
                    fromChainId: params.fromChain,
                    toChainId: params.toChain,
                    fromToken: fromTokenInfo,
                    toToken: {
                        chainId: params.toChain,
                        address: "0x0000000000000000000000000000000000000000",
                        symbol: "USDC",
                        name: "USD Coin",
                        decimals: 6,
                    },
                    fromAmount: params.fromAmount,
                },
                estimate: {
                    executionDuration: 120,
                    fromAmount: params.fromAmount,
                    toAmount: outputAmount.toString(),
                },
            },
        ],
    } as unknown as Route

    return mockRoute
}

// Simulate route execution for demo
export async function executeDemoRoute(
    route: Route,
    callbacks?: {
        onStepStarted?: (step: number) => void
        onStepCompleted?: (step: number) => void
        onSuccess?: (route: Route) => void
        onError?: (error: Error) => void
    }
): Promise<Route> {
    const totalSteps = route.steps.length

    for (let i = 0; i < totalSteps; i++) {
        callbacks?.onStepStarted?.(i)

        // Simulate step execution time (2-4 seconds per step)
        await delay(2000 + Math.random() * 2000)

        callbacks?.onStepCompleted?.(i + 1)
    }

    // Mark as completed
    const completedRoute = {
        ...route,
        steps: route.steps.map(step => ({
            ...step,
            execution: { status: "DONE" },
        })),
    } as Route

    callbacks?.onSuccess?.(completedRoute)
    return completedRoute
}

// Demo transaction status
export async function getDemoStatus(txHash: string) {
    await delay(300)
    return {
        status: "DONE",
        substatus: "COMPLETED",
        sending: { txHash },
        receiving: { txHash: `0x${Math.random().toString(16).slice(2)}` },
    }
}
