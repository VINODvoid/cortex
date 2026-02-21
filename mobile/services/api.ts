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
};
