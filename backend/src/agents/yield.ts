import { Agent, type Proposal, type SystemContext } from "./base";

export class YieldNeuron extends Agent {
  constructor(apiKey: string) {
    super("yield", apiKey);
  }

  override async think(context: SystemContext): Promise<Proposal> {
    this.setContext(context);
    try {
      const prompt = `You are YieldNeuron, a DeFi yield optimizer.
Your job: Find the best APY opportunity.

Current Portfolio:
SOL: ${context.portfolio.sol}
USDC: ${context.portfolio.usdc}

Available Pools:
${context.pools?.map((p) => `- ${p.name}: ${p.apy.toFixed(2)}% APY, TVL: $${p.tvl.toLocaleString()}`).join("\n") ?? "None"}

Should you rebalance into a higher-APY pool or hold?
Respond ONLY with JSON — no preamble, no markdown:
{
  "action": "rebalance" or "hold",
  "reasoning": "why",
  "confidence": 0-100,
  "target": "pool name or null"
}`;
      const aiResponse = await this.askGroq(prompt);
      const parsed = this.parseResponse(aiResponse);
      return { agent: "yield", ...parsed };
    } catch (e) {
      console.error("YieldNeuron think error:", e instanceof Error ? e.message : e);
      return { agent: "yield", action: "hold", reasoning: "Parse error — holding for safety", confidence: 0 };
    }
  }

  override async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    const targetPool = this.findPool(proposal.target);

    if (proposal.action === "rebalance" || proposal.action === "provide_liquidity") {
      if (targetPool) {
        // Vote YES only if the target genuinely has good APY
        if (targetPool.apy >= 8) return "YES";
        if (targetPool.apy < 4) return "NO"; // Poor yield, not worth it
      }
      return proposal.confidence >= 65 ? "YES" : "ABSTAIN";
    }

    if (proposal.action === "exit") {
      // Don't exit high-yield positions unless the agent is very confident
      if (targetPool && targetPool.apy > 12) return "NO";
      return "ABSTAIN";
    }

    if (proposal.action === "hold") return "ABSTAIN";
    return "ABSTAIN";
  }
}
