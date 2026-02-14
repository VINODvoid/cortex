import Groq from "groq-sdk";

// Types for agent communication
export type AgentRole =
  | "yield"
  | "risk"
  | "airdrop"
  | "strategist"
  | "tax"
  | "compliance"
  | "social"
  | "learning"
  | "gas"
  | "rebalance";

export interface Proposal {
  agent: AgentRole;
  action: string;
  reasoning: string;
  confidence: number; //0-100
  target?: string; //which pool or protocol
}

export interface SystemContext {
  portfolio: {
    sol: number;
    usdc: number;
    [key: string]: number;
  };
  pools: Array<{
    name: string;
    apy: string;
    tvl: string;
  }>;
}

export abstract class Agent {
  protected groq: Groq;

  constructor(
    public role: AgentRole,
    protected apiKey: string,
  ) {
    this.groq = new Groq({ apiKey });
  }
  abstract think(context: SystemContext): Promise<Proposal>;

  abstract vote(propsal: Proposal): Promise<"YES" | "NO" | "ABSTAIN">;

  protected async askGroq(prompt: string): Promise<string> {
    const response = await this.groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    });
    return response.choices[0]?.message.content || "";
  }
}
