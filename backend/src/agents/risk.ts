import { Agent, type Proposal, type SystemContext } from "./base";

export class RiskNeuron extends Agent {
  constructor(apiKey: string) {
    super("risk", apiKey);
  }
  async think(context: SystemContext): Promise<Proposal> {
    try {
      const prompt = `You are RiskNeuron,
         Your Job: To protect against losses.
          Current Portfolio:
          SOL:${context.portfolio.sol}
          USDC:${context.portfolio.usdc}
          Available Pools:
          ${context.pools
            ?.map((pool) => {
              return `${pool.name}: ${pool.apy}% APY, TVL: $${pool.tvl.toLocaleString()}`;
            })
            .join("\n")}
          Are There any risks? should we exit risky positions ?
          Factors like
          Low TVL (< $10M)
          High APY ( > 15 %)
          sudden TVL drops
          Respond as JSON:{
          choose "action": either "exit" or "hold",
          "reasoning":"why",
          "confidence":0-100,
          "target":""
          }`;
      const aiResponse = await this.askGroq(prompt);
      const parsedAiResponse = this.extractJSON(aiResponse);
      const response = JSON.parse(parsedAiResponse);

      return {
        agent: "risk",
        action: response.action,
        reasoning: response.reasoning,
        confidence: response.confidence,
        target: response.target,
      };
    } catch (e) {
      if (e instanceof Error) {
        console.log("RiskNeuron Error " + e.message);
      } else {
        console.log("RiskNeuron Error: Something went wrong");
      }
      return {
        agent: "risk",
        action: "hold",
        reasoning: "AI parsing Error , holding position for safety",
        confidence: 0,
        target: undefined,
      };
    }
  }

  // Helper to extract JSON from AI response (removes markdown formatting)
  private extractJSON(response: string): string {
    // Remove markdown code blocks if present
    let cleaned = response.trim();

    // Remove ```json and ``` markers
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/i, "");
      cleaned = cleaned.replace(/\n?```$/, "");
    }

    return cleaned.trim();
  }
  override async vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN"> {
    // Todo Implement smart voting 
    return "ABSTAIN";
  }
}
