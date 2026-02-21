# CORTEX System Architecture

Technical specifications and design decisions for the CORTEX autonomous agent platform.

## High-Level Architecture

The system is composed of three primary layers: the Mobile Interface, the Backend Orchestration Engine, and the Blockchain Service Layer.

- **Mobile Application**: Developed with React Native and Expo, providing a dashboard for monitoring agent activity and portfolio status.
- **Backend Server**: Powered by the Bun runtime and TypeScript, managing agent logic, consensus, and transaction orchestration.
- **Infrastructure**: Utilizes the Groq API for AI inference and the Solana blockchain for decentralized execution.

## Agent Layer

### Base Agent Framework

The system utilizes an extensible agent framework. All specialized neurons inherit from a central abstract class that defines core behaviors for reasoning and participation in governance.

```typescript
export abstract class Agent {
  protected groq: Groq;
  constructor(public role: AgentRole, protected apiKey: string);

  // Mandatory implementation for strategy formulation
  abstract think(context: SystemContext): Promise<Proposal>;
  
  // Mandatory implementation for democratic participation
  abstract vote(proposal: Proposal): Promise<'YES' | 'NO' | 'ABSTAIN'>;

  // Standardized AI communication interface
  protected async askGroq(prompt: string): Promise<string>;
}
```

### Agent Specializations

Each agent is defined by a unique role, a specialized system prompt for its LLM, and a distinct voting strategy aligned with its primary objective (e.g., Yield maximization vs. Risk mitigation).

## Orchestration and Consensus

### Cortex Orchestrator

The orchestrator serves as the central coordination hub, executing cycles of deliberation and action.

1. **Information Gathering**: The orchestrator provides agents with current market and portfolio data.
2. **Thinking Phase**: Agents generate independent proposals in parallel.
3. **Voting Phase**: Each proposal is subjected to a democratic vote by all ten agents.
4. **Consensus Validation**: Proposals meeting the majority threshold are queued for execution.

### Democratic Governance

The platform implements a majority-rule consensus model:
- **Vote Options**: Affirmative, Negative, or Abstain.
- **Approval Threshold**: Affirmative votes must exceed Negative votes.
- **Conservative Default**: In the event of a tie, the proposal is rejected.

## Blockchain Integration

### Solana Service

The `SolanaService` class manages the connection to the Solana network, handling wallet authentication, balance inquiries on devnet, and transaction signing.

### Protocol Data Layer

The `PoolDataService` facilitates the retrieval of real-time data from integrated DeFi protocols, including Orca, Marinade, and Kamino. This data is utilized by the agents during the thinking phase to inform their strategies.

## Data Flow and Execution

1. **Cycle Trigger**: The orchestrator initiates a new evaluation cycle.
2. **Strategy Formulation**: Agents consult the Groq API to generate structured JSON proposals.
3. **Validation**: The swarm evaluates proposals against their individual strategic goals.
4. **Execution**: Approved strategies are translated into on-chain instructions via the Jupiter aggregator.

## Security and Integrity

- **Environment Management**: Sensitive credentials, including API keys and RPC URLs, are managed strictly through environment variables.
- **Fail-safe Logic**: Agents are programmed with default "Hold" behaviors to ensure system stability in the event of API failures or ambiguous market conditions.
- **Wallet Security**: Initial development utilizes disposable devnet keypairs. Production implementation will support hardware wallets and user-confirmed transaction signing.

## Performance and Scalability

- **Asynchronous Execution**: Agent reasoning processes are executed in parallel to minimize cycle latency.
- **Data Caching**: Market data is cached with periodic invalidation to reduce RPC overhead and API costs.
- **Horizontal Scaling**: The agent framework is designed to support additional specialized neurons as the platform evolves.

---

Last Updated: February 2026
