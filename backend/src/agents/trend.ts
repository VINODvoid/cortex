import { Agent, type Proposal, type SystemContext } from "./base";

export class TrendNeuron extends Agent {
  constructor(apiKey: string) {
    super("trend", apiKey);
  }

  override async think(context: SystemContext): Promise<Proposal> {
    this.setContext(context);
    try {
      const avgApy =
        context.pools && context.pools.length > 0
          ? context.pools.reduce((s, p) => s + p.apy, 0) / context.pools.length
          : 0;

      const prompt = `You are TrendNeuron, a market trend detector.
Your role: Identify bullish or bearish market momentum.

Current Portfolio:
SOL: ${context.portfolio.sol}
USDC: ${context.portfolio.usdc}

Available Pools (average APY: ${avgApy.toFixed(2)}%):
${context.pools?.map((p) => `- ${p.name}: ${p.apy.toFixed(2)}% APY, TVL: $${p.tvl.toLocaleString()}`).join("\n") ?? "None"}

Trend Indicators:
- Average APY > 8% = bullish market interest
- Growing high TVLs = capital flowing in (bullish)
- Average APY < 3% = bearish/stagnant
- Low TVLs across pools = capital leaving (bearish)

Respond ONLY with JSON — no preamble, no markdown:
{
  "action": "buy_trend" or "sell_trend" or "sideways",
  "target": "highest-TVL pool name or null",
  "reasoning": "market trend analysis",
  "confidence": 0-100
}`;
      const aiResponse = await this.askGroq(prompt);
      const parsed = this.parseResponse(aiResponse);
      return { agent: "trend", ...parsed };
    } catch (e) {
      console.error("TrendNeuron think error:", e instanceof Error ? e.message : e);
      return { agent: "trend", action: "sideways", reasoning: "Parse error — neutral stance", confidence: 0 };
    }
  }

  override async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    const pools = this.lastContext?.pools ?? [];
    const avgApy = pools.length
      ? pools.reduce((s, p) => s + p.apy, 0) / pools.length
      : 0;
    const bullish = avgApy >= 8;

    if (proposal.action === "rebalance" || proposal.action === "provide_liquidity") {
      // Follow trend: support momentum plays only in a bullish environment
      return bullish ? "YES" : "NO";
    }

    if (proposal.action === "exit" || proposal.action === "sell_trend") {
      return bullish ? "NO" : "YES"; // Don't exit during bull, do exit in bear
    }

    if (proposal.action === "buy_trend") {
      return bullish ? "YES" : "NO";
    }

    return "ABSTAIN";
  }
}
