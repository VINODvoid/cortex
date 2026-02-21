import { Agent, type Proposal, type SystemContext } from "./base";

export class StrategistNeuron extends Agent {
  constructor(apiKey: string) {
    super("strategist", apiKey);
  }

  override async think(context: SystemContext): Promise<Proposal> {
    this.setContext(context);
    try {
      const prompt = `You are StrategistNeuron, the strategic portfolio coordinator.
Your role: Analyze overall portfolio health and recommend strategic direction.

Current Portfolio:
SOL: ${context.portfolio.sol}
USDC: ${context.portfolio.usdc}

Available Pools:
${context.pools?.map((p) => `- ${p.name}: ${p.apy.toFixed(2)}% APY, TVL: $${p.tvl.toLocaleString()}`).join("\n") ?? "None"}

Strategic Considerations:
- Diversification: too concentrated in one asset?
- Risk/reward: too aggressive or too conservative?
- Idle capital: SOL not earning yield is a missed opportunity

Actions:
- "optimize": Rebalance for best risk-adjusted returns
- "diversify": Spread across multiple protocols
- "consolidate": Simplify positions
- "hold": Current strategy is already optimal

Respond ONLY with JSON — no preamble, no markdown:
{
  "action": "optimize" or "diversify" or "consolidate" or "hold",
  "target": "recommended pool or null",
  "reasoning": "strategic thinking",
  "confidence": 0-100
}`;
      const aiResponse = await this.askGroq(prompt);
      const parsed = this.parseResponse(aiResponse);
      return { agent: "strategist", ...parsed };
    } catch (e) {
      console.error("StrategistNeuron think error:", e instanceof Error ? e.message : e);
      return { agent: "strategist", action: "hold", reasoning: "Parse error — holding for safety", confidence: 0 };
    }
  }

  override async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    // Strategist supports goal-aligned proposals with sufficient confidence
    const CONFIDENCE_THRESHOLD = 60;

    if (
      proposal.action === "optimize" ||
      proposal.action === "diversify" ||
      proposal.action === "rebalance" ||
      proposal.action === "provide_liquidity"
    ) {
      return proposal.confidence >= CONFIDENCE_THRESHOLD ? "YES" : "ABSTAIN";
    }

    if (proposal.action === "consolidate" || proposal.action === "hold") {
      return "ABSTAIN"; // Neutral on conservative actions
    }

    if (proposal.action === "exit") {
      // Support exits only if they're high-confidence and well-reasoned
      return proposal.confidence >= 75 ? "YES" : "NO";
    }

    return "ABSTAIN";
  }
}
