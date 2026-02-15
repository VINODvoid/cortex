import { StrategistNeuron } from "../agents/strategist";
import { type SystemContext } from "../agents/base";

async function testStrategistAgent() {
  console.log("🧠 Testing StrategistNeuron Agent...\n");

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("❌ Error: GROQ_API_KEY not found in .env");
    process.exit(1);
  }

  const agent = new StrategistNeuron(apiKey);

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

  const proposal = await agent.think(context);

  console.log("💡 StrategistNeuron Proposal:");
  console.log(`   Action: ${proposal.action}`);
  console.log(`   Target: ${proposal.target || "N/A"}`);
  console.log(`   Confidence: ${proposal.confidence}%`);
  console.log(`   Reasoning: ${proposal.reasoning}\n`);
}

testStrategistAgent().catch(console.error);
