# CORTEX - Autonomous AI Agent Swarm for DeFi

Solana Mobile Hackathon 2026 - AI-powered DeFi portfolio optimization

## Overview

CORTEX is a decentralized platform that deploys ten specialized AI agents to coordinate autonomously for DeFi portfolio optimization on the Solana blockchain. These agents analyze market conditions, formulate strategies, participate in democratic voting, and execute on-chain transactions to maximize returns and mitigate risks.

## Agent System

The platform utilizes ten distinct agents, each with a specialized focus:

- **YieldNeuron**: Maximizes returns by identifying high-yield DeFi pools.
- **RiskNeuron**: Implements protective measures against market volatility and protocol risks.
- **AirdropNeuron**: Targets potential airdrop opportunities from emerging protocols.
- **StrategistNeuron**: Coordinates meta-level strategies across the agent swarm.
- **LiquidityNeuron**: Monitors pool liquidity to ensure trade execution stability.
- **TrendNeuron**: Analyzes market momentum and price trends.
- **SentimentNeuron**: Evaluates social sentiment and protocol reputation.
- **RebalancerNeuron**: Optimizes portfolio allocation based on market shifts.
- **WhaleWatcher**: Tracks significant on-chain movements for early market signals.
- **GasOptimizer**: Minimizes transaction costs through efficient batching and timing.

## Technical Stack

- **Mobile**: React Native with Expo
- **Backend**: Bun and TypeScript
- **Artificial Intelligence**: Groq (Llama 3.3 70B Versatile)
- **Blockchain**: Solana Web3.js (Devnet)
- **DeFi Integrations**: Orca, Marinade, Kamino (Jupiter integration in progress)

## Project Structure

```
cortex/
├── backend/
│   ├── src/
│   │   ├── agents/          # AI agent implementations
│   │   ├── blockchain/      # Solana and protocol service layers
│   │   ├── orchestrator.ts  # Coordination and consensus engine
│   │   └── test-playground/ # Comprehensive testing environment
│   └── package.json
├── mobile/                  # React Native mobile application
├── docs/                    # Technical documentation
└── README.md
```

## Operational Status

### Completed
- Implementation of ten specialized AI agents with unique strategic models.
- Democratic voting and consensus mechanism with coalition logic.
- Multi-agent coordination framework.
- Solana devnet integration.
- DeFi pool data integration for Orca, Marinade, and Kamino.
- Comprehensive test suite comprising eleven specialized test files.

### In Progress
- Live blockchain data synchronization for agents.
- Jupiter aggregator integration for optimized swap execution.
- Automated transaction execution engine.
- Mobile user interface development.

### Planned
- Real-time pool data via professional APIs.
- Portfolio performance analytics and historical tracking.
- Real-time push notifications for agent-driven decisions.
- Submission documentation and demonstration for the hackathon.

## Testing and Validation

Tests are executed within the backend environment:

```bash
cd backend

# Execute individual agent validation
bun run src/test-playground/test-yield-agent.ts
bun run src/test-playground/test-liquidity-agent.ts

# Execute multi-agent coordination tests
bun run src/test-playground/test-orchestration.ts

# Execute blockchain service integration tests
bun run src/test-playground/test-blockchain-simple.ts
```

## System Logic

1. **Analysis**: Each agent independently analyzes portfolio and market data using LLM-based reasoning.
2. **Proposal Generation**: Agents generate specific actionable proposals (e.g., rebalancing, liquidity provision).
3. **Consensus**: All ten agents vote on each proposal (Accept, Reject, or Abstain).
4. **Validation**: A proposal is approved only if it receives a simple majority of affirmative votes.
5. **Execution**: Approved actions are executed on-chain via the Jupiter aggregator.

## Key Features

- **Autonomous Multi-Agent Architecture**: Uses independent AI instances rather than simple personas.
- **Democratic Governance**: Decisions emerge from consensus voting, preventing single-point failure in strategy.
- **Coalition Dynamics**: Natural emergence of Growth (Yield, Airdrop) and Safety (Risk, Gas) coalitions.
- **Continuous Operation**: Designed for 24/7 autonomous market monitoring and execution.
- **Mobile-First Design**: Optimized for the Solana Mobile environment.

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and technical specifications.
- [PLAN.md](./PLAN.md) - Project roadmap and development milestones.
- [PROGRESS.md](./PROGRESS.md) - Real-time development status.
- [SETUP.md](./SETUP.md) - Environment configuration and installation guide.

## License

This project is licensed under the MIT License.

---

Built for the Solana Mobile Hackathon 2026.
