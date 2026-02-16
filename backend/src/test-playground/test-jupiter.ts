import { SolanaService } from "../blockchain/solana";
import { JupiterService, TOKEN_MINTS } from "../blockchain/jupiter";

async function testJupiter() {
  console.log("🪐 Jupiter Integration Test\n");
  console.log("=".repeat(60));

  // Initialize services
  const solanaService = new SolanaService("devnet");
  const jupiterService = new JupiterService(solanaService.getConnection());

  const wallet = solanaService.getWallet();
  console.log(`\n📍 Wallet: ${wallet.publicKey.toBase58()}`);

  // Check balance
  const balance = await solanaService.getBalance(wallet.publicKey);
  console.log(`💰 Balance: ${balance.toFixed(4)} SOL`);

  if (balance < 0.1) {
    console.log("\n⚠️  Insufficient balance for swap test");
    console.log("   Attempting airdrop...");
    try {
      await solanaService.requestAirdrop();
      const newBalance = await solanaService.getBalance(wallet.publicKey);
      console.log(`✅ Airdrop successful! New balance: ${newBalance.toFixed(4)} SOL`);
    } catch (error) {
      console.log("❌ Airdrop failed (devnet may be rate limited)");
      console.log("   Skipping swap execution, testing quote only...\n");
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Testing Swap Quote Fetch\n");

  try {
    // Test: Get swap quote for 0.1 SOL → USDC
    const swapAmount = jupiterService.solToLamports(0.1); // 0.1 SOL
    console.log(`Requesting quote for ${jupiterService.lamportsToSol(swapAmount)} SOL → USDC...`);

    const quote = await jupiterService.getSwapQuote(
      TOKEN_MINTS.SOL,
      TOKEN_MINTS.USDC,
      swapAmount,
      50, // 0.5% slippage
    );

    console.log("\n✅ Quote fetched successfully!");
    console.log(`   Input:  ${jupiterService.lamportsToSol(Number(quote.inAmount))} SOL`);
    console.log(`   Output: ${jupiterService.baseUnitsToUsdc(Number(quote.outAmount))} USDC`);
    console.log(`   Price Impact: ${quote.priceImpactPct}%`);
    console.log(`   Route: ${quote.routePlan.length} step(s)`);

    // Show route details
    for (let i = 0; i < quote.routePlan.length; i++) {
      const step = quote.routePlan[i];
      console.log(`   Step ${i + 1}: ${step.swapInfo.label || "Unknown DEX"} (${step.percent}%)`);
    }

    // Only execute swap if we have sufficient balance
    const currentBalance = await solanaService.getBalance(wallet.publicKey);
    if (currentBalance >= 0.2) {
      console.log("\n" + "=".repeat(60));
      console.log("🔄 Executing Swap\n");

      const result = await jupiterService.executeSwap(quote, wallet);

      console.log("✅ Swap executed successfully!");
      console.log(`   Signature: ${result.signature}`);
      console.log(`   Input:  ${jupiterService.lamportsToSol(result.inputAmount)} SOL`);
      console.log(`   Output: ${jupiterService.baseUnitsToUsdc(result.outputAmount)} USDC`);
      console.log(`   Explorer: ${result.explorer}`);
    } else {
      console.log("\n⚠️  Skipping swap execution (insufficient balance)");
      console.log("   Quote fetching works! Swap execution requires 0.2+ SOL");
    }
  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : error);
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n🎉 Jupiter integration test complete!");
}

testJupiter().catch(console.error);
