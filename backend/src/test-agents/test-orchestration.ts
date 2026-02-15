  import { Cortex } from "../orchestrator"
  import { YieldNeuron } from "../agents/yield"
  import { RiskNeuron } from "../agents/risk"
  import { AirdropNeuron } from "../agents/airdrop"
  import { StrategistNeuron } from "../agents/strategist"  // ← Add this

  async function testOrchestrator() {
    console.log("🧠 CORTEX - 4-Agent Strategic Swarm\n")
    console.log("=".repeat(60))

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      console.error("❌ Error: GROQ_API_KEY not found")
      process.exit(1)
    }

    // Create 4 agents
    const agents = [
      new YieldNeuron(apiKey),
      new RiskNeuron(apiKey),
      new AirdropNeuron(apiKey),
      new StrategistNeuron(apiKey)  // ← Add this
    ]

    console.log(`\n🤖 Initialized ${agents.length} agents:`)
    console.log("   - YieldNeuron (maximize returns)")
    console.log("   - RiskNeuron (minimize risk)")
    console.log("   - AirdropNeuron (hunt airdrops)")
    console.log("   - StrategistNeuron (strategic coordination)")  // ← Add this
    console.log("\n" + "=".repeat(60))

    const cortex = new Cortex(agents)
    await cortex.runCycle()

    console.log("\n" + "=".repeat(60))
    console.log("\n🎉 4-Agent strategic coordination complete!")
    console.log("✅ All agents coordinated with strategic oversight!\n")
  }

  testOrchestrator().catch(console.error)