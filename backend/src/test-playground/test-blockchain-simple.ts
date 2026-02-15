import { SolanaService } from "../blockchain/solana";
import { PoolDataService } from "../blockchain/pools";

async function testBlockchain() {
  console.log("🔗 Testing Solana Blockchain Integration\n");

  // 1. Initialize Solana service (devnet)
  const solana = new SolanaService("devnet");
  console.log("✅ Connected to Solana devnet");
  console.log(`📍 Wallet Address: ${solana.getWalletAddress()}\n`);

  // 2. Fetch pool data (works without airdrop!)
  const poolService = new PoolDataService(solana.getConnection());
  const pools = await poolService.getAllPools();

  console.log(`🏊 Found ${pools.length} DeFi pools:\n`);
  pools.forEach((pool) => {
    console.log(`   📊 ${pool.name}`);
    console.log(`      APY: ${pool.apy}%`);
    console.log(`      TVL: $${pool.tvl.toLocaleString()}\n`);
  });

  console.log("🎉 Blockchain integration test complete!");
  console.log("💡 Pool data fetching works! Airdrop can be tested later.\n");
}

testBlockchain().catch(console.error);
