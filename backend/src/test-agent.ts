import { YieldNeuron } from "./agents/yield";
import { type SystemContext } from "./agents/base";

async function testYieldAgent() {
  console.log("🧠 Testing YieldNeuron Agent...\n");

  // Get API key from environment
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("❌ Error: GROQ_API_KEY not found in .env");
    process.exit(1);
  }

  // Create agent
  const agent = new YieldNeuron(apiKey);

  // Mock DeFi scenario
  const context: SystemContext = {
    portfolio: {
      sol: 100,
      usdc: 0,
    },
    pools: [
      { name: "Orca", apy: 5.2, tvl: 50000000 },
      { name: "Marinade", apy: 6.1, tvl: 80000000 },
      { name: "Kamino", apy: 5.8, tvl: 30000000 },
    ],
  };

  console.log("📊 Current Portfolio:");
  console.log(`   SOL: ${context.portfolio.sol}`);
  console.log(`   USDC: ${context.portfolio.usdc}\n`);

  console.log("🏦 Available Pools:");
  context.pools?.forEach((pool) => {
    console.log(
      `   ${pool.name}: ${pool.apy}% APY (TVL: $${pool.tvl.toLocaleString()})`,
    );
  });
  console.log("\n⏳ Agent is thinking...\n");

  // Let agent think!
  const proposal = await agent.think(context);

  console.log("💡 Agent Proposal:");
  console.log(`   Action: ${proposal.action}`);
  console.log(`   Target: ${proposal.target || "N/A"}`);
  console.log(`   Confidence: ${proposal.confidence}%`);
  console.log(`   Reasoning: ${proposal.reasoning}`);
}

testYieldAgent().catch(console.error)