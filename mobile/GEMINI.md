# Gemini Project Context: Cortex Mobile

This document provides a summary of the Cortex mobile application for reference.

## Project Overview

The Cortex mobile application is a sophisticated financial tool, likely for cryptocurrency trading and portfolio management. It features a futuristic, dark-themed interface with a strong emphasis on data visualization and real-time information. The app is built around the concept of "autonomous agents" that analyze market data, vote on proposals, and execute transactions.

The user is first presented with an animated onboarding sequence that introduces the core concepts of the application: Intelligence (Cortex), Coordination (Swarm), Velocity, and Deployment.

The main dashboard provides a comprehensive overview of the user's portfolio, including its value, performance, and recent activity. It also displays information about the "agent swarm," their current status, and any active votes.

## Technologies

- **Framework**: React Native with Expo
- **Routing**: Expo Router
- **Language**: TypeScript
- **UI & Styling**:
  - Custom design system (see "Theme & Styling" section)
  - `expo-linear-gradient` for gradients
  - `expo-blur` for blur effects
  - `lucide-react-native` and `@expo/vector-icons` for icons
  - `react-native-reanimated` for animations
- **Haptics**: `expo-haptics`

## Project Structure

- **`app/`**: Contains the application's screens and routing configuration.
  - **`_layout.tsx`**: The root layout of the app.
  - **`index.tsx`**: The animated onboarding screen.
  - **`(tabs)/`**: The main tab-based navigation.
    - **`_layout.tsx`**: The layout for the tab bar.
    - **`home.tsx`**: The main dashboard screen.
    - **`agents.tsx`**: Likely a screen to manage and monitor the agents.
    - **`portfolio.tsx`**: A detailed view of the user's portfolio.
    - **`activity.tsx`**: A log of recent transactions and agent activity.
- **`assets/`**: Contains static assets like icons and splash screens.
- **`constants/`**:
  - **`Colors.ts`**: A basic color palette.
  - **`theme.ts`**: The comprehensive design system and mock data for the app.
- **`package.json`**: Lists the project's dependencies and scripts.
- **`app.json`**: The Expo configuration file.
- **`tsconfig.json`**: The TypeScript configuration file.

## Data Schema

The `constants/theme.ts` file defines the data structures for the app's core concepts.

### Agent

```typescript
type AgentStatus = "ACTIVE" | "IDLE" | "VOTING" | "THINKING";
type VoteChoice  = "YES" | "NO" | "ABSTAIN";

type AgentData = {
  id:      string;
  name:    string;
  label:   string;
  role:    string;
  status:  AgentStatus;
  vote?:   VoteChoice;
  metric?: string;
  task:    string;
};
```

### Thought

```typescript
type ThoughtEntry = {
  id:      string;
  agentId: string;
  text:    string;
  elapsed: number;
};
```

### Vote

```typescript
const VOTE_COUNTS = { yes: 7, no: 2, abstain: 1, total: 10 };
```

## Theme & Styling

The application uses a custom design system defined in `constants/theme.ts`. This file includes:

- **Color Palette**: A detailed color system with names like `VOID`, `GLASS`, `INK`, and `SPECTRUM`.
- **Typography**: A typography scale with defined font sizes, weights, and letter spacing.
- **Spacing**: A spacing scale based on an 8pt grid.
- **Radius**: A scale for border radii.
- **Gradients and Fills**: Pre-defined gradients for various UI elements.

The styling is applied using StyleSheet and inline styles, with a heavy emphasis on creating a dark, futuristic "void" interface.
