# Technical Implementation

This document provides a technical deep-dive into how the CORTEX agents are constructed and how they interface with the LLM and the blockchain.

## Agent Architecture

All agents are implemented in TypeScript and reside in the `backend/src/agents/` directory. They follow an object-oriented design, inheriting from a common abstract base class.

### The Base Agent Class (`base.ts`)

The `Agent` abstract class defines the standard interface and shared functionality for all neurons.

```typescript
export abstract class Agent {
  constructor(
    public role: AgentRole, 
    protected apiKey: string
  ) {}

  // The thinking phase: Agent generates a proposal
  abstract think(context: SystemContext): Promise<Proposal>;

  // The voting phase: Agent evaluates a proposal
  abstract vote(proposal: Proposal): Promise<'YES' | 'NO' | 'ABSTAIN'>;

  // Internal helper for LLM communication
  protected async askGroq(prompt: string): Promise<string> {
    // Handles the request to the Groq API (Llama 3.3 70B)
  }
}
```

## AI Integration: Groq and Llama 3

CORTEX utilizes the **Groq Llama 3.3 70B Versatile** model for agent reasoning. Groq's high-speed inference is critical for maintaining real-time agent cycles.

### Structured Reasoning

Agents do not return plain text. They are prompted to reason in a structured manner and return responses in valid JSON format. This allows the Orchestrator to programmatically parse and act upon their "thoughts."

**Example Agent Prompting Strategy**:
1.  **System Prompt**: Defines the agent's identity (e.g., "You are RiskNeuron...").
2.  **Context Injection**: The current portfolio (balances, positions) and pool data (APY, TVL) are injected into the prompt.
3.  **Output Constraint**: The agent is instructed to output only a JSON object containing the action, target, reasoning, and confidence level.

## The Orchestrator Logic

The `Cortex` class (in `orchestrator.ts`) manages the lifecycle. It utilizes `Promise.all()` to ensure that all 10 agents perform their "thinking" phase in parallel, minimizing total latency.

```typescript
// Parallel Agent Execution
const proposals = await Promise.all(
  this.agents.map(agent => agent.think(context))
);
```

## Data Synchronization

The system uses a dedicated `SolanaService` and `PoolDataService` to bridge the gap between the blockchain and the AI agents.

-   **SolanaService**: Uses `@solana/web3.js` to fetch wallet balances and interact with the network.
-   **PoolDataService**: Aggregates data from various DeFi protocol APIs (Orca, Marinade, Kamino) and translates it into a simplified "SystemContext" that the LLM can easily process.

## Error Handling and Fallbacks

To ensure system stability, several layers of protection are implemented:

-   **JSON Parsing**: A robust `extractJSON` utility cleans AI responses, removing markdown formatting or preamble text before parsing.
-   **Graceful Degradation**: If an agent's LLM call fails or returns invalid data, the system catches the error and defaults that agent's proposal to a "HOLD" action and its vote to "ABSTAIN."
-   **Timeout Protection**: Individual agent calls are wrapped in timeouts to prevent a single slow AI response from blocking the entire swarm.

---

[Back to Agents Overview](./agents-overview.md)
