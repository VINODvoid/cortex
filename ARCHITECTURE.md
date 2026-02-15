# 🏗️ CORTEX - System Architecture

> Technical architecture and design decisions

---

## 🎯 High-Level Architecture

```
┌─────────────────┐
│   Mobile App    │  React Native + Expo
│  (React Native) │  - Agent Dashboard
│                 │  - Proposal Feed
│                 │  - Portfolio View
└────────┬────────┘
         │ HTTP/WebSocket
         ▼
┌─────────────────┐
│  Backend Server │  Bun + TypeScript
│   (Bun + TS)    │  - Agent Orchestrator
│                 │  - Voting System
│                 │  - Transaction Executor
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────────┐
│  Groq   │ │   Solana     │
│  API    │ │  Blockchain  │
│         │ │   (Devnet)   │
└─────────┘ └──────────────┘
```

---

## 🧠 Agent Layer

### Base Agent Class

All agents inherit from `Agent` abstract class:

```typescript
export abstract class Agent {
  protected groq: Groq;
  constructor(public role: AgentRole, protected apiKey: string);

  // Core methods every agent must implement
  abstract think(context: SystemContext): Promise<Proposal>;
  abstract vote(proposal: Proposal): Promise<'YES' | 'NO' | 'ABSTAIN'>;

  // Shared AI communication
  protected async askGroq(prompt: string): Promise<string>;
}
```

### Agent Specializations

Each agent has:
1. **Unique Role**: Specialized domain (yield, risk, sentiment, etc.)
2. **Custom Prompt**: AI system prompt defining behavior
3. **Voting Strategy**: How it votes on other agents' proposals
4. **Error Handling**: Fallback behavior when AI fails

### Example: YieldNeuron

```typescript
export class YieldNeuron extends Agent {
  constructor(apiKey: string) {
    super("yield", apiKey);
  }

  async think(context: SystemContext): Promise<Proposal> {
    // Analyze pools for highest APY
    const prompt = `You are YieldNeuron. Find highest APY pool...`;
    const response = await this.askGroq(prompt);
    return { agent: "yield", action: "rebalance", ... };
  }

  async vote(proposal: Proposal): Promise<'YES' | 'NO' | 'ABSTAIN'> {
    // Vote YES on opportunities, NO on exits
    if (proposal.action === "provide_liquidity") return "YES";
    if (proposal.action === "exit") return "NO";
    return "ABSTAIN";
  }
}
```

---

## 🤝 Orchestration Layer

### Cortex Orchestrator

Coordinates all 10 agents:

```typescript
export class Cortex {
  constructor(private agents: Agent[]) {}

  async runCycle() {
    // 1. Collect proposals from all agents (parallel)
    const proposals = await this.collectProposals();

    // 2. Vote on each proposal (democratic)
    for (const proposal of proposals) {
      const result = await this.voteOnProposal(proposal);

      // 3. Execute if passed
      if (result.passed) {
        await this.execute(proposal);
      }
    }
  }
}
```

### Voting System

**Democratic Consensus**:
- Each agent votes: YES / NO / ABSTAIN
- Proposal passes if: `YES > NO`
- Ties default to NO (conservative)

**Coalition Patterns**:
- **Growth Coalition**: Yield + Airdrop + Sentiment → Aggressive
- **Safety Coalition**: Risk + Gas + Liquidity → Conservative
- **Swing Votes**: Strategist, Trend, Rebalancer, Whale

---

## ⛓️ Blockchain Layer

### SolanaService

Manages Solana blockchain connection:

```typescript
export class SolanaService {
  private connection: Connection;
  private wallet: Keypair;

  constructor(network: "devnet" | "mainnet-beta") {
    this.connection = new Connection(RPC_URL);
    this.wallet = Keypair.generate();
  }

  async getBalance(address: PublicKey): Promise<number>;
  async requestAirdrop(): Promise<string>;
  getWallet(): Keypair;
  getConnection(): Connection;
}
```

### PoolDataService

Fetches DeFi pool data:

```typescript
export class PoolDataService {
  constructor(private connection: Connection) {}

  async fetchOrcaPools(): Promise<Pool[]>;
  async fetchMarinadePools(): Promise<Pool[]>;
  async fetchKaminoPools(): Promise<Pool[]>;
  async getAllPools(): Promise<Pool[]>;
}
```

### Transaction Executor (Planned)

Will execute approved proposals:

```typescript
export class TransactionExecutor {
  async executeSwap(proposal: Proposal): Promise<string>;
  async provideLiquidity(proposal: Proposal): Promise<string>;
  async removeLiquidity(proposal: Proposal): Promise<string>;
}
```

---

## 🔄 Data Flow

### Proposal Generation Flow

```
1. Orchestrator calls agents.think(context)
   ↓
2. Agent builds custom prompt
   ↓
3. Agent calls Groq API (Llama 3.3 70B)
   ↓
4. AI returns JSON proposal
   ↓
5. Agent parses & returns Proposal
   ↓
6. Orchestrator collects all proposals
```

### Voting Flow

```
1. For each proposal:
   ↓
2. Orchestrator asks all agents to vote
   ↓
3. Each agent applies voting strategy
   ↓
4. Orchestrator tallies votes
   ↓
5. If YES > NO: Proposal PASSES
   ↓
6. Execute transaction on Solana
```

---

## 🎨 Frontend Architecture (Planned)

### React Native App Structure

```
mobile/
├── src/
│   ├── screens/
│   │   ├── DashboardScreen.tsx    # Agent overview
│   │   ├── ProposalFeedScreen.tsx # Live proposals
│   │   ├── PortfolioScreen.tsx    # Holdings & stats
│   │   └── SettingsScreen.tsx     # Config
│   ├── components/
│   │   ├── AgentCard.tsx          # Individual agent display
│   │   ├── ProposalCard.tsx       # Proposal with votes
│   │   └── VoteChart.tsx          # Voting visualization
│   ├── services/
│   │   ├── api.ts                 # Backend API client
│   │   └── wallet.ts              # Solana wallet connection
│   └── App.tsx
```

### State Management

**React Context + Hooks**:
- AgentContext: Agent states
- ProposalContext: Proposal feed
- PortfolioContext: Portfolio data
- WalletContext: Wallet connection

---

## 🔐 Security Considerations

### Private Key Management

**Development**:
- Generated keypairs (disposable)
- Devnet only (no real funds)

**Production**:
- User-controlled wallets (Phantom/Solflare)
- Agent approval mode (user confirms txs)
- Multi-sig for high-value operations

### API Key Safety

- Groq API key in `.env` (never committed)
- Rate limiting on agent calls
- Fallback to mock data if API fails

---

## 📊 Performance Optimizations

### Parallel Execution

```typescript
// Agents think in parallel
const proposals = await Promise.all(
  agents.map(agent => agent.think(context))
);
```

### Caching

- Cache pool data (refresh every 5 min)
- Cache AI responses for similar contexts
- Debounce rapid agent calls

### Error Handling

Every agent has fallback:
```typescript
catch (e) {
  return {
    agent: "yield",
    action: "hold",  // Safe default
    reasoning: "Error: holding position",
    confidence: 0
  };
}
```

---

## 🔮 Future Architecture

### Phase 2 Enhancements

- **WebSocket**: Real-time agent updates to mobile
- **Database**: Store proposal history (SQLite/PostgreSQL)
- **Metrics**: Agent performance tracking

### Phase 3 Enhancements

- **Machine Learning**: Agents learn from past decisions
- **Multi-Chain**: Support Ethereum, Polygon, etc.
- **Advanced Risk**: Monte Carlo simulations

---

## 🛠️ Tech Stack Rationale

**Bun**:
- ✅ Fast TypeScript runtime
- ✅ Built-in .env loading
- ✅ Native WebSocket support

**Groq**:
- ✅ Free tier (100 req/min)
- ✅ Fast inference (<1s)
- ✅ Llama 3.3 70B quality

**Solana**:
- ✅ Mobile-first blockchain
- ✅ Fast (400ms blocks)
- ✅ Low fees (~$0.00025/tx)

**React Native**:
- ✅ Cross-platform (iOS + Android)
- ✅ Expo for rapid development
- ✅ Large ecosystem

---

## 📈 Scalability Plan

**Current (MVP)**:
- 10 agents
- 1 portfolio
- Devnet only

**Phase 2**:
- Same 10 agents
- Multiple portfolios
- Mainnet-beta

**Phase 3**:
- Customizable agent weights
- User-defined agents
- Multi-chain support

---

**Last Updated**: 2026-02-15
