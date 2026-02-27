import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { api } from "../services/api";
import { WsManager } from "../services/ws";
import { WS_URL } from "../constants/config";

// ─── Shared types ────────────────────────────────────────────────────────────

export interface Portfolio {
  sol: number;
  usdc: number;
  totalUsd: number;
  change24h: number;
  walletAddress: string;
}

export interface AgentStatus {
  name: string;
  role: string;
  status: "ACTIVE" | "IDLE" | "THINKING" | "SCANNING";
  lastAction: string;
  confidence: number;
}

export interface ActivityItem {
  id: string;
  type: "PROPOSAL" | "VOTE" | "EXECUTION" | "SYSTEM";
  agent: string;
  action: string;
  target?: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  timestamp: string;
  txSignature?: string;
}

export interface Pool {
  name: string;
  apy: number;
  tvl: number;
}

export interface VaultInfo {
  address: string;
  balance: number;
  network: string;
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  portfolio: Portfolio;
  agents: AgentStatus[];
  activity: ActivityItem[];
  pools: Pool[];
  cycleRunning: boolean;
  isConnected: boolean;
  vault: VaultInfo | null;
  triggerCycle: () => Promise<void>;
  refreshVault: () => Promise<void>;
  withdrawFromVault: (walletAddress: string, amountSol: number) => Promise<string>;
}

const defaultPortfolio: Portfolio = {
  sol: 0,
  usdc: 0,
  totalUsd: 0,
  change24h: 0,
  walletAddress: "",
};

const AppContext = createContext<AppContextValue>({
  portfolio: defaultPortfolio,
  agents: [],
  activity: [],
  pools: [],
  cycleRunning: false,
  isConnected: false,
  vault: null,
  triggerCycle: async () => {},
  refreshVault: async () => {},
  withdrawFromVault: async () => "",
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [portfolio, setPortfolio] = useState<Portfolio>(defaultPortfolio);
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [cycleRunning, setCycleRunning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [vault, setVault] = useState<VaultInfo | null>(null);
  const wsRef = useRef<WsManager | null>(null);

  const refreshVault = useCallback(async () => {
    try {
      const v = await api.getVault();
      setVault(v);
    } catch {
      // non-fatal — backend may not be running
    }
  }, []);

  const withdrawFromVault = useCallback(
    async (walletAddress: string, amountSol: number): Promise<string> => {
      const result = await api.withdrawFromVault(walletAddress, amountSol);
      if (result.error) throw new Error(result.error);
      // Refresh vault balance after withdrawal
      await refreshVault();
      return result.txSignature ?? "";
    },
    [refreshVault],
  );

  useEffect(() => {
    // Fetch initial REST data
    Promise.all([
      api.getPortfolio() as Promise<Portfolio>,
      api.getAgents() as Promise<AgentStatus[]>,
      api.getActivity() as Promise<ActivityItem[]>,
      api.getPools() as Promise<Pool[]>,
    ])
      .then(([p, a, act, pl]) => {
        setPortfolio(p);
        setAgents(a);
        setActivity(act);
        setPools(pl);
      })
      .catch(() => {});

    // Fetch vault info
    refreshVault();

    // WebSocket
    const ws = new WsManager(WS_URL);
    wsRef.current = ws;

    ws.on("connected", (data: { portfolio: Portfolio; agents: AgentStatus[]; activity: ActivityItem[] }) => {
      setIsConnected(true);
      setPortfolio(data.portfolio);
      setAgents(data.agents);
      setActivity(data.activity);
    });

    ws.on("cycle_start", () => {
      setCycleRunning(true);
    });

    ws.on("proposal", (item: ActivityItem) => {
      setActivity((prev) => [item, ...prev].slice(0, 50));
    });

    ws.on("vote_complete", ({ itemId, status }: { itemId: string; status: "SUCCESS" | "FAILED" }) => {
      setActivity((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, status } : item)),
      );
    });

    ws.on("execution_complete", (item: ActivityItem) => {
      setActivity((prev) => [item, ...prev].slice(0, 50));
    });

    ws.on("cycle_complete", () => {
      setCycleRunning(false);
    });

    ws.on("portfolio_update", (data: Portfolio) => {
      setPortfolio(data);
    });

    ws.connect();

    // Poll vault balance every 30s
    const vaultPoll = setInterval(refreshVault, 30000);

    return () => {
      ws.disconnect();
      clearInterval(vaultPoll);
    };
  }, [refreshVault]);

  const triggerCycle = useCallback(async () => {
    if (cycleRunning) return;
    await api.triggerCycle();
  }, [cycleRunning]);

  return (
    <AppContext.Provider
      value={{
        portfolio,
        agents,
        activity,
        pools,
        cycleRunning,
        isConnected,
        vault,
        triggerCycle,
        refreshVault,
        withdrawFromVault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  return useContext(AppContext);
}
