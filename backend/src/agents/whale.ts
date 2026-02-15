import { Agent, type Proposal, type SystemContext } from "./base";

export class WhaleNeuron extends Agent {
  constructor(apiKey: string) {
    super("whale", apiKey);
  }

  override async think(context: SystemContext): Promise<Proposal> {
    try {
      const prompt = `You are WhaleWatcher, the whale activity monitor.
       Your role: Track large wallet movements and institutional
       activity.

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

       Whale Monitoring Strategy:
       - Sudden TVL increases = Whales entering (bullish signal)
       - Sudden TVL decreases = Whales exiting (bearish signal)
       - Very high TVL = Institutional confidence (safe)
       - Rapid TVL changes = Smart money moving

       Note: In production, you'd track wallet addresses, large
       transactions.
       For now, use TVL size and changes as proxies for whale activity.

       Whale Signals:
       - "whale_accumulation": Large wallets buying in, follow them
       - "whale_distribution": Large wallets selling, be cautious
       - "whale_neutral": No significant whale activity

       Analyze TVL patterns for whale activity signals.

       Respond as JSON:
       {
         "action": "whale_accumulation" or "whale_distribution" or  "whale_neutral",
         "target": "pool name or null",
         "reasoning": "explain the whale activity analysis",
         "confidence": 0-100
       }`;
      const aiResponse = await this.askGroq(prompt);
      const parsedAIResponse = this.extractJSON(aiResponse);
      const response = JSON.parse(parsedAIResponse);

      return {
        agent: "whale",
        action: response.action,
        reasoning: response.reasoning,
        confidence: response.confidence,
        target: response.target,
      };
    } catch (e) {
      if (e instanceof Error) {
        console.log("WhaleNeuron: " + e.message);
      } else {
        console.log("WhaleNeuron Error: Something Went Wrong");
      }
      return {
        agent: "whale",
        action: "whale_neutral",
        reasoning: "Error parsing AI response, holding position for safety",
        confidence: 0,
        target: undefined,
      };
    }
  }

  override async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    // Vote YES on following whale accumulation
    if (
      proposal.action === "provide_liquidity" ||
      proposal.action === "rebalance"
    ) {
      return "YES"; // Follow smart money
    }

    // Vote YES on exit during whale distribution
    if (proposal.action === "exit") {
      return "YES"; // Follow whales out
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
