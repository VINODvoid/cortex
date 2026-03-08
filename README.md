<div align="center">

<img src="./mobile/assets/icon.png" width="110" alt="CORTEX" />

<br/>

# CORTEX

<p>
  <samp>◈ &nbsp; A U T O N O M O U S &nbsp; A I &nbsp; A G E N T &nbsp; S W A R M &nbsp; &nbsp; ◈</samp>
</p>

<p><strong>DeFi Portfolio Optimization · Solana Blockchain · Democratic Consensus</strong></p>

[![Solana](https://img.shields.io/badge/Solana-9945FF?style=flat-square&logo=solana&logoColor=white)](https://solana.com)
[![Bun](https://img.shields.io/badge/Bun-000000?style=flat-square&logo=bun&logoColor=white)](https://bun.sh)
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Groq](https://img.shields.io/badge/Groq-F55036?style=flat-square&logoColor=white)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

<br/>

<sub>Built for the <strong>Solana Mobile Hackathon 2026</strong></sub>

</div>

---

## Links

| | |
|---|---|
| **Demo Video** | [Watch on Google Drive](https://drive.google.com/file/d/1Qq46P94UbAgOyF60eRXSsTn2MtZC6AHG/view?usp=sharing) |
| **APK Download** | [Download on Expo](https://expo.dev/accounts/kalki-kal/projects/cortex/builds/14ca8d01-3b30-4136-8785-f189859ea33b) |
| **Live Backend** | [cortex-production-e9c5.up.railway.app](https://cortex-production-e9c5.up.railway.app/health) |

---

## What is CORTEX?

CORTEX deploys a swarm of **10 specialized AI agents** that autonomously coordinate to optimize a DeFi portfolio on Solana. Each agent has a distinct strategic role — from yield hunting to risk management — and all decisions emerge from a **democratic voting consensus** rather than a single controller. No single agent can unilaterally execute a trade.

The system runs continuously: agents analyze markets, propose actions, vote on proposals, and execute approved transactions on-chain — all without human intervention, all visible in real time through the mobile app.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              Mobile App  (React Native / Expo)       │
│   Home · Agents · Activity · Portfolio · Settings   │
└──────────────────────┬──────────────────────────────┘
                       │  REST + WebSocket
┌──────────────────────▼──────────────────────────────┐
│              Backend API  (Bun + TypeScript)         │
│   Orchestrator · State · Vault · Real-time Events   │
└───────┬──────────────┬───────────────┬──────────────┘
        │              │               │
   ┌────▼─────┐  ┌─────▼──────┐  ┌────▼──────────┐
   │  Agents  │  │  Groq API  │  │ Solana Network │
   │  (×10)   │  │ Llama 3.3  │  │ Web3.js + RPC  │
   └──────────┘  └────────────┘  └───────────────┘
                                        │
                              ┌─────────▼────────┐
                              │  DeFi Protocols  │
                              │ Orca · Marinade  │
                              │ Kamino · Jupiter │
                              └──────────────────┘
```

---

## Agent Roster

| Agent | Role | Strategy |
|---|---|---|
| **YieldNeuron** | Yield Optimizer | Identifies high-APY pools; votes YES on 8%+ opportunities |
| **RiskNeuron** | Risk Guardian | Flags volatility and protocol risks; blocks low-TVL pools |
| **AirdropNeuron** | Opportunity Hunter | Targets emerging protocols with airdrop potential |
| **StrategistNeuron** | Meta-Coordinator | Aligns swarm direction; balances growth vs. safety |
| **LiquidityNeuron** | Liquidity Monitor | Ensures sufficient pool depth for execution stability |
| **TrendNeuron** | Momentum Analyst | Reads price trends and market momentum signals |
| **SentimentNeuron** | Sentiment Tracker | Evaluates social signals and protocol reputation |
| **RebalancerNeuron** | Portfolio Balancer | Realigns allocation as market conditions shift |
| **WhaleWatcher** | On-chain Intelligence | Detects significant wallet movements as early signals |
| **GasOptimizer** | Cost Minimizer | Batches and times transactions to minimize fees |

> **Coalition dynamics:** Agents naturally form coalitions — Growth (Yield, Airdrop, Trend) and Safety (Risk, Gas, Liquidity) — creating emergent checks and balances without explicit rules.

---

## Decision Cycle

```
1. Trigger      →  User or scheduler initiates a cycle
2. Analysis     →  All 10 agents analyze portfolio + market data via LLM
3. Proposals    →  Each agent outputs a structured JSON action proposal
4. Voting       →  All 10 agents vote YES / NO / ABSTAIN on each proposal
5. Consensus    →  Simple majority required for approval
6. Execution    →  Approved actions → Jupiter swaps → Solana transactions
7. Broadcast    →  Results streamed to mobile via WebSocket in real time
```

Agent timeouts: **30s** for think phase, **20s** for vote phase — failed agents are skipped, not blocking.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native, Expo, expo-router |
| Styling | expo-linear-gradient, expo-blur, lucide-react-native |
| Wallet | Solana Mobile Wallet Adapter |
| State | React Context (AppContext, WalletContext) |
| Backend | Bun, TypeScript |
| AI / LLM | Groq SDK — Llama 3.3 70B Versatile |
| Blockchain | @solana/web3.js, Solana testnet / mainnet-beta |
| DeFi | Jupiter Aggregator, Orca, Marinade, Kamino |
| Transport | REST (Bun.serve) + WebSocket |

---

## Project Structure

```
cortex/
├── backend/
│   └── src/
│       ├── agents/              # 10 agent implementations
│       ├── api/
│       │   └── server.ts        # REST + WebSocket server
│       ├── blockchain/
│       │   └── solana.ts        # SolanaService (transfer, vault, RPC)
│       ├── orchestrator.ts      # Coordination + consensus engine
│       ├── utils/               # LLM response parsing
│       └── test-playground/     # Isolated agent + integration tests
│
├── mobile/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── home.tsx         # Portfolio dashboard
│   │   │   ├── agents.tsx       # Agent status + confidence
│   │   │   ├── activity.tsx     # Proposal + vote feed
│   │   │   └── portfolio.tsx    # Holdings breakdown
│   │   ├── index.tsx            # Onboarding / entry
│   │   ├── _layout.tsx          # Root layout + providers
│   │   ├── user_profile.tsx     # Wallet profile modal
│   │   └── system_settings.tsx  # App settings modal
│   ├── components/
│   │   └── BrandHeader.tsx      # Shared header component
│   ├── context/
│   │   ├── AppContext.tsx        # Portfolio, agents, activity state
│   │   └── WalletContext.tsx     # Wallet connection + signing
│   └── services/
│       └── api.ts               # REST + WebSocket client
│
├── docs/                        # Technical documentation
├── ARCHITECTURE.md
├── PLAN.md
├── PROGRESS.md
└── SETUP.md
```

---

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- [Groq API key](https://console.groq.com) (free tier available)
- [Expo Go](https://expo.dev/go) on your mobile device, or an Android/iOS simulator

### 1. Clone

```bash
git clone https://github.com/VINODvoid/cortex.git
cd cortex
```

### 2. Backend

```bash
cd backend
bun install
cp .env.example .env
```

Edit `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key_here

# Optional — defaults to testnet if omitted
SOLANA_NETWORK=testnet
SOLANA_RPC_URL=https://api.testnet.solana.com

# Required — base58-encoded private key for the vault wallet
SOLANA_PRIVATE_KEY=your_wallet_private_key_here
```

Start the server:

```bash
bun run src/api/server.ts
# Listening on http://localhost:3001
```

### 3. Mobile

```bash
cd mobile
bun install
bunx expo start
```

Scan the QR code with Expo Go, or press `a` / `i` for Android / iOS simulator.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/portfolio` | Current portfolio state |
| `GET` | `/api/agents` | Agent statuses and confidence levels |
| `GET` | `/api/activity` | Proposal and vote history |
| `GET` | `/api/pools` | Available DeFi pools with APY data |
| `POST` | `/api/cycle` | Trigger a new agent evaluation cycle |
| `GET` | `/api/vault` | Vault wallet address and SOL balance |
| `GET` | `/api/blockhash` | Latest Solana blockhash |
| `POST` | `/api/vault/deposit` | Submit a signed deposit transaction |
| `POST` | `/api/vault/withdraw` | Withdraw SOL to a wallet address |
| `WS` | `/ws` | Real-time cycle events stream |

### WebSocket Events

| Event | Payload |
|---|---|
| `cycle_start` | Cycle metadata |
| `proposal` | Agent proposal item |
| `vote_complete` | Vote result + YES/NO/ABSTAIN counts |
| `execution_complete` | Transaction signature |
| `cycle_complete` | Cycle summary |

---

## Testing

All tests run in the backend:

```bash
cd backend

# Individual agent validation
bun run src/test-playground/test-yield-agent.ts
bun run src/test-playground/test-liquidity-agent.ts
bun run src/test-playground/test-risk-agent.ts

# Full swarm orchestration
bun run src/test-playground/test-orchestration.ts

# Blockchain integration
bun run src/test-playground/test-blockchain-simple.ts
```

---

## Status

| Component | Status |
|---|---|
| 10 agent implementations | Complete |
| Democratic consensus framework | Complete |
| Solana devnet / testnet integration | Complete |
| DeFi pool data (Orca, Marinade, Kamino) | Complete |
| Mobile dashboard UI | Complete |
| WebSocket real-time updates | Complete |
| Vault deposit / withdraw | Complete |
| Mobile wallet adapter | Complete |
| Jupiter aggregator swaps | In Progress |
| Live transaction execution | In Progress |
| Mainnet support | Planned |
| Portfolio analytics + history | Planned |
| Push notifications | Planned |

---

## Security

- Never commit `.env` files or private keys to version control
- Use only testnet/devnet keypairs during development
- Production vault keys must be managed via secure provider integrations

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design and component specifications
- [SETUP.md](./SETUP.md) — Detailed environment setup guide
- [PLAN.md](./PLAN.md) — Roadmap and milestones
- [PROGRESS.md](./PROGRESS.md) — Development log

---

## License

MIT — see [LICENSE](./LICENSE)

---

<div align="center">

Built for the **Solana Mobile Hackathon 2026**

</div>
