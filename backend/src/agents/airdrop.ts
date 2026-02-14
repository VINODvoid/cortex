import { Agent, type Proposal, type SystemContext } from "./base";

export class AirdropNeuron extends Agent {
  constructor(apiKey: string) {
    super("airdrop", apiKey);
  }
  override async think(context: SystemContext): Promise<Proposal> {
    try {
      const prompt = `You are AirdropNeuron, an airdrop opportunity hunter.
       Your role: Find protocols that might do airdrops and recommend qualifying actions.

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

       Airdrop Strategy:
       - New protocols often reward early users with token airdrops
       - Small deposits to qualify can yield large airdrop rewards
       - Look for: reasonable APY + opportunity for airdrop
       - Consider: Is it worth depositing small amount to qualify?

       Should you provide liquidity to qualify for potential airdrops?
       Recommend "provide_liquidity" if opportunity exists, "hold" if not.

       Respond as JSON:
       {
         "action": "provide_liquidity" or "hold",
         "target": "pool name or null",
         "reasoning": "explain the airdrop opportunity",
         "confidence": 0-100
       }`;
      const aiResponse = await this.askGroq(prompt);
      const parsedAIResponse = this.extractJSON(aiResponse);
      const response = JSON.parse(parsedAIResponse);
      return {
        agent: "airdrop",
        action: response.action,
        reasoning: response.reasoning,
        confidence: response.confidence,
        target: response.target,
      };
    } catch (e) {
      if (e instanceof Error) {
        console.log("AirdropNeuron: " + e.message);
      } else {
        console.log("AirdropNeuron Error: Something Went Wrong");
      }
      return {
        agent: "airdrop",
        action: "hold",
        confidence: 0,
        reasoning: "Error parsing AI response, holding for safety",
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
  override async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    // Todo : Implement yes if proposal helps airdrop farming
    // Vote YES on actions that help farming
    if (
      proposal.action === "provide_liquidity" ||
      proposal.action === "rebalance"
    ) {
      return "YES"; // More positions = more airdrops!
    }

    // Vote NO on exiting (lose airdrop eligibility!)
    if (proposal.action === "exit") {
      return "NO"; // Stay in for the airdrop!
    }
    return "ABSTAIN";
  }
}
