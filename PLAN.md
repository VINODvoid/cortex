# 📋 CORTEX - Project Roadmap

> Comprehensive plan for building autonomous AI agent swarm for DeFi

---

## 🎯 Project Vision

Build a mobile-first DeFi portfolio manager where 10 AI agents coordinate autonomously to optimize returns on Solana. Agents debate, vote democratically, and execute on-chain transactions without human intervention.

---

## 📅 Development Phases

### Phase 1: Agent Framework ✅ COMPLETE

**Goal**: Build 10 specialized AI agents with democratic voting

**Tasks**:
- [x] Create base Agent abstract class
- [x] Implement YieldNeuron (maximize returns)
- [x] Implement RiskNeuron (minimize risk)
- [x] Implement AirdropNeuron (farm airdrops)
- [x] Implement StrategistNeuron (strategic coordination)
- [x] Implement LiquidityNeuron (safety gatekeeper)
- [x] Implement TrendNeuron (market momentum)
- [x] Implement SentimentNeuron (community sentiment)
- [x] Implement RebalancerNeuron (portfolio optimization)
- [x] Implement WhaleWatcher (whale tracking)
- [x] Implement GasOptimizer (transaction cost optimization)
- [x] Build Orchestrator for multi-agent coordination
- [x] Implement democratic voting system
- [x] Create comprehensive test suite (11 test files)

**Outcome**: 10 agents coordinating with coalition patterns (Growth vs Safety)

---

### Phase 2: Blockchain Integration 🔨 IN PROGRESS

**Goal**: Connect agents to Solana and real DeFi data

**Tasks**:
- [x] Install Solana Web3.js + Jupiter SDK
- [x] Create SolanaService (wallet, balance, airdrop)
- [x] Create PoolDataService (mock DeFi pool data)
- [x] Test blockchain connection on devnet
- [ ] Fetch real-time pool data from Orca API
- [ ] Fetch real-time data from Marinade API
- [ ] Fetch real-time data from Kamino API
- [ ] Integrate Jupiter aggregator for swaps
- [ ] Create transaction executor
- [ ] Update Orchestrator to use real pool data
- [ ] Test end-to-end agent → blockchain flow

**Outcome**: Agents can analyze real data and execute Solana transactions

---

### Phase 3: Mobile UI 📱 PLANNED

**Goal**: Build React Native mobile app for user interaction

**Tasks**:
- [ ] Setup Expo + React Native project
- [ ] Create agent dashboard (show all 10 agents)
- [ ] Build proposal feed (real-time agent suggestions)
- [ ] Implement voting visualization
- [ ] Add portfolio stats & charts
- [ ] Create transaction history view
- [ ] Build settings screen
- [ ] Add push notifications for agent decisions
- [ ] Implement wallet connection (Phantom/Solflare)
- [ ] Connect mobile app to backend API

**Outcome**: Beautiful mobile UI showing agents in action

---

### Phase 4: Polish & Deploy 🚀 PLANNED

**Goal**: Production-ready hackathon submission

**Tasks**:
- [ ] Create demo video (3-5 minutes)
- [ ] Write comprehensive documentation
- [ ] Deploy backend to cloud (Railway/Vercel)
- [ ] Optimize performance
- [ ] Add error handling & fallbacks
- [ ] Create landing page
- [ ] Prepare hackathon presentation
- [ ] Submit to Solana Mobile Hackathon

**Outcome**: Complete hackathon submission ready to win!

---

## 🎬 Demo Flow (For Hackathon)

**Opening** (30 seconds):
- Show portfolio: 100 SOL idle
- "Watch 10 AI agents debate what to do..."

**Agent Coordination** (90 seconds):
- Show all 10 agents analyzing simultaneously
- Display proposals with reasoning
- Animate voting process
- Show coalition patterns (Growth vs Safety)
- Consensus reached: "Provide liquidity to Orca"

**Execution** (60 seconds):
- Show transaction being prepared
- Execute on Solana devnet
- Confirm transaction success
- Display updated portfolio

**Results** (30 seconds):
- Show portfolio earning yield
- "This happens 24/7 automatically"
- Call to action

---

## 🎯 Success Metrics

**Technical Achievements**:
- ✅ 10 functional AI agents
- ✅ Democratic voting system
- ✅ Multi-agent coordination
- 🔲 Live Solana transactions
- 🔲 Mobile UI

**Hackathon Goals**:
- 🎥 Compelling demo video
- 📱 Working mobile prototype
- 🏆 Top 10 finish
- 💰 Prize money

---

## 🚧 Known Challenges

**Challenge 1: Real-time Pool Data**
- Solution: Use cached data + periodic refresh
- Fallback: Mock data if APIs fail

**Challenge 2: Gas Optimization**
- Solution: GasOptimizer agent batches transactions
- Fallback: Manual approval mode

**Challenge 3: Mobile Wallet Integration**
- Solution: Use Phantom Mobile SDK
- Fallback: Web-based demo if mobile fails

**Challenge 4: AI Response Time**
- Solution: Parallel agent execution
- Fallback: Show "thinking" animation

---

## 📊 Tech Debt & Future Work

**Post-Hackathon Improvements**:
- [ ] Add agent learning/improvement over time
- [ ] Implement historical performance tracking
- [ ] Add more DeFi protocols (Raydium, Drift, Mango)
- [ ] Multi-chain support (start with Ethereum)
- [ ] Advanced risk modeling
- [ ] Social features (share strategies)
- [ ] Agent personality customization

---

## 🎯 Current Priority: Phase 2

**Next 3 Steps**:
1. Connect Orchestrator to use real blockchain pool data
2. Integrate Jupiter for swap execution
3. Test complete agent → transaction flow

**Target Completion**: 2-3 days

After Phase 2, move to Phase 3 (Mobile UI)

---

**Last Updated**: 2026-02-15
