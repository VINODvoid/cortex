# 🚀 Start Building CORTEX - First Steps

> **Your guide for Day 1-3 of building**

---

## ✅ Day 1: Project Setup (TODAY)

### Step 1: Backend Setup with Bun
```bash
cd /home/kalki/Documents/projects/cortex
mkdir backend
cd backend
bun init -y
```

**Install core dependencies:**
```bash
bun add hono @anthropic-ai/sdk @solana/web3.js dotenv
bun add -d typescript @types/node @types/bun
```

**Create basic structure:**
```bash
mkdir -p src/{agents,api,blockchain,utils}
touch src/index.ts
touch .env
```

### Step 2: Create `.env` file
```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=your_base58_private_key
PORT=3000
```

### Step 3: Test Bun Server
Create `src/index.ts`:
```typescript
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.json({ message: 'CORTEX is alive 🧠' }))

export default {
  port: 3000,
  fetch: app.fetch,
}
```

**Run it:**
```bash
bun run src/index.ts
```

Visit: http://localhost:3000 (should see "CORTEX is alive 🧠")

---

## ✅ Day 2: First Agent

### Create Base Agent Class
`src/agents/base.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk'

export type AgentRole = 'yield' | 'risk' | 'airdrop' | 'strategist'

export interface Proposal {
  agent: AgentRole
  action: string
  reasoning: string
  confidence: number
}

export abstract class Agent {
  protected claude: Anthropic

  constructor(
    public role: AgentRole,
    protected apiKey: string
  ) {
    this.claude = new Anthropic({ apiKey })
  }

  abstract think(context: any): Promise<Proposal>

  abstract vote(proposal: Proposal): Promise<'YES' | 'NO' | 'ABSTAIN'>
}
```

### Create YieldNeuron
`src/agents/yield.ts`:
```typescript
import { Agent, Proposal } from './base'

export class YieldNeuron extends Agent {
  constructor(apiKey: string) {
    super('yield', apiKey)
  }

  async think(context: any): Promise<Proposal> {
    const response = await this.claude.messages.create({
      model: 'claude-sonnet-4.5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are YieldNeuron. Your job: maximize DeFi returns.

Current portfolio: ${JSON.stringify(context.portfolio)}

Available pools:
${context.pools.map((p: any) => `- ${p.name}: ${p.apy}% APY`).join('\n')}

Should you rebalance? Respond with JSON:
{
  "action": "rebalance" | "hold",
  "target": "pool name or null",
  "reasoning": "explain why",
  "confidence": 0-100
}`
      }]
    })

    const result = JSON.parse(response.content[0].text)

    return {
      agent: 'yield',
      action: result.action,
      reasoning: result.reasoning,
      confidence: result.confidence
    }
  }

  async vote(proposal: Proposal): Promise<'YES' | 'NO' | 'ABSTAIN'> {
    // For now, YieldNeuron abstains on others' proposals
    return 'ABSTAIN'
  }
}
```

### Test Your First Agent
`src/test-agent.ts`:
```typescript
import { YieldNeuron } from './agents/yield'

async function testYieldNeuron() {
  const agent = new YieldNeuron(process.env.ANTHROPIC_API_KEY!)

  const context = {
    portfolio: { sol: 100, usdc: 0 },
    pools: [
      { name: 'Orca', apy: 5.2 },
      { name: 'Marinade', apy: 6.1 },
      { name: 'Kamino', apy: 5.8 }
    ]
  }

  console.log('🧠 YieldNeuron thinking...')
  const proposal = await agent.think(context)
  console.log('Proposal:', proposal)
}

testYieldNeuron()
```

**Run it:**
```bash
bun run src/test-agent.ts
```

You should see Claude reasoning about which pool to use! 🎉

---

## ✅ Day 3: Agent Orchestration

### Create Orchestrator
`src/orchestrator.ts`:
```typescript
import { Agent, Proposal } from './agents/base'

export class Cortex {
  constructor(private agents: Agent[]) {}

  async runCycle() {
    console.log('🧠 CORTEX: Starting agent cycle...')

    // 1. Collect proposals from all agents
    const proposals = await Promise.all(
      this.agents.map(agent => agent.think({}))
    )

    console.log(`📋 Collected ${proposals.length} proposals`)
    proposals.forEach(p => {
      console.log(`  - ${p.agent}: ${p.action} (confidence: ${p.confidence}%)`)
    })

    // 2. Vote on each proposal
    for (const proposal of proposals) {
      const votes = await this.vote(proposal)
      console.log(`🗳️  Voting on ${proposal.agent}'s proposal:`, votes)

      if (votes.yes > votes.no) {
        console.log(`✅ Proposal PASSED - executing...`)
        // TODO: Execute on-chain
      } else {
        console.log(`❌ Proposal REJECTED`)
      }
    }
  }

  private async vote(proposal: Proposal) {
    const votes = await Promise.all(
      this.agents.map(agent => agent.vote(proposal))
    )

    return {
      yes: votes.filter(v => v === 'YES').length,
      no: votes.filter(v => v === 'NO').length,
      abstain: votes.filter(v => v === 'ABSTAIN').length
    }
  }
}
```

### Test Orchestrator
`src/test-cortex.ts`:
```typescript
import { Cortex } from './orchestrator'
import { YieldNeuron } from './agents/yield'

async function testCortex() {
  const agents = [
    new YieldNeuron(process.env.ANTHROPIC_API_KEY!)
    // Add more agents as you build them
  ]

  const cortex = new Cortex(agents)
  await cortex.runCycle()
}

testCortex()
```

**Run it:**
```bash
bun run src/test-cortex.ts
```

---

## 📋 Your TODO for This Week

- [x] Setup Bun project ✅
- [x] Create base Agent class ✅
- [x] Build YieldNeuron ✅
- [x] Build orchestrator ✅
- [ ] Build RiskNeuron (copy YieldNeuron pattern)
- [ ] Build AirdropNeuron
- [ ] Build StrategistNeuron (coordinator)
- [ ] Test all agents working together

---

## 🆘 When You Get Stuck

**Ask me for help with:**
- "How do I structure the RiskNeuron?"
- "How should agents communicate with each other?"
- "How do I integrate Solana blockchain?"
- "What's the best way to handle agent memory?"
- "How do I make agents vote on proposals?"

**I'll guide you through it!** 🧠

---

## 🎯 Next Steps

Once you have 3 agents working:
1. Add Solana integration (Jupiter for swaps)
2. Add database (Supabase for agent memory)
3. Build mobile app to visualize agents
4. Add more neurons (Tax, Compliance, Social)

**You're the builder. I'm your guide. Let's go!** 🚀
