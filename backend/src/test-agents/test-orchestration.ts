import { Cortex } from "../orchestrator"
  import { YieldNeuron } from "../agents/yield"
  import { RiskNeuron } from "../agents/risk"
  import { AirdropNeuron } from "../agents/airdrop"  // ← Add this

  async function testOrchestrator() {
    console.log("🧠 CORTEX - 3-Agent Swarm Coordination\n")
    console.log("=".repeat(60))

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      console.error("❌ Error: GROQ_API_KEY not found")
      process.exit(1)
    }

    // Create 3 agents  ← Updated
    const agents = [
      new YieldNeuron(apiKey),
      new RiskNeuron(apiKey),
      new AirdropNeuron(apiKey)  // ← Add this
    ]

    console.log(`\n🤖 Initialized ${agents.length} agents:`)
    console.log("   - YieldNeuron (maximize returns)")
    console.log("   - RiskNeuron (minimize risk)")
    console.log("   - AirdropNeuron (hunt airdrops)")  // ← Add this
    console.log("\n" + "=".repeat(60))

    // Create orchestrator
    const cortex = new Cortex(agents)

    // Run coordination cycle
    await cortex.runCycle()

    console.log("\n" + "=".repeat(60))
    console.log("\n🎉 3-Agent coordination complete!")
    console.log("✅ All agents coordinated and voted!\n")
  }

  testOrchestrator().catch(console.error)