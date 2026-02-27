import { API_BASE } from "../constants/config";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} returned ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  getPortfolio: () => get("/api/portfolio"),
  getPools: () => get("/api/pools"),
  getAgents: () => get("/api/agents"),
  getActivity: () => get("/api/activity"),
  triggerCycle: () =>
    fetch(`${API_BASE}/api/cycle`, { method: "POST" }).then((r) => r.json()),
  getVault: () =>
    get<{ address: string; balance: number; network: string }>("/api/vault"),
  getBlockhash: () =>
    get<{ blockhash: string; lastValidBlockHeight: number }>("/api/blockhash"),
  submitDeposit: (signedTx: string) =>
    fetch(`${API_BASE}/api/vault/deposit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signedTx }),
    }).then((r) => r.json()) as Promise<{ signature?: string; error?: string }>,
  withdrawFromVault: (walletAddress: string, amountSol: number) =>
    fetch(`${API_BASE}/api/vault/withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress, amountSol }),
    }).then((r) => r.json()) as Promise<{ txSignature?: string; error?: string }>,
};
