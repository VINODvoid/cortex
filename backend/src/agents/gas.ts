
import { Agent, type Proposal, type SystemContext } from "./base";

export class GasOptimizerNeuron extends Agent {
  constructor(apiKey: string) {
    super("gas", apiKey);
  }

  override async think(context: SystemContext): Promise<Proposal> {
    try {
     
      const prompt = `You are GasOptimizer, the transaction cost
        optimizer.
        Your role: Minimize transaction fees and maximize capital
        efficiency.
      
        Current Portfolio:
        SOL: ${context.portfolio.sol}
        USDC: ${context.portfolio.usdc}
      
        Available Pools:
        ${context.pools?.map(p => `
        - ${p.name}: ${p.apy}% APY, TVL: $${p.tvl.toLocaleString()}
        `).join("\n")}
      
        Gas Optimization Strategy:
        - Small transactions = High gas cost relative to value
        (inefficient)
        - Batch operations when possible to reduce total gas
        - Avoid frequent rebalancing (gas costs add up)
        - Higher APY must justify gas costs
      
        Gas Cost Analysis:
        - Is the expected profit worth the gas cost?
        - For small positions (<$100), gas can eat most gains
        - Recommend batching multiple operations together
      
        Gas Actions:
        - "optimize_gas": Reduce transaction frequency, batch operations
        - "gas_efficient": Current strategy minimizes gas costs
        - "high_gas_risk": Too many small transactions, costs too high
      
        Analyze if current strategy is gas-efficient.
      
        Respond as JSON:
        {
          "action": "optimize_gas" or "gas_efficient" or "high_gas_risk",
          "target": "pool name or null",
          "reasoning": "explain the gas cost analysis",
          "confidence": 0-100
        }`;
      const aiResponse = await this.askGroq(prompt);
      const parsedAIResponse = this.extractJSON(aiResponse);
      const response = JSON.parse(parsedAIResponse);

      return {
        agent: "gas",
        action: response.action,
        reasoning: response.reasoning,
        confidence: response.confidence,
        target: response.target,
      };
    } catch (e) {
      if (e instanceof Error) {
        console.log("GasOptimizerNeuron: " + e.message);
      } else {
        console.log("GasOptimizerNeuron Error: Something Went Wrong");
      }
      return {
        agent: "gas",
        action: "gas_efficient",
        reasoning: "Error parsing AI response, holding position for safety",
        confidence: 0,
        target: undefined,
      };
    }
  }

  override async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    
    // Vote NO on frequent small rebalances (gas inefficient)
    if (
      proposal.action === "rebalance" ||
      proposal.action === "provide_liquidity"
    ) {
      return "NO"; // Prevent gas-expensive operations
    }
  
    // Vote YES on hold (saves gas)
    if (proposal.action === "hold") {
      return "YES"; // No transactions = no gas costs
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
