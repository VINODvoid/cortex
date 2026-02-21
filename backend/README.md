# CORTEX Backend

The backend engine for the CORTEX autonomous DeFi agent swarm.

## Overview

The CORTEX backend is built using the Bun runtime and TypeScript. It manages the lifecycle of ten specialized AI agents, handles multi-agent coordination via a democratic voting system, and interfaces with the Solana blockchain for data retrieval and transaction execution.

## Core Components

### Agent Swarm
Located in `src/agents/`, these are the implementations of the ten specialized neurons (Yield, Risk, Airdrop, etc.). Each agent inherits from a base class and utilizes the Groq API for advanced reasoning.

### Orchestrator
The `src/orchestrator.ts` file contains the logic for coordinating agent cycles. It manages the transition from individual thinking to collective voting and final execution.

### Blockchain Services
Located in `src/blockchain/`, these services provide the interface to the Solana network and specific DeFi protocols like Orca, Marinade, and Kamino.

## Installation

Ensure you have the [Bun](https://bun.sh) runtime installed.

```bash
# Install dependencies
bun install

# Configure environment variables
cp .env.example .env
# Edit .env with your GROQ_API_KEY and SOLANA_RPC_URL
```

## Development and Testing

The backend includes a comprehensive testing suite in `src/test-playground/`.

### Running Agent Tests

```bash
# Test a specific agent (e.g., YieldNeuron)
bun run src/test-playground/test-yield-agent.ts

# Test the full orchestration cycle
bun run src/test-playground/test-orchestration.ts
```

### Running Blockchain Tests

```bash
# Test Solana connection and pool data fetching
bun run src/test-playground/test-blockchain-simple.ts
```

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Inference**: Groq API (Llama 3.3 70B)
- **Blockchain SDK**: Solana Web3.js
- **DeFi Aggregator**: Jupiter SDK (Integration in progress)

## Architecture

For detailed information on the backend architecture, refer to the root `ARCHITECTURE.md` file.
