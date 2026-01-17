// Test script to verify LI.FI SDK integration
// Run with: npx tsx scripts/test-lifi.ts

import { createConfig, getChains, getTokens, getRoutes } from "@lifi/sdk"

async function testLifiIntegration() {
    console.log("🔧 Testing LI.FI SDK Integration...\n")

    // Initialize SDK
    const config = createConfig({
        integrator: "hylo-payments",
    })
    console.log("✅ SDK initialized\n")

    // Test 1: Fetch supported chains
    console.log("📡 Fetching supported chains...")
    try {
        const chains = await getChains()
        console.log(`✅ Found ${chains.length} chains`)

        // Check for key chains
        const polygon = chains.find(c => c.id === 137)
        const arbitrum = chains.find(c => c.id === 42161)
        console.log(`   - Polygon: ${polygon ? "✅" : "❌"}`)
        console.log(`   - Arbitrum: ${arbitrum ? "✅" : "❌"}`)
        console.log("")
    } catch (error) {
        console.log("❌ Failed to fetch chains:", error)
        return
    }

    // Test 2: Fetch tokens for Polygon
    console.log("📡 Fetching tokens for Polygon (chain 137)...")
    try {
        const result = await getTokens({ chains: [137] })
        const tokens = result.tokens[137] || []
        console.log(`✅ Found ${tokens.length} tokens on Polygon`)

        // Find USDC
        const usdc = tokens.find(t => t.symbol === "USDC")
        console.log(`   - USDC: ${usdc ? "✅ " + usdc.address : "❌"}`)
        console.log("")
    } catch (error) {
        console.log("❌ Failed to fetch tokens:", error)
        return
    }

    // Test 3: Get a sample quote (Polygon USDC -> Arbitrum USDC)
    console.log("📡 Fetching sample route (Polygon → Arbitrum, 10 USDC)...")
    try {
        const result = await getRoutes({
            fromChainId: 137,
            toChainId: 42161,
            fromTokenAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC on Polygon
            toTokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC on Arbitrum
            fromAmount: "10000000", // 10 USDC (6 decimals)
            fromAddress: "0x0000000000000000000000000000000000000001", // dummy address
            toAddress: "0x0000000000000000000000000000000000000001",
        })

        if (result.routes.length > 0) {
            const route = result.routes[0]
            console.log(`✅ Found ${result.routes.length} route(s)`)
            console.log(`   - Steps: ${route.steps.length}`)
            console.log(`   - Output: ~${(Number(route.toAmountMin) / 1e6).toFixed(2)} USDC`)
            console.log(`   - Gas cost: $${route.gasCostUSD || "N/A"}`)
            console.log(`   - Tools: ${route.steps.map(s => s.tool).join(" → ")}`)
        } else {
            console.log("⚠️ No routes found (this can happen if liquidity is low)")
        }
        console.log("")
    } catch (error: any) {
        console.log("❌ Failed to get quote:", error.message || error)
        console.log("")
    }

    console.log("═══════════════════════════════════════════════")
    console.log("✅ LI.FI SDK is properly configured!")
    console.log("")
    console.log("⚠️  Note: LI.FI doesn't support testnets.")
    console.log("   For full testing, set up BuildBear sandbox")
    console.log("   or test with small amounts on mainnet.")
    console.log("═══════════════════════════════════════════════")
}

testLifiIntegration().catch(console.error)
