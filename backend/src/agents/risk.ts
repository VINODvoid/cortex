import { Agent, type Proposal, type SystemContext } from "./base";

const RISKY_APY_THRESHOLD = 50;   // > 50% APY is suspicious
const SAFE_TVL_THRESHOLD = 10_000_000; // < $10M TVL is risky

export class RiskNeuron extends Agent {
  constructor(apiKey: string) {
    super("risk", apiKey);
  }

  override async think(context: SystemContext): Promise<Proposal> {
    this.setContext(context);
    try {
      const prompt = `You are RiskNeuron, a DeFi risk guard.
Your job: Protect the portfolio against losses.

Current Portfolio:
SOL: ${context.portfolio.sol}
USDC: ${context.portfolio.usdc}

Available Pools:
${context.pools?.map((p) => `- ${p.name}: ${p.apy.toFixed(2)}% APY, TVL: $${p.tvl.toLocaleString()}`).join("\n") ?? "None"}

Risk Factors to evaluate:
- Low TVL (< $10M) = illiquid, high slippage risk
- Abnormally High APY (> 50%) = potential rug-pull or unsustainable
- Very high concentration in a single asset

Recommend "exit" if a high-risk exposure is detected, otherwise "hold".
Respond ONLY with JSON — no preamble, no markdown:
{
  "action": "exit" or "hold",
  "reasoning": "why",
  "confidence": 0-100,
  "target": "risky pool name or null"
}`;
      const aiResponse = await this.askGroq(prompt);
      const parsed = this.parseResponse(aiResponse);
      return { agent: "risk", ...parsed };
    } catch (e) {
      console.error("RiskNeuron think error:", e instanceof Error ? e.message : e);
      return { agent: "risk", action: "hold", reasoning: "Parse error — holding for safety", confidence: 0 };
    }
  }

  override async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    const targetPool = this.findPool(proposal.target);

    if (proposal.action === "rebalance" || proposal.action === "provide_liquidity") {
      if (targetPool) {
        const isRisky =
          targetPool.tvl < SAFE_TVL_THRESHOLD ||
          targetPool.apy > RISKY_APY_THRESHOLD;
        return isRisky ? "NO" : "YES";
      }
      // No pool data — abstain
      return "ABSTAIN";
    }

    if (proposal.action === "exit") return "YES";  // Exiting = safer
    if (proposal.action === "hold") return "YES";  // Holding = safe
    return "ABSTAIN";
  }
}
