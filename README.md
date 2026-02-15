# 🧠 CORTEX - Autonomous AI Agent Swarm for DeFi

> Solana Mobile Hackathon 2026 - AI-powered DeFi portfolio optimization

## 🎯 What is CORTEX?

CORTEX deploys 10 specialized AI agents that coordinate autonomously to optimize your DeFi portfolio on Solana. Agents analyze markets, debate strategies, vote democratically, and execute on-chain transactions - all while you sleep.

## 🤖 The 10 Agents

- **YieldNeuron** - Maximizes DeFi returns by finding highest APY pools
- **RiskNeuron** - Protects against losses and dangerous pools
- **AirdropNeuron** - Farms token airdrops from new protocols
- **StrategistNeuron** - Provides meta-level strategic coordination
- **LiquidityNeuron** - Safety gatekeeper, prevents illiquid pool trades
- **TrendNeuron** - Detects bullish/bearish market momentum
- **SentimentNeuron** - Analyzes community sentiment and protocol reputation
- **RebalancerNeuron** - Maintains optimal portfolio allocation
- **WhaleWatcher** - Tracks large wallet movements for early signals
- **GasOptimizer** - Minimizes transaction costs and batch operations

## 🏗️ Tech Stack

- **Mobile**: React Native + Expo (Coming Soon)
- **Backend**: Bun + TypeScript
- **AI**: Groq (Llama 3.3 70B Versatile)
- **Blockchain**: Solana Web3.js (Devnet)
- **DeFi**: Orca, Marinade, Kamino (Jupiter integration in progress)

## 📁 Project Structure

```
cortex/
├── backend/
│   ├── src/
│   │   ├── agents/          # 10 AI agent implementations
│   │   ├── blockchain/      # Solana + pool data services
│   │   ├── orchestrator.ts  # Multi-agent coordination
│   │   └── test-playground/ # Agent & blockchain tests
│   └── package.json
├── mobile/                  # React Native app (planned)
├── docs/                    # Project documentation
└── README.md
```

## 🚀 Current Status

### ✅ Completed
- [x] 10 specialized AI agents with unique strategies
- [x] Democratic voting system with coalition patterns
- [x] Multi-agent coordination and consensus mechanism
- [x] Solana devnet integration
- [x] Real DeFi pool data (5 pools: Orca, Marinade, Kamino)
- [x] Comprehensive test suite (11 test files)

### 🔨 In Progress
- [ ] Connect agents to real blockchain data
- [ ] Jupiter aggregator integration for swaps
- [ ] Transaction execution engine
- [ ] Mobile UI (React Native + Expo)

### 📋 Planned
- [ ] Real-time pool data via API
- [ ] Portfolio tracking and history
- [ ] Push notifications for agent decisions
- [ ] Demo video for hackathon submission

## 🧪 Running Tests

```bash
cd backend

# Test individual agents
bun run src/test-playground/test-yield-agent.ts
bun run src/test-playground/test-liquidity-agent.ts

# Test 10-agent coordination
bun run src/test-playground/test-orchestration.ts

# Test blockchain integration
bun run src/test-playground/test-blockchain-simple.ts
```

## 🎬 How It Works

1. **Agents Think Independently**: Each agent analyzes the same portfolio and market data using AI
2. **Proposals Generated**: Agents suggest actions (rebalance, provide liquidity, exit, etc.)
3. **Democratic Voting**: All 10 agents vote on each proposal (YES/NO/ABSTAIN)
4. **Consensus Reached**: Majority wins - proposals with more YES than NO votes pass
5. **Execution**: Approved proposals execute on-chain via Jupiter aggregator

## 🔥 Key Features

- **True Multi-Agent AI**: Not a single AI with personas - 10 independent agents with real debate
- **Democratic Consensus**: No dictator agent - decisions emerge from voting
- **Coalition Dynamics**: Growth coalition (Yield + Airdrop) vs Safety coalition (Risk + Gas)
- **Autonomous Operation**: Runs 24/7 without human intervention
- **Mobile-First**: Built for Solana mobile hackathon

## 📊 Example Agent Coordination

```
Portfolio: 100 SOL (idle)
Pools: Orca (12.5% APY), Marinade (6.8% APY), Kamino (8.2% APY)

YieldNeuron:     "Provide liquidity to Orca (highest APY!)"
RiskNeuron:      "Hold (too risky to enter now)"
AirdropNeuron:   "Provide liquidity to Orca (airdrop potential!)"
StrategistNeuron: "Diversify across multiple pools"
GasOptimizer:    "Hold (save on gas fees)"

Voting: 7 YES, 3 NO
Result: ✅ PASSED - Portfolio will provide liquidity to Orca
```

## 🏆 Hackathon Goals

**Core Demo:**
- Show 10 agents coordinating autonomously
- Execute real Solana devnet transactions
- Mobile UI displaying agent debates in real-time

**Stretch Goals:**
- Historical performance tracking
- Machine learning for agent improvement
- Multi-chain support (start with Solana)

## 📄 Documentation

- [PLAN.md](./PLAN.md) - Project roadmap and milestones
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and architecture
- [PROGRESS.md](./PROGRESS.md) - Current status and next steps
- [SETUP.md](./SETUP.md) - Development setup instructions

## 📄 License

MIT

---

**Built with ❤️ for Solana Mobile Hackathon 2026**
