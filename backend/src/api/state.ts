import type { ServerWebSocket } from "bun";
import type { Portfolio, AgentStatus, ActivityItem } from "./types";

export interface AppState {
  portfolio: Portfolio;
  agents: AgentStatus[];
  activity: ActivityItem[];
  cycleRunning: boolean;
  lastCycleAt: Date | null;
  wsClients: Set<ServerWebSocket<unknown>>;
}

const AGENT_DEFAULTS: { name: string; role: string }[] = [
  { name: "Strategist", role: "strategist" },
  { name: "Yield Scout", role: "yield" },
  { name: "Risk Guard", role: "risk" },
  { name: "Liquidity Agent", role: "liquidity" },
  { name: "Trend Engine", role: "trend" },
  { name: "Sentiment Pulse", role: "sentiment" },
  { name: "Whale Watch", role: "whale" },
  { name: "Rebalancer", role: "rebalance" },
  { name: "Gas Optimizer", role: "gas" },
  { name: "Airdrop Hunter", role: "airdrop" },
];

export function createInitialState(walletAddress: string): AppState {
  return {
    portfolio: { sol: 0, usdc: 0, totalUsd: 0, change24h: 0, walletAddress },
    agents: AGENT_DEFAULTS.map(({ name, role }) => ({
      name,
      role,
      status: "IDLE" as const,
      lastAction: "Waiting for first cycle...",
      confidence: 0,
    })),
    activity: [],
    cycleRunning: false,
    lastCycleAt: null,
    wsClients: new Set(),
  };
}

export function addActivity(state: AppState, item: ActivityItem): void {
  state.activity = [item, ...state.activity].slice(0, 50);
}

export function broadcast(state: AppState, msg: object): void {
  const text = JSON.stringify(msg);
  for (const ws of state.wsClients) {
    try {
      ws.send(text);
    } catch {}
  }
}
