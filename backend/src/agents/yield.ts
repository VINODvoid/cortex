import { Agent, type Proposal, type SystemContext } from "./base";

export class YieldNeuron extends Agent {
  constructor(apiKey: string) {
    super("yield", apiKey);
  }

  async think(context: SystemContext): Promise<Proposal> {
    try {
      const prompt = `You are YieldNeuron, a DeFi yield optimizer.
      Your Job: Find the best APY.
      Current Portfolio:
      SOL:${context.portfolio.sol}
      USDC:${context.portfolio.usdc}

      Available Pools:
      ${context.pools
        ?.map((pool) => {
          return `${pool.name}:${pool.apy}% APY`;
        })
        .join("\n")}

      Should you rebalance if pool has better APY?
      Respond as JSON:{
      choose "action": either "rebalance" or "hold",
      "reasoning":"why",
      "confidence":0-100,
      "target":"pool name"
      }
      `;
      const aiResponse = await this.askGroq(prompt);
      const parsedAIResponse = this.extractJSON(aiResponse);
      const Response = JSON.parse(parsedAIResponse);
      return {
        agent: "yield",
        action: Response.action,
        reasoning: Response.reasoning,
        confidence: Response.confidence,
        target: Response.target,
      };
    } catch (e) {
      if (e instanceof Error) {
        console.log("Yield Agent: " + e.message);
      } else {
        console.log("YieldAgent Error: Something Went Wrong");
      }
      return {
        agent: "yield",
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
    // TODO: Implement smart voting- vote YES if Proposal increases yield
    return "ABSTAIN";
  }
}
