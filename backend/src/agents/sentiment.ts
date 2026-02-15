import { Agent, type Proposal, type SystemContext } from "./base";

export class SentimentNeuron extends Agent {
  constructor(apiKey: string) {
    super("sentiment", apiKey);
  }

  override async think(context: SystemContext): Promise<Proposal> {
    try {
      const prompt = `You are SentimentNeuron, the market sentiment
          analyzer.
          Your role: Gauge community sentiment and protocol reputation.

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

          Sentiment Analysis:
          - High TVL + High APY = Strong positive sentiment (community
          trusts it)
          - High TVL + Low APY = Established protocol (mature, stable)
          - Low TVL + High APY = Risky/new (could be scam or opportunity)
          - Declining TVL = Negative sentiment (users leaving)

          Note: In production, you'd analyze Twitter, Discord, governance
          votes.
          For now, use TVL + APY as proxies for community sentiment.

          Sentiment Signals:
          - "bullish_sentiment": Positive community vibes, enter positions
          - "bearish_sentiment": Negative vibes, reduce exposure
          - "neutral_sentiment": Mixed signals, maintain allocation

          Respond as JSON:
          {
            "action": "bullish_sentiment" or "bearish_sentiment" or
          "neutral_sentiment",
            "target": "pool name or null",
            "reasoning": "explain the sentiment analysis",
            "confidence": 0-100
          }`;

      const aiResponse = await this.askGroq(prompt);
      const parsedAIResponse = this.extractJSON(aiResponse);
      const response = JSON.parse(parsedAIResponse);

      return {
        agent: "sentiment",
        action: response.action,
        reasoning: response.reasoning,
        confidence: response.confidence,
        target: response.target,
      };
    } catch (e) {
      if (e instanceof Error) {
        console.log("SentimentNeuron: " + e.message);
      } else {
        console.log("SentimentNeuron Error: Something Went Wrong");
      }
      return {
        agent: "sentiment",
        action: "hold",
        reasoning: "Error parsing AI response, holding position for safety",
        confidence: 0,
        target: undefined,
      };
    }
  }

  override async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    if (
      proposal.action === "provide_liquidity" ||
      proposal.action === "rebalance"
    ) {
      return "YES"; // Follow positive sentiment
    }

    // Vote YES on exit during bearish sentiment
    if (proposal.action === "exit") {
      return "YES"; // Protect capital during negative sentiment
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
