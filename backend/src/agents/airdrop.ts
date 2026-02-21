import { Agent, type Proposal, type SystemContext } from "./base";

const MIN_SOL_FOR_AIRDROP_FARMING = 0.1; // Need at least a qualifying deposit

export class AirdropNeuron extends Agent {
  constructor(apiKey: string) {
    super("airdrop", apiKey);
  }

  override async think(context: SystemContext): Promise<Proposal> {
    this.setContext(context);
    try {
      const prompt = `You are AirdropNeuron, an airdrop opportunity hunter.
Your role: Identify protocols likely to reward early liquidity providers with airdrops.

Current Portfolio:
SOL: ${context.portfolio.sol}
USDC: ${context.portfolio.usdc}

Available Pools:
${context.pools?.map((p) => `- ${p.name}: ${p.apy.toFixed(2)}% APY, TVL: $${p.tvl.toLocaleString()}`).join("\n") ?? "None"}

Airdrop Strategy:
- Protocols with moderate TVL growth ($20M-$100M) = likely in growth phase, airdrop likely
- Very high TVL (> $200M) = too mature, airdrop already happened
- Low TVL (< $5M) = too risky as a primary position
- Small qualifying deposit + APY yield = double opportunity

Should we provide liquidity to qualify for a potential airdrop? Only if SOL > ${MIN_SOL_FOR_AIRDROP_FARMING}.

Respond ONLY with JSON — no preamble, no markdown:
{
  "action": "provide_liquidity" or "hold",
  "target": "most promising pool for airdrop farming or null",
  "reasoning": "airdrop opportunity analysis",
  "confidence": 0-100
}`;
      const aiResponse = await this.askGroq(prompt);
      const parsed = this.parseResponse(aiResponse);
      return { agent: "airdrop", ...parsed };
    } catch (e) {
      console.error("AirdropNeuron think error:", e instanceof Error ? e.message : e);
      return { agent: "airdrop", action: "hold", reasoning: "Parse error — holding for safety", confidence: 0 };
    }
  }

  override async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    const sol = this.lastContext?.portfolio.sol ?? 0;
    const targetPool = this.findPool(proposal.target);

    if (proposal.action === "provide_liquidity" || proposal.action === "rebalance") {
      // Only support if we have enough SOL to farm and the pool is in the right TVL range
      if (sol < MIN_SOL_FOR_AIRDROP_FARMING) return "NO";
      if (targetPool) {
        const goodRange = targetPool.tvl >= 5_000_000 && targetPool.tvl <= 200_000_000;
        return goodRange ? "YES" : "ABSTAIN";
      }
      return proposal.confidence >= 60 ? "YES" : "ABSTAIN";
    }

    if (proposal.action === "exit") {
      // Exiting loses airdrop eligibility — oppose unless confidence is very high
      return proposal.confidence >= 80 ? "ABSTAIN" : "NO";
    }

    return "ABSTAIN";
  }
}
