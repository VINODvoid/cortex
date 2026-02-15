# 🛠️ CORTEX - Development Setup

> Complete guide to setting up your development environment

---

## 📋 Prerequisites

### Required Software

- **Bun** (v1.0+) - JavaScript runtime
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

- **Git** - Version control
  ```bash
  sudo apt install git  # Linux
  brew install git      # macOS
  ```

- **Code Editor** - VS Code recommended
  ```bash
  # Install from https://code.visualstudio.com/
  ```

### Required Accounts

- **Groq API Key** - Free tier (100 req/min)
  - Sign up: https://console.groq.com/
  - Get API key from dashboard

- **GitHub Account** - For version control
  - Sign up: https://github.com/

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/cortex.git
cd cortex
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
bun install

# Create .env file
cp .env.example .env

# Edit .env and add your Groq API key
nano .env  # or use your preferred editor
```

### 3. Configure Environment Variables

Create `backend/.env`:

```env
# Groq API Key (Required)
GROQ_API_KEY=gsk_your_api_key_here

# Solana RPC (Optional - defaults to devnet)
SOLANA_RPC_URL=https://api.devnet.solana.com

# Network (Optional)
SOLANA_NETWORK=devnet
```

### 4. Run Tests

```bash
# Test individual agents
bun run src/test-playground/test-yield-agent.ts
bun run src/test-playground/test-risk-agent.ts

# Test 10-agent coordination
bun run src/test-playground/test-orchestration.ts

# Test blockchain integration
bun run src/test-playground/test-blockchain-simple.ts
```

### 5. Verify Setup

If all tests pass, you're ready to develop! ✅

---

## 📁 Project Structure

```
cortex/
├── backend/
│   ├── src/
│   │   ├── agents/               # 10 AI agent implementations
│   │   │   ├── base.ts           # Abstract Agent class
│   │   │   ├── yield.ts          # YieldNeuron
│   │   │   ├── risk.ts           # RiskNeuron
│   │   │   ├── airdrop.ts        # AirdropNeuron
│   │   │   ├── strategist.ts     # StrategistNeuron
│   │   │   ├── liquidity.ts      # LiquidityNeuron
│   │   │   ├── trend.ts          # TrendNeuron
│   │   │   ├── sentiment.ts      # SentimentNeuron
│   │   │   ├── rebalancer.ts     # RebalancerNeuron
│   │   │   ├── whale.ts          # WhaleWatcher
│   │   │   └── gas.ts            # GasOptimizer
│   │   ├── blockchain/           # Solana integration
│   │   │   ├── solana.ts         # SolanaService
│   │   │   └── pools.ts          # PoolDataService
│   │   ├── orchestrator.ts       # Multi-agent coordinator
│   │   └── test-playground/      # All test files
│   ├── .env                      # Environment variables (create this!)
│   ├── package.json              # Dependencies
│   └── bun.lock                  # Lock file
├── mobile/                       # React Native app (coming soon)
├── docs/                         # Additional documentation
├── README.md                     # Project overview
├── PLAN.md                       # Project roadmap
├── ARCHITECTURE.md               # System design
├── PROGRESS.md                   # Current status
└── SETUP.md                      # This file!
```

---

## 🧪 Testing Guide

### Individual Agent Tests

Test a single agent in isolation:

```bash
cd backend

# Test YieldNeuron
bun run src/test-playground/test-yield-agent.ts

# Test LiquidityNeuron
bun run src/test-playground/test-liquidity-agent.ts

# Test any agent
bun run src/test-playground/test-{agent}-agent.ts
```

**Expected Output**:
```
🧠 Testing YieldNeuron Agent...

📊 Current Portfolio:
   SOL: 100
   USDC: 0

🏦 Available Pools:
   Orca: 5.2% APY (TVL: $50,000,000)
   Marinade: 6.1% APY (TVL: $80,000,000)
   Kamino: 5.8% APY (TVL: $30,000,000)

⏳ Agent is thinking...

💡 Agent Proposal:
   Action: rebalance
   Target: Marinade
   Confidence: 100%
   Reasoning: Marinade has highest APY at 6.1%...
```

### Multi-Agent Orchestration Test

Test all 10 agents coordinating:

```bash
bun run src/test-playground/test-orchestration.ts
```

**Expected Output**:
```
🧠 CORTEX - 10-Agent Autonomous Swarm

🤖 Initialized 10 agents:
   📈 YieldNeuron - Maximize returns
   🛡️  RiskNeuron - Minimize risk
   ...

Collected 10 proposals:

📌 YIELD: rebalance
   Target: Marinade
   Reasoning: Highest APY...

🗳️  VOTING PHASE

Voting on yield's proposal (rebalance)...
   YES: 7, NO: 3, ABSTAIN: 0
Result: ✅ PASSED
```

### Blockchain Integration Test

Test Solana connection and pool fetching:

```bash
bun run src/test-playground/test-blockchain-simple.ts
```

**Expected Output**:
```
🔗 Testing Solana Blockchain Integration

✅ Connected to Solana devnet
📍 Wallet Address: 7iLz...asxa

🏊 Found 5 DeFi pools:

   📊 Orca SOL/USDC
      APY: 12.5%
      TVL: $87,000,000
   ...

🎉 Blockchain integration test complete!
```

---

## 🔧 Development Workflow

### Creating a New Agent

1. Create agent file:
```bash
touch backend/src/agents/myneuron.ts
```

2. Implement agent class:
```typescript
import { Agent, type Proposal, type SystemContext } from "./base";

export class MyNeuron extends Agent {
  constructor(apiKey: string) {
    super("my", apiKey);  // Add "my" to AgentRole in base.ts
  }

  async think(context: SystemContext): Promise<Proposal> {
    const prompt = `You are MyNeuron, a specialized agent...`;
    const response = await this.askGroq(prompt);
    // Parse and return proposal
  }

  async vote(proposal: Proposal): Promise<'YES' | 'NO' | 'ABSTAIN'> {
    // Implement voting strategy
    return "ABSTAIN";
  }

  private extractJSON(response: string): string {
    // Copy from existing agent
  }
}
```

3. Add to AgentRole type in `base.ts`:
```typescript
export type AgentRole =
  | "yield"
  | "risk"
  | "my"  // Add your agent
  | ...
```

4. Create test file:
```bash
cp backend/src/test-playground/test-yield-agent.ts \
   backend/src/test-playground/test-my-agent.ts
```

5. Update orchestrator:
```typescript
// In test-orchestration.ts
import { MyNeuron } from "../agents/myneuron";

const agents = [
  new YieldNeuron(apiKey),
  new MyNeuron(apiKey),  // Add your agent
  // ...
];
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue 1: "GROQ_API_KEY not found"**

```bash
# Check .env file exists
ls backend/.env

# Verify GROQ_API_KEY is set
cat backend/.env | grep GROQ_API_KEY

# Make sure you're running from backend/ directory
cd backend
bun run src/test-playground/test-yield-agent.ts
```

**Issue 2: "JSON Parse error"**

This happens when AI returns markdown-wrapped JSON. Make sure you have `extractJSON()` helper:

```typescript
private extractJSON(response: string): string {
  let cleaned = response.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, "");
    cleaned = cleaned.replace(/\n?```$/, "");
  }
  return cleaned.trim();
}
```

**Issue 3: "airdrop failed: Internal error"**

Solana devnet faucet is rate-limited. Use the simplified test:

```bash
bun run src/test-playground/test-blockchain-simple.ts
```

Or request airdrop from web faucet:
- https://faucet.solana.com/

**Issue 4: Import errors**

```bash
# Reinstall dependencies
cd backend
rm -rf node_modules
bun install
```

---

## 🔐 Security Best Practices

### Environment Variables

**Never commit .env files!**

Already in `.gitignore`:
```
.env
.env.local
.env.*.local
```

### API Keys

- Keep Groq API key private
- Rotate if accidentally exposed
- Use separate keys for dev/prod

### Wallet Private Keys

- Generated wallets are temporary (devnet only)
- Never use mainnet keys in code
- For production: user-controlled wallets only

---

## 📚 Useful Commands

### Development

```bash
# Run any TypeScript file
bun run src/path/to/file.ts

# Watch mode (auto-reload)
bun --watch run src/file.ts

# TypeScript type checking
bun run tsc --noEmit
```

### Git

```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "feat: add new feature"

# Push
git push origin main
```

### Debugging

```bash
# Run with console output
bun run src/test-playground/test-orchestration.ts

# Check Solana transaction
# Visit: https://explorer.solana.com/?cluster=devnet
# Paste transaction signature
```

---

## 🎯 Next Steps

After setup:

1. **Explore the Code**
   - Read through agent implementations
   - Understand the voting system
   - Study the orchestrator

2. **Run All Tests**
   - Verify everything works
   - Understand expected outputs
   - Check coalition patterns

3. **Make Your First Change**
   - Tweak an agent's voting logic
   - Adjust confidence thresholds
   - Modify prompts

4. **Read the Documentation**
   - [PLAN.md](./PLAN.md) - See the roadmap
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the design
   - [PROGRESS.md](./PROGRESS.md) - Check current status

---

## 🆘 Getting Help

**Documentation**:
- This file (SETUP.md)
- [README.md](./README.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)

**Code Comments**:
- Each agent has detailed comments
- Check existing implementations

**Ask the Team**:
- Open GitHub issue
- Check existing issues first

---

## ✅ Setup Checklist

Before you start developing:

- [ ] Bun installed (`bun --version`)
- [ ] Repository cloned
- [ ] Dependencies installed (`bun install`)
- [ ] .env file created with GROQ_API_KEY
- [ ] All tests passing
- [ ] Documentation read
- [ ] First commit made

If all checked, you're ready! 🚀

---

**Last Updated**: 2026-02-15
