# Autonomous Agent System Overview

The CORTEX platform is powered by a sophisticated multi-agent system designed for autonomous DeFi portfolio management. This system transition from traditional single-bot execution to a decentralized, collaborative intelligence model where multiple specialized AI agents interact to optimize outcomes.

## Core Philosophy

The fundamental philosophy of CORTEX is that a swarm of specialized intelligences is superior to a single, generalized model for complex financial decision-making. By assigning specific domains of responsibility to different agents, the system can analyze the same market data from multiple perspectives (e.g., risk-averse vs. growth-oriented), leading to more robust and balanced decisions.

## System Components

### 1. Specialized Neurons (Agents)
The swarm consists of ten independent agents, each referred to as a "Neuron." Each Neuron has a specific strategic focus and is governed by unique system prompts that define its behavior, priorities, and risk tolerance.

### 2. The Orchestrator
The Orchestrator acts as the "nervous system" of the platform. It handles the data flow, providing each agent with relevant market and portfolio information, and manages the lifecycle of the deliberation and execution cycles.

### 3. Consensus Mechanism
Governance within the swarm is democratic. No single agent has ultimate authority. Decisions are reached through a structured voting process where proposals must achieve a majority consensus before being executed on-chain.

## The Deliberation Cycle

The autonomous operation of the system follows a repeatable cycle:

1.  **Synchronization**: The Orchestrator fetches current pool data, token prices, and portfolio balances from the Solana blockchain.
2.  **Deliberation (Thinking)**: Each agent independently analyzes the data. Agents formulate strategies based on their specific specialization and the current context.
3.  **Proposal Generation**: Agents that identify an optimal move generate a structured proposal.
4.  **Voting**: Every agent in the swarm reviews the proposals and casts a vote (Affirmative, Negative, or Abstain) based on whether the proposal aligns with their own strategic objectives.
5.  **Tallying and Execution**: The Orchestrator tallies the votes. If a proposal passes, it is sent to the Transaction Executor for on-chain implementation.

## Benefits of the Multi-Agent Approach

-   **Redundancy**: The system is not dependent on a single AI response; multiple agents provide a safety net of checks and balances.
-   **Specialization**: Agents can focus deeply on specific metrics like gas costs or social sentiment without being overwhelmed by unrelated data.
-   **Emergent Intelligence**: Complex strategies often emerge from the interaction and debate between agents with conflicting priorities (e.g., the "Growth Coalition" vs. the "Safety Coalition").
-   **Transparency**: The entire decision-making process is traceable, as each agent's reasoning and vote are recorded.

---

Next document: [Agent Specializations](./agent-specializations.md)
