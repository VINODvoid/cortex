import { Agent, type Proposal, type SystemContext } from "./base";

const MIN_SOL_FOR_EFFICIENT_SWAP = 0.5; // < 0.5 SOL → gas eats gains

export class GasOptimizerNeuron extends Agent {
  constructor(apiKey: string) {
    super("gas", apiKey);
  }

  override async think(context: SystemContext): Promise<Proposal> {
    this.setContext(context);
    try {
      const prompt = `You are GasOptimizer, the transaction cost minimizer.
Your role: Ensure expected yield exceeds transaction costs before approving any action.

Current Portfolio:
SOL: ${context.portfolio.sol}
USDC: ${context.portfolio.usdc}

Available Pools:
${context.pools?.map((p) => `- ${p.name}: ${p.apy.toFixed(2)}% APY, TVL: $${p.tvl.toLocaleString()}`).join("\n") ?? "None"}

Gas Cost Analysis (Solana):
- Each swap ≈ 0.000005 SOL in priority fees
- For small positions (< 0.5 SOL), gas is > 1% of position value — inefficient
- High APY (> 10%) can justify gas costs; low APY (< 5%) cannot
- Batching multiple operations reduces per-operation cost

Respond ONLY with JSON — no preamble, no markdown:
{
  "action": "optimize_gas" or "gas_efficient" or "high_gas_risk",
  "target": "pool name or null",
  "reasoning": "gas cost analysis",
  "confidence": 0-100
}`;
      const aiResponse = await this.askGroq(prompt);
      const parsed = this.parseResponse(aiResponse);
      return { agent: "gas", ...parsed };
    } catch (e) {
      console.error("GasOptimizerNeuron think error:", e instanceof Error ? e.message : e);
      return { agent: "gas", action: "gas_efficient", reasoning: "Parse error — assuming efficient", confidence: 0 };
    }
  }

  override async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    const sol = this.lastContext?.portfolio.sol ?? 0;
    const targetPool = this.findPool(proposal.target);

    if (proposal.action === "rebalance" || proposal.action === "provide_liquidity") {
      // Block gas-expensive operations when portfolio is too small
      if (sol < MIN_SOL_FOR_EFFICIENT_SWAP) return "NO";
      // Block if the target APY is too low to justify fees
      if (targetPool && targetPool.apy < 5) return "NO";
      // Support only high-confidence, high-APY proposals
      return proposal.confidence >= 70 ? "YES" : "ABSTAIN";
    }

    if (proposal.action === "hold" || proposal.action === "gas_efficient") {
      return "YES"; // No-transaction actions are always gas-optimal
    }

    if (proposal.action === "high_gas_risk") {
      return "NO"; // Flag the concern
    }

    return "ABSTAIN";
  }
}
