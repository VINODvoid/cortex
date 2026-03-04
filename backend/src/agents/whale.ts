import { Agent, type Proposal, type SystemContext } from "./base";

const INSTITUTIONAL_TVL = 100_000_000; // > $100M = institutional confidence

export class WhaleNeuron extends Agent {
  constructor(apiKey: string) {
    super("whale", apiKey);
  }

  override async think(context: SystemContext): Promise<Proposal> {
    this.setContext(context);
    try {
      const sortedPools = [...(context.pools ?? [])].sort((a, b) => b.tvl - a.tvl);
      const topPool = sortedPools[0];

      const prompt = `You are WhaleWatcher, a large-wallet activity monitor.
Your role: Track institutional and whale movements via TVL signals.

Current Portfolio:
SOL: ${context.portfolio.sol}
USDC: ${context.portfolio.usdc}

Available Pools (sorted by TVL):
${sortedPools.map((p) => `- ${p.name}: ${p.apy.toFixed(2)}% APY, TVL: $${p.tvl.toLocaleString()}`).join("\n") || "None"}

Whale Signals (using TVL as proxy for institutional activity):
- TVL > $100M = Institutional confidence (whale accumulation)
- Highest TVL pool = where smart money is concentrated
- Low TVL = whales have exited (distribution)

Respond ONLY with JSON — no preamble, no markdown:
{
  "action": "whale_accumulation" or "whale_distribution" or "whale_neutral",
  "target": "${topPool?.name ?? "null"}",
  "reasoning": "whale activity analysis based on TVL patterns",
  "confidence": 0-100
}`;
      const aiResponse = await this.askGroq(prompt);
      const parsed = this.parseResponse(aiResponse);
      return { agent: "whale", ...parsed };
    } catch (e) {
      console.error("WhaleNeuron think error:", e instanceof Error ? e.message : e);
      return { agent: "whale", action: "whale_neutral", reasoning: "Parse error — neutral stance", confidence: 0 };
    }
  }

  override async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    const targetPool = this.findPool(proposal.target);

    if (proposal.action === "rebalance" || proposal.action === "provide_liquidity") {
      if (targetPool) {
        // Follow smart money: support proposals targeting high-TVL (institutional) pools
        return targetPool.tvl >= INSTITUTIONAL_TVL ? "YES" : "ABSTAIN";
      }
      return "ABSTAIN";
    }

    if (proposal.action === "exit") {
      // Whales follow other whales — if TVL is low, follow them out
      if (targetPool && targetPool.tvl < 10_000_000) return "YES";
      return "ABSTAIN";
    }

    if (proposal.action === "whale_accumulation") return "YES";
    if (proposal.action === "whale_distribution") return "YES"; // Validate the signal

    return "ABSTAIN";
  }
}
