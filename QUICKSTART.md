# 🧠 CORTEX - Quick Start

**Stack:** Expo + React Native + Bun

---

## 🚀 Setup

### 1. Backend (Bun)
```bash
cd /home/kalki/Documents/projects/cortex
mkdir backend && cd backend
bun init -y
bun add hono @anthropic-ai/sdk @solana/web3.js dotenv
```

Create `.env`:
```
ANTHROPIC_API_KEY=your_key_here
SOLANA_RPC_URL=https://api.devnet.solana.com
```

### 2. Mobile (Expo)
```bash
cd /home/kalki/Documents/projects/cortex
bunx create-expo-app mobile --template blank-typescript
cd mobile
bun install @solana-mobile/mobile-wallet-adapter-protocol @solana/web3.js
```

---

## 📁 Structure
```
cortex/
├── backend/          # Bun server + AI agents
├── mobile/           # Expo app
└── docs/             # Strategy docs (reference only)
```

---

## 🎯 Build Order

**Week 1:** Backend agents (Yield, Risk, Airdrop neurons)
**Week 2:** Solana integration + agent coordination
**Week 3:** Mobile UI + demo

---

## 🆘 When Stuck, Ask Me:
- "How do I structure the agent class?"
- "How should agents vote?"
- "How do I connect Expo to backend?"

**I'm your guide. You build. Let's go!** 🚀
