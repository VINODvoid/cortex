import { Agent, type Proposal, type SystemContext } from "./base";

export class StrategistNeuron extends Agent {
  constructor(apiKey: string) {
    super("strategist", apiKey);
  }

  async think(context: SystemContext): Promise<Proposal> {
    try {
      const prompt = `You are StrategistNeuron, the strategic portfolio coordinator.
        Your role: Analyze overall portfolio health and recommend strategic direction.

        Current Portfolio:
        SOL: ${context.portfolio.sol}
        USDC: ${context.portfolio.usdc}

        Available Pools:
        ${context.pools
          ?.map(
            (p) => `
        - ${p.name}: ${p.apy}% APY, TVL: $${p.tvl.toLocaleString()}
        `,
          )
          .join("\n")}

        Strategic Considerations:
        - Portfolio diversification: Is portfolio too concentrated?
        - Risk/reward balance: Are we too aggressive or too conservative?
        - Long-term positioning: What's the best strategy for growth?
        - Synergy: Do available opportunities align with goals?

        Current state: 100% in SOL (not earning yield)

        What strategic action should we take?
        - "optimize": Rebalance for best overall portfolio health
        - "diversify": Spread across multiple protocols
        - "consolidate": Simplify positions
        - "hold": Current strategy is optimal

        Respond as JSON:
        {
          "action": "optimize" | "diversify" | "consolidate" | "hold",
          "target": "recommended pool or null",
          "reasoning": "explain the strategic thinking",
          "confidence": 0-100
        }`;
      const aiResponse = await this.askGroq(prompt);
      const parsedAIResponse = this.extractJSON(aiResponse);
      const response = JSON.parse(parsedAIResponse);
      return {
        agent: "strategist",
        action: response.action,
        reasoning: response.reasoning,

        confidence: response.confidence,
        target: response.target,
      };
    } catch (e) {
      if (e instanceof Error) {
        console.log("StrategicNeuron: " + e.message);
      } else {
        console.log("StrategicNeuron Error: Something Went Wrong");
      }
      return {
        agent: "strategist",
        action: "hold",
        reasoning: "Error parsing AI response, holding position for safety",
        confidence: 0,
        target: undefined,
      };
    }
  }

  // Helper to extract JSON from AI response (removes markdown formatting)
  private extractJSON(response: string): string {
    // Remove markdown code blocks if present
    let cleaned = response.trim();

    // Remove ```json and ``` markers
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/i, "");
      cleaned = cleaned.replace(/\n?```$/, "");
    }

    return cleaned.trim();
  }
  async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    // TODO: Implement smart voting - vote YES if Proposal increases yield
    if (
      proposal.action === "optimize" ||
      proposal.action === "provide_liquidity" || proposal.action === "rebalance"
    ) {
      return "YES";
    }
    

    return "ABSTAIN";
  }
}
