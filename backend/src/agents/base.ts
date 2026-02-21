import Groq from "groq-sdk";
import { parseAgentResponse, type AgentResponseShape } from "../utils/ai-parser";

// Types for agent communication
export type AgentRole =
  | "yield"
  | "risk"
  | "airdrop"
  | "strategist"
  | "liquidity"
  | "trend"
  | "sentiment"
  | "whale"
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
  confidence: number; // 0-100
  target?: string;    // which pool or protocol
}

export interface SystemContext {
  portfolio: {
    sol: number;
    usdc: number;
    [key: string]: number;
  };
  pools?: Array<{
    name: string;
    apy: number;
    tvl: number;
  }>;
}

export abstract class Agent {
  protected groq: Groq;
  /** Cached context from the most recent think() call — used by vote() for smart decisions. */
  protected lastContext?: SystemContext;

  constructor(
    public role: AgentRole,
    protected apiKey: string,
  ) {
    this.groq = new Groq({ apiKey });
  }

  abstract think(context: SystemContext): Promise<Proposal>;
  abstract vote(proposal: Proposal): Promise<"YES" | "NO" | "ABSTAIN">;

  protected async askGroq(prompt: string): Promise<string> {
    const response = await this.groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    });
    return response.choices[0]?.message.content ?? "";
  }

  /** Store context so vote() can reference pool data when evaluating proposals. */
  protected setContext(ctx: SystemContext): void {
    this.lastContext = ctx;
  }

  /**
   * Parse the raw LLM string into a validated AgentResponseShape.
   * Delegates to the centralised ai-parser utility (DRY, robust).
   */
  protected parseResponse(text: string): AgentResponseShape {
    return parseAgentResponse(text);
  }

  /** Convenience: find a pool by name in lastContext. */
  protected findPool(name?: string) {
    if (!name) return undefined;
    return this.lastContext?.pools?.find((p) => p.name === name);
  }
}
