import type { ServerWebSocket } from "bun";
import type { Portfolio, AgentStatus, ActivityItem } from "./types";

export interface PortfolioPoint {
  t: number; // unix ms
  v: number; // totalUsd
}

export interface AppState {
  portfolio: Portfolio;
  agents: AgentStatus[];
  activity: ActivityItem[];
  portfolioHistory: PortfolioPoint[];
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

function seedDemoHistory(): PortfolioPoint[] {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const points: PortfolioPoint[] = [];
  // 30 days of history, one point every 4 hours
  const totalPoints = 30 * 6;
  let v = 480; // starting value ~$480
  for (let i = totalPoints; i >= 0; i--) {
    const t = now - i * (DAY / 6);
    // Random walk with slight upward drift
    const change = (Math.random() - 0.44) * 18;
    v = Math.max(200, v + change);
    points.push({ t, v: parseFloat(v.toFixed(2)) });
  }
  return points;
}

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
    portfolioHistory: seedDemoHistory(),
    cycleRunning: false,
    lastCycleAt: null,
    wsClients: new Set(),
  };
}

const PERIOD_MS: Record<string, number> = {
  "1D": 24 * 60 * 60 * 1000,
  "1W": 7 * 24 * 60 * 60 * 1000,
  "1M": 30 * 24 * 60 * 60 * 1000,
  "ALL": Infinity,
};

export function pushPortfolioPoint(state: AppState, totalUsd: number): void {
  const now = Date.now();
  state.portfolioHistory.push({ t: now, v: totalUsd });
  // Prune entries older than 30 days on every push
  const cutoff = now - 30 * 24 * 60 * 60 * 1000;
  state.portfolioHistory = state.portfolioHistory.filter((p) => p.t >= cutoff);
}

export function getPortfolioHistory(state: AppState, period: string): PortfolioPoint[] {
  const ms = PERIOD_MS[period] ?? PERIOD_MS["ALL"];
  if (ms === Infinity) return [...state.portfolioHistory];
  const cutoff = Date.now() - ms;
  return state.portfolioHistory.filter((p) => p.t >= cutoff);
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
