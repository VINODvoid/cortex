import { Agent, type Proposal, type SystemContext } from "./base";

const DEEP_LIQUIDITY = 50_000_000;  // TVL > $50M = safe
const THIN_LIQUIDITY = 5_000_000;   // TVL < $5M = extreme risk

export class LiquidityNeuron extends Agent {
  constructor(apiKey: string) {
    super("liquidity", apiKey);
  }

  override async think(context: SystemContext): Promise<Proposal> {
    this.setContext(context);
    try {
      const prompt = `You are LiquidityNeuron, a liquidity depth monitor.
Your role: Assess liquidity safety before any capital deployment.

Current Portfolio:
SOL: ${context.portfolio.sol}
USDC: ${context.portfolio.usdc}

Available Pools:
${context.pools?.map((p) => `- ${p.name}: ${p.apy.toFixed(2)}% APY, TVL: $${p.tvl.toLocaleString()}`).join("\n") ?? "None"}

Liquidity Risk Levels:
- TVL < $5M  = EXTREME RISK (illiquid, high slippage)
- TVL $5M-$20M = CAUTION
- TVL > $50M = SAFE (deep liquidity)

If ANY pool has TVL < $5M, flag it as dangerous.

Respond ONLY with JSON — no preamble, no markdown:
{
  "action": "avoid_pool" or "safe",
  "target": "dangerous pool name or null",
  "reasoning": "TVL analysis",
  "confidence": 0-100
}`;
      const aiResponse = await this.askGroq(prompt);
      const parsed = this.parseResponse(aiResponse);
      return { agent: "liquidity", ...parsed };
    } catch (e) {
      console.error("LiquidityNeuron think error:", e instanceof Error ? e.message : e);
      return { agent: "liquidity", action: "safe", reasoning: "Parse error — assuming safe", confidence: 0 };
    }
  }

  override async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    const targetPool = this.findPool(proposal.target);

    if (proposal.action === "provide_liquidity" || proposal.action === "rebalance") {
      if (targetPool) {
        if (targetPool.tvl >= DEEP_LIQUIDITY) return "YES";  // Deep liquidity
        if (targetPool.tvl < THIN_LIQUIDITY) return "NO";    // Too illiquid
        return "ABSTAIN"; // Moderate — let others decide
      }
      return "ABSTAIN";
    }

    if (proposal.action === "avoid_pool") return "YES"; // Always support flagging danger
    if (proposal.action === "exit") return "YES";       // Exiting reduces liquidity risk exposure
    return "ABSTAIN";
  }
}
