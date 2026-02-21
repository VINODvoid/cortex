import { Agent, type Proposal, type SystemContext } from "./base";

export class RebalancerNeuron extends Agent {
  constructor(apiKey: string) {
    super("rebalance", apiKey);
  }

  override async think(context: SystemContext): Promise<Proposal> {
    this.setContext(context);
    try {
      const sol = context.portfolio.sol;
      const usdc = context.portfolio.usdc;
      const totalValue = sol * 170 + usdc; // rough USD estimate
      const solConcentration = totalValue > 0 ? (sol * 170) / totalValue : 1;

      const prompt = `You are RebalancerNeuron, the portfolio rebalancing specialist.
Your role: Maintain optimal asset allocation and diversification.

Current Portfolio:
SOL: ${sol} (~$${(sol * 170).toFixed(0)})
USDC: ${usdc}
SOL Concentration: ${(solConcentration * 100).toFixed(1)}% of portfolio

Available Pools:
${context.pools?.map((p) => `- ${p.name}: ${p.apy.toFixed(2)}% APY, TVL: $${p.tvl.toLocaleString()}`).join("\n") ?? "None"}

Rebalancing Rules:
- If SOL concentration > 70% → portfolio is over-concentrated, recommend rebalancing
- If USDC = 0 → all idle capital, deploy to earn yield
- Target: diversify across 2-3 protocols with proven TVL

Respond ONLY with JSON — no preamble, no markdown:
{
  "action": "rebalance_needed" or "well_balanced" or "consolidate",
  "target": "best pool to deploy into or null",
  "reasoning": "rebalancing analysis",
  "confidence": 0-100
}`;
      const aiResponse = await this.askGroq(prompt);
      const parsed = this.parseResponse(aiResponse);
      return { agent: "rebalance", ...parsed };
    } catch (e) {
      console.error("RebalancerNeuron think error:", e instanceof Error ? e.message : e);
      return { agent: "rebalance", action: "well_balanced", reasoning: "Parse error — assuming balanced", confidence: 0 };
    }
  }

  override async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    const sol = this.lastContext?.portfolio.sol ?? 0;
    const usdc = this.lastContext?.portfolio.usdc ?? 0;
    const totalValue = sol * 170 + usdc;
    const solConcentration = totalValue > 0 ? (sol * 170) / totalValue : 1;

    if (proposal.action === "rebalance" || proposal.action === "rebalance_needed" || proposal.action === "provide_liquidity") {
      // Support rebalancing when portfolio is actually concentrated
      return solConcentration > 0.7 ? "YES" : "ABSTAIN";
    }

    if (proposal.action === "diversify") return "YES";

    if (proposal.action === "exit") {
      // Oppose exits that would make the portfolio even less balanced
      return solConcentration > 0.9 ? "ABSTAIN" : "NO";
    }

    return "ABSTAIN";
  }
}
