# CORTEX Mobile

The mobile interface for the CORTEX autonomous DeFi agent swarm.

## Overview

CORTEX Mobile is a React Native application built with Expo, designed to provide users with real-time visibility and interaction with the CORTEX AI agent swarm. The application allows users to monitor agent deliberations, view proposed DeFi strategies, and track their portfolio performance on the Solana blockchain.

## Features

- **Agent Dashboard**: Real-time status and activity monitoring for all ten specialized agents.
- **Proposal Feed**: A live stream of agent-generated proposals and the resulting democratic voting process.
- **Portfolio Analytics**: Detailed view of assets, yield performance, and allocation across Solana DeFi protocols.
- **Onboarding**: An interactive introduction to the CORTEX ecosystem and its core concepts.

## Technical Stack

- **Framework**: React Native with Expo
- **Routing**: Expo Router
- **Language**: TypeScript
- **Animations**: React Native Reanimated
- **Styling**: Custom design system with a focus on high-fidelity visual feedback.
- **Icons**: Lucide React Native and Expo Vector Icons.

## Installation

Ensure you have the [Bun](https://bun.sh) runtime or [Node.js](https://nodejs.org) installed.

```bash
cd mobile

# Install dependencies
bun install # or npm install

# Start the development server
bun start # or npx expo start
```

## Project Structure

```
mobile/
├── app/               # Application screens and routing logic
│   ├── (tabs)/        # Main tab-based navigation
│   └── index.tsx      # Entry point and onboarding
├── assets/            # Static assets and icons
├── constants/         # Design system, themes, and configuration
└── DESIGN_SPEC.md     # Detailed UI/UX design specifications
```

## Design Principles

CORTEX Mobile utilizes a sophisticated "Void" aesthetic, characterized by dark themes, subtle gradients, and high-contrast typography to reflect its futuristic AI-driven nature. For more details, see the `DESIGN_SPEC.md` and `constants/theme.ts` files.

## Development

This project is part of the CORTEX monorepo. It communicates with the CORTEX backend to receive real-time updates from the agent swarm.
