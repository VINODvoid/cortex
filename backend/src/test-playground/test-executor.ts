import { SolanaService } from "../blockchain/solana";
import { PoolDataService } from "../blockchain/pools";
import { JupiterService } from "../blockchain/jupiter";
import { TransactionExecutor } from "../blockchain/executor";
import type { Proposal } from "../agents/base";

async function testExecutor() {
  console.log("⚡ Transaction Executor Test\n");
  console.log("=".repeat(60));

  // Initialize services
  const solanaService = new SolanaService("devnet");
  const poolDataService = new PoolDataService(solanaService.getConnection());
  const jupiterService = new JupiterService(solanaService.getConnection());
  const executor = new TransactionExecutor(
    solanaService,
    jupiterService,
    poolDataService,
  );

  const wallet = solanaService.getWallet();
  console.log(`\n📍 Wallet: ${wallet.publicKey.toBase58()}`);

  // Check balance
  const balance = await solanaService.getBalance(wallet.publicKey);
  console.log(`💰 Balance: ${balance.toFixed(4)} SOL`);

  if (balance < 0.01) {
    console.log("\n⚠️  Insufficient balance for execution test");
    console.log("   Attempting airdrop...");
    try {
      await solanaService.requestAirdrop();
      const newBalance = await solanaService.getBalance(wallet.publicKey);
      console.log(
        `✅ Airdrop successful! New balance: ${newBalance.toFixed(4)} SOL`,
      );
    } catch (error) {
      console.log("❌ Airdrop failed (devnet may be rate limited)");
      console.log("   Testing with mock proposals only...\n");
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📋 Testing Different Proposal Types\n");

  // Create test proposals
  const testProposals: Proposal[] = [
    {
      agent: "yield",
      action: "hold",
      reasoning: "Market conditions favorable for holding",
      confidence: 90,
    },
    {
      agent: "airdrop",
      action: "provide_liquidity",
      reasoning: "High airdrop potential in Orca pool",
      confidence: 85,
      target: "Orca SOL/USDC",
    },
    {
      agent: "strategist",
      action: "diversify",
      reasoning: "Spread risk across multiple pools",
      confidence: 80,
      target: "Multiple pools",
    },
    {
      agent: "risk",
      action: "exit_position",
      reasoning: "Risk level too high",
      confidence: 75,
      target: "Risky pool",
    },
  ];

  console.log(`Testing ${testProposals.length} proposals:\n`);

  // Execute proposals
  const results = await executor.executeProposals(testProposals);

  // Display results
  console.log("\n" + "=".repeat(60));
  console.log("📊 Execution Results\n");

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const status = result.success ? "✅" : "❌";

    console.log(`${i + 1}. ${status} ${result.agent.toUpperCase()}`);
    console.log(`   Action: ${result.action}`);
    console.log(`   Message: ${result.message}`);

    if (result.transaction) {
      console.log(
        `   Input: ${result.transaction.inputAmount.toFixed(4)} SOL`,
      );
      console.log(
        `   Output: ${result.transaction.outputAmount.toFixed(2)} USDC`,
      );
      console.log(`   Explorer: ${result.transaction.explorer}`);
    }

    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log();
  }

  // Summary
  const summary = TransactionExecutor.summarize(results);
  console.log("=".repeat(60));
  console.log("\n📈 Summary:");
  console.log(`   Total Proposals: ${summary.total}`);
  console.log(`   Successful: ${summary.successful}`);
  console.log(`   Failed: ${summary.failed}`);
  console.log(`   Blockchain Transactions: ${summary.transactions}`);

  console.log("\n" + "=".repeat(60));
  console.log("\n🎉 Transaction executor test complete!");
}

testExecutor().catch(console.error);
