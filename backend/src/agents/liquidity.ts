import { Agent, type Proposal, type SystemContext } from "./base";

export class LiquidityNeuron extends Agent {
  constructor(apiKey: string) {
    super("liquidity", apiKey);
  }
  override async think(context: SystemContext): Promise<Proposal> {
    try {
      const prompt = `You are LiquidityNeuron, a liquidity depth monitor.
       Your role: Analyze liquidity opportunities and recommend optimal provision strategies.

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

       Liquidity Strategy:
       Liquidity Risk Assessment:
         - TVL < $5M = EXTREME RISK (illiquid, high slippage)
         - TVL $5M-$10M = CAUTION (moderate risk)
         - TVL > $50M = SAFE (deep liquidity)
       - Balanced portfolios benefit from providing liquidity to established pools
       - Consider trading fees + APY as total returns
       - Look for: stable TVL, reasonable APY, good trading volume
       - Avoid: Extremely low TVL pools, pools with sudden TVL drops

       Analyze the pools for liquidity depth.
      If ANY pool has TVL < $5M, recommend "avoid_pool" with that pool name.

       Respond as JSON:
       {
         "action": "avoid_pool" or "safe",
         "target": "pool name or null",
         "reasoning": "explain the liquidity opportunity and TVL analysis",
         "confidence": 0-100
       }`;
      const aiResponse = await this.askGroq(prompt);
      const parsedAIResponse = this.extractJSON(aiResponse);
      const response = JSON.parse(parsedAIResponse);

      return {
        agent: "liquidity",
        action: response.action,
        reasoning: response.reasoning,
        confidence: response.confidence,
        target: response.target,
      };
    } catch (e) {
      if (e instanceof Error) {
        console.log("LiquidityNeuron: " + e.message);
      } else {
        console.log("LiquidityNeuron Error: Something Went Wrong");
      }
      return {
        agent: "liquidity",
        action: "hold",
        reasoning: "Error parsing AI response, holding position for safety",
        confidence: 0,
        target: undefined,
      };
    }
  }

  override async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    // Vote YES on actions that improve liquidity provision
    if (
      proposal.action === "provide_liquidity" ||
      proposal.action === "rebalance"
    ) {
      return "NO"; // Could be targeting risky positions
    }

    // Vote NO on exiting positions (reduces liquidity)
    if (proposal.action === "exit" || proposal.action === "hold") {
      return "YES"; // Safe actions
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
