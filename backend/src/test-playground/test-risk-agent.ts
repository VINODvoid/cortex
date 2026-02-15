import { YieldNeuron } from "../agents/yield";
import { RiskNeuron } from "../agents/risk";
import { type SystemContext } from "../agents/base";

async function testAgents() {
  console.log("🧠 Testing YieldNeuron vs RiskNeuron\n");

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("❌ Error: GROQ_API_KEY not found");
    process.exit(1);
  }

  // Create both agents
  const yieldAgent = new YieldNeuron(apiKey);
  const riskAgent = new RiskNeuron(apiKey);

  // RISKY scenario: One pool has high APY but low TVL (red flag!)
  const riskyContext: SystemContext = {
    portfolio: {
      sol: 100,
      usdc: 0,
    },
    pools: [
      { name: "SafePool", apy: 5.2, tvl: 50000000 }, // Safe: normal APY, good TVL
      { name: "SuspiciousPool", apy: 25, tvl: 500000 }, // RISKY: high APY, low TVL!
      { name: "MediumPool", apy: 6.1, tvl: 80000000 }, // Safe: good APY, great TVL
    ],
  };

  console.log("📊 Risky Scenario:");
  console.log(`   Portfolio: ${riskyContext.portfolio.sol} SOL\n`);

  console.log("🏦 Available Pools:");
  riskyContext.pools?.forEach((pool) => {
    const riskFlag = pool.tvl < 10000000 ? "⚠️ LOW TVL" : "✅";
    const apyFlag = pool.apy > 15 ? "⚠️ HIGH APY" : "✅";
    console.log(`   ${pool.name}: ${pool.apy}% APY, TVL: $${pool.tvl.toLocaleString()}
  ${riskFlag} ${apyFlag}`);
  });

  console.log("\n" + "=".repeat(60));
  console.log("⏳ YieldNeuron thinking (wants high APY)...\n");

  const yieldProposal = await yieldAgent.think(riskyContext);

  console.log("💰 YieldNeuron Proposal:");
  console.log(`   Action: ${yieldProposal.action}`);
  console.log(`   Target: ${yieldProposal.target}`);
  console.log(`   Confidence: ${yieldProposal.confidence}%`);
  console.log(`   Reasoning: ${yieldProposal.reasoning}`);

  console.log("\n" + "=".repeat(60));
  console.log("⏳ RiskNeuron thinking (detects danger)...\n");

  const riskProposal = await riskAgent.think(riskyContext);

  console.log("🛡️ RiskNeuron Proposal:");
  console.log(`   Action: ${riskProposal.action}`);
  console.log(`   Target: ${riskProposal.target || "N/A"}`);
  console.log(`   Confidence: ${riskProposal.confidence}%`);
  console.log(`   Reasoning: ${riskProposal.reasoning}`);

  console.log("\n" + "=".repeat(60));
  console.log("\n🤖 Agent Comparison:");
  console.log(
    `   YieldNeuron wants: ${yieldProposal.action} → ${yieldProposal.target}`,
  );
  console.log(`   RiskNeuron says: ${riskProposal.action}`);
  console.log("\n💡 This shows agents have different priorities!");
}

testAgents().catch(console.error);
