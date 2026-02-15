import { Agent, type Proposal, type SystemContext } from "./base";

export class RebalancerNeuron extends Agent {
  constructor(apiKey: string) {
    super("rebalance", apiKey);
  }

  override async think(context: SystemContext): Promise<Proposal> {
    try {
      const prompt = `You are RebalancerNeuron, the portfolio
      rebalancing specialist.
      Your role: Maintain optimal asset allocation and diversification.

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

      Rebalancing Strategy:
      - Portfolio too concentrated? Diversify across multiple pools
      - Portfolio too spread out? Consolidate to reduce complexity
      - Idle capital (SOL/USDC)? Deploy to productive assets
      - One position > 50% of portfolio? Reduce concentration risk

      Rebalancing Actions:
      - "rebalance_needed": Portfolio is unbalanced, needs adjustment
      - "well_balanced": Portfolio allocation is optimal
      - "consolidate": Too many small positions, simplify

      Analyze the current allocation.
      Check if portfolio is too concentrated (>70% in one asset) or has
      idle capital.

      Respond as JSON:
      {
        "action": "rebalance_needed" or "well_balanced" or
      "consolidate",
        "target": "suggested pool or null",
        "reasoning": "explain the rebalancing analysis",
        "confidence": 0-100
      }`;
      const aiResponse = await this.askGroq(prompt);
      const parsedAIResponse = this.extractJSON(aiResponse);
      const response = JSON.parse(parsedAIResponse);

      return {
        agent: "rebalance",
        action: response.action,
        reasoning: response.reasoning,
        confidence: response.confidence,
        target: response.target,
      };
    } catch (e) {
      if (e instanceof Error) {
        console.log("RebalanceNeuron: " + e.message);
      } else {
        console.log("RebalanceNeuron Error: Something Went Wrong");
      }
      return {
        agent: "rebalance",
        action: "well_balanced",
        reasoning: "Error parsing AI response, holding position for safety",
        confidence: 0,
        target: undefined,
      };
    }
  }

  override async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    // Vote YES on rebalancing and diversification
    if (
      proposal.action === "rebalance" ||
      proposal.action === "provide_liquidity" ||
      proposal.action === "diversify"
    ) {
      return "YES"; // Support portfolio optimization
    }

    // Vote NO on exits that would unbalance portfolio
    if (proposal.action === "exit") {
      return "NO"; // Maintain balanced positions
    }

    return "ABSTAIN";
  }

  private extractJSON(response: string): string {
    let cleaned = response.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/i, "");
      cleaned = cleaned.replace(/\n?```$/, "");
    }
    return cleaned.trim();
  }
}
