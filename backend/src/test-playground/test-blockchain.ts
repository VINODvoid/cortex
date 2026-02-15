import { SolanaService } from "../blockchain/solana";
import { PoolDataService } from "../blockchain/pools";

async function testBlockchain() {
  console.log("🔗 Testing Solana Blockchain Integration\n");

  // 1. Initialize Solana service (devnet)
  const solana = new SolanaService("devnet");
  console.log("✅ Connected to Solana devnet");
  console.log(`📍 Wallet Address: ${solana.getWalletAddress()}\n`);

  // 2. Request airdrop (2 SOL from faucet)
  console.log("💸 Requesting 2 SOL airdrop from devnet...");
  const signature = await solana.requestAirdrop();
  console.log(`✅ Airdrop successful! Signature: ${signature}\n`);

  // 3. Check balance
  const balance = await solana.getBalance(solana.getWallet().publicKey);
  console.log(`💰 Wallet Balance: ${balance} SOL\n`);

  // 4. Fetch pool data
  const poolService = new PoolDataService(solana.getConnection());
  const pools = await poolService.getAllPools();

  console.log(`🏊 Found ${pools.length} DeFi pools:\n`);
  pools.forEach((pool) => {
    console.log(`   📊 ${pool.name}`);
    console.log(`      APY: ${pool.apy}%`);
    console.log(`      TVL: $${pool.tvl.toLocaleString()}\n`);
  });

  console.log("🎉 Blockchain integration test complete!");
}

testBlockchain().catch(console.error);
