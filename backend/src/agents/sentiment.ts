import { Agent, type Proposal, type SystemContext } from "./base";

export class SentimentNeuron extends Agent {
  constructor(apiKey: string) {
    super("sentiment", apiKey);
  }

  override async think(context: SystemContext): Promise<Proposal> {
    this.setContext(context);
    try {
      const prompt = `You are SentimentNeuron, a market sentiment analyzer.
Your role: Gauge community confidence based on on-chain signals.

Current Portfolio:
SOL: ${context.portfolio.sol}
USDC: ${context.portfolio.usdc}

Available Pools:
${context.pools?.map((p) => `- ${p.name}: ${p.apy.toFixed(2)}% APY, TVL: $${p.tvl.toLocaleString()}`).join("\n") ?? "None"}

Sentiment Signals (TVL + APY as proxies for community trust):
- High TVL + moderate APY = strong positive sentiment (established protocol)
- High TVL + very high APY = caution (unsustainable, attracts speculators)
- Low TVL + high APY = negative sentiment (users leaving or rug-pull risk)
- Declining TVL = negative sentiment (capital flight)

Respond ONLY with JSON — no preamble, no markdown:
{
  "action": "bullish_sentiment" or "bearish_sentiment" or "neutral_sentiment",
  "target": "pool name or null",
  "reasoning": "sentiment analysis",
  "confidence": 0-100
}`;
      const aiResponse = await this.askGroq(prompt);
      const parsed = this.parseResponse(aiResponse);
      return { agent: "sentiment", ...parsed };
    } catch (e) {
      console.error("SentimentNeuron think error:", e instanceof Error ? e.message : e);
      return { agent: "sentiment", action: "neutral_sentiment", reasoning: "Parse error — neutral stance", confidence: 0 };
    }
  }

  override async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    // Use confidence as a proxy for market conviction
    const highConfidence = proposal.confidence >= 65;

    if (proposal.action === "provide_liquidity" || proposal.action === "rebalance") {
      return highConfidence ? "YES" : "ABSTAIN";
    }

    if (proposal.action === "exit") {
      // Support exits when sentiment signals are clear
      return highConfidence ? "YES" : "ABSTAIN";
    }

    if (proposal.action === "bullish_sentiment") return "YES";
    if (proposal.action === "bearish_sentiment") {
      // If the swarm proposes action during bearish sentiment, block aggressive moves
      return "NO";
    }

    return "ABSTAIN";
  }
}
