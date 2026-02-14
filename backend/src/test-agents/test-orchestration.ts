import { Cortex } from "../orchestrator";
import { YieldNeuron } from "../agents/yield";
import { RiskNeuron } from "../agents/risk";

async function testOrchestrator() {
  console.log("🧠 CORTEX - Multi-Agent Coordination Test\n");
  console.log("=".repeat(60));

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("❌ Error: GROQ_API_KEY not found");
    process.exit(1);
  }

  // Create agents
  const agents = [new YieldNeuron(apiKey), new RiskNeuron(apiKey)];

  console.log(`\n🤖 Initialized ${agents.length} agents:`);
  console.log("   - YieldNeuron (maximize returns)");
  console.log("   - RiskNeuron (minimize risk)\n");
  console.log("=".repeat(60));

  // Create orchestrator
  const cortex = new Cortex(agents);

  // Run coordination cycle
  await cortex.runCycle();

  console.log("\n" + "=".repeat(60));
  console.log("\n🎉 Coordination cycle complete!");
  console.log("✅ Agents successfully coordinated and voted!\n");
}

testOrchestrator().catch(console.error);
