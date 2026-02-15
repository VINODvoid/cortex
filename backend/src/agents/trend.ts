
import { Agent, type Proposal, type SystemContext } from "./base";

export class TrendNeuron extends Agent {
  constructor(apiKey: string) {
    super("trend", apiKey);
  }
  override async think(context: SystemContext): Promise<Proposal> {
    try {
      const prompt = `You are TrendNeuron, a market trend detector
       Your role: Identify bullish or bearish market momentum.

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
       Trend Indicators:
       - High APYs (>8%) = bullish market interest
       - Growing TVLs = capital flowing in (bullish)
       - Low APYs (<3%) = bearish/stagnant
       - Declining TVLs = capital fleeing (bearish)

       Respond as JSON:
       {
         "action": "buy_trend" or "sell_trend" or "sideways",
         "target": "pool name or null",
         "reasoning": "explain the market trend",
         "confidence": 0-100
       }`;
      const aiResponse = await this.askGroq(prompt);
      const parsedAIResponse = this.extractJSON(aiResponse);
      const response = JSON.parse(parsedAIResponse);

      return {
        agent: "trend",
        action: response.action,
        reasoning: response.reasoning,
        confidence: response.confidence,
        target: response.target,
      };
    } catch (e) {
      if (e instanceof Error) {
        console.log("TrendNeuron: " + e.message);
      } else {
        console.log("TrendNeuron Error: Something Went Wrong");
      }
      return {
        agent: "trend",
        action: "hold",
        reasoning: "Error parsing AI response, holding position for safety",
        confidence: 0,
        target: undefined,
      };
    }
  }

  override async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    // Vote YES on following market momentum
    if (
      proposal.action === "provide_liquidity" ||
      proposal.action === "rebalance"
    ) {
      return "YES"; 
    }

    // Vote NO on existing during trends
    if (proposal.action === "exit" ) {
      return "NO"; 
    }

    return "ABSTAIN";
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
}
