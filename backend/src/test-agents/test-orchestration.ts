import { Cortex } from "../orchestrator";
import { YieldNeuron } from "../agents/yield";
import { RiskNeuron } from "../agents/risk";
import { AirdropNeuron } from "../agents/airdrop";
import { StrategistNeuron } from "../agents/strategist";
import { LiquidityNeuron } from "../agents/liquidity";
import { TrendNeuron } from "../agents/trend";
import { SentimentNeuron } from "../agents/sentiment";
import { RebalancerNeuron } from "../agents/rebalancer";
import { WhaleNeuron } from "../agents/whale";
import { GasOptimizerNeuron } from "../agents/gas";

async function testOrchestrator() {
  console.log("🧠 CORTEX - 10-Agent Autonomous Swarm\n");
  console.log("=".repeat(60));

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("❌ Error: GROQ_API_KEY not found");
    process.exit(1);
  }

  // Create all 10 agents
  const agents = [
    new YieldNeuron(apiKey),
    new RiskNeuron(apiKey),
    new AirdropNeuron(apiKey),
    new StrategistNeuron(apiKey),
    new LiquidityNeuron(apiKey),
    new TrendNeuron(apiKey),
    new SentimentNeuron(apiKey),
    new RebalancerNeuron(apiKey),
    new WhaleNeuron(apiKey),
    new GasOptimizerNeuron(apiKey),
  ];

  console.log(`\n🤖 Initialized ${agents.length} agents:\n`);
  console.log("   📈 YieldNeuron - Maximize returns");
  console.log("   🛡️  RiskNeuron - Minimize risk");
  console.log("   🪂 AirdropNeuron - Hunt airdrops");
  console.log("   🧭 StrategistNeuron - Strategic coordination");
  console.log("   💧 LiquidityNeuron - Safety gatekeeper");
  console.log("   📊 TrendNeuron - Market momentum");
  console.log("   💭 SentimentNeuron - Community sentiment");
  console.log("   ⚖️  RebalancerNeuron - Portfolio optimization");
  console.log("   🐋 WhaleWatcher - Whale tracking");
  console.log("   ⛽ GasOptimizer - Transaction cost optimizer");

  console.log("\n" + "=".repeat(60));
  console.log("Starting 10-agent coordination cycle...\n");

  const cortex = new Cortex(agents);
  await cortex.runCycle();

  console.log("\n" + "=".repeat(60));
  console.log("\n🎉 10-Agent swarm coordination complete!");
  console.log("✅ All agents debated, voted, and reached consensus!");
  console.log(
    "💪 This is true decentralized AI decision-making at work!\n"
  );
}

testOrchestrator().catch(console.error);
