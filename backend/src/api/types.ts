export interface Portfolio {
  sol: number;
  usdc: number;
  totalUsd: number;
  change24h: number;
  walletAddress: string;
}

export type AgentStatusType = "ACTIVE" | "IDLE" | "THINKING" | "SCANNING";

export interface AgentStatus {
  name: string;
  role: string;
  status: AgentStatusType;
  lastAction: string;
  confidence: number;
}

export type ActivityType = "PROPOSAL" | "VOTE" | "EXECUTION" | "SYSTEM";
export type ActivityStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  agent: string;
  action: string;
  target?: string;
  status: ActivityStatus;
  timestamp: string;
  txSignature?: string;
}

export type WsMessage =
  | {
      event: "connected";
      data: { portfolio: Portfolio; agents: AgentStatus[]; activity: ActivityItem[] };
    }
  | { event: "cycle_start"; data: object }
  | { event: "proposal"; data: ActivityItem }
  | {
      event: "vote_complete";
      data: {
        itemId: string;
        status: ActivityStatus;
        voteResult: { yes: number; no: number; abstain: number; passed: boolean };
      };
    }
  | { event: "execution_complete"; data: ActivityItem }
  | { event: "cycle_complete"; data: { successful: number; failed: number; total: number } }
  | { event: "portfolio_update"; data: Portfolio };
