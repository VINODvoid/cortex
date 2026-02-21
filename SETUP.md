# CORTEX Development Setup

Detailed instructions for configuring the development environment and executing the CORTEX platform.

## Prerequisites

### Required Software

- **Bun Runtime** (v1.0 or higher): Primary JavaScript/TypeScript runtime.
- **Git**: Version control system.
- **Visual Studio Code**: Recommended development environment.

### Required API Access

- **Groq API Key**: Required for AI agent inference. Obtain a key from the [Groq Console](https://console.groq.com/).

## Installation and Configuration

### 1. Repository Initialization

```bash
git clone https://github.com/your-organization/cortex.git
cd cortex
```

### 2. Backend Configuration

Navigate to the backend directory and install the necessary dependencies:

```bash
cd backend
bun install
```

### 3. Environment Variables

Create a `.env` file in the `backend/` directory based on the provided template:

```bash
cp .env.example .env
```

Configure the following variables within the `.env` file:

- `GROQ_API_KEY`: Your unique Groq API key.
- `SOLANA_RPC_URL`: (Optional) Custom Solana RPC endpoint; defaults to devnet.
- `SOLANA_NETWORK`: (Optional) Targeted network (e.g., devnet, mainnet-beta).

## Testing and Validation

CORTEX utilizes a comprehensive testing suite to ensure agent integrity and system stability.

### Individual Agent Validation

To test a specific agent neuron in isolation:

```bash
# Example: Testing the YieldNeuron
bun run src/test-playground/test-yield-agent.ts
```

### Swarm Orchestration Testing

To validate the coordination and voting logic of the complete ten-agent swarm:

```bash
bun run src/test-playground/test-orchestration.ts
```

### Blockchain Integration Testing

To verify the connection to the Solana network and protocol data retrieval:

```bash
bun run src/test-playground/test-blockchain-simple.ts
```

## Directory Structure

- `backend/src/agents/`: Implementations of the ten specialized neurons.
- `backend/src/blockchain/`: Services for Solana and DeFi protocol integration.
- `backend/src/test-playground/`: Comprehensive test suite for all system components.
- `mobile/`: React Native application source code.
- `docs/`: Supplemental technical documentation.

## Development Workflow

### Adding a New Agent Neuron

1. Define the agent logic in a new file within `backend/src/agents/`.
2. Ensure the new class extends the base `Agent` class.
3. Register the new agent role in the `AgentRole` type definition within `base.ts`.
4. Integrate the new agent into the orchestrator or test playground as required.

## Troubleshooting

### API Key Issues
If agent deliberation fails, verify that the `GROQ_API_KEY` is correctly defined in the `.env` file and that you have remaining quota on your Groq account.

### Network Latency
Solana devnet may occasionally experience congestion. If blockchain tests fail due to timeouts, verify the status of the devnet and consider using a dedicated RPC provider.

### Dependency Conflicts
If you encounter runtime errors related to modules, perform a clean installation:
```bash
rm -rf node_modules
bun install
```

## Security Best Practices

- **Credential Management**: Never commit `.env` files or hardcode API keys.
- **Wallet Safety**: Use only devnet keypairs for development. Production keys must be handled via secure provider integrations.

---

Last Updated: February 21, 2026
