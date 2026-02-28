import type { ServerWebSocket } from "bun";
import { SolanaService } from "../blockchain/solana";
import { PoolDataService } from "../blockchain/pools";
import { StrategistNeuron } from "../agents/strategist";
import { YieldNeuron } from "../agents/yield";
import { RiskNeuron } from "../agents/risk";
import { LiquidityNeuron } from "../agents/liquidity";
import { TrendNeuron } from "../agents/trend";
import { SentimentNeuron } from "../agents/sentiment";
import { WhaleNeuron } from "../agents/whale";
import { RebalancerNeuron } from "../agents/rebalancer";
import { GasOptimizerNeuron } from "../agents/gas";
import { AirdropNeuron } from "../agents/airdrop";
import type { Agent } from "../agents/base";
import { JupiterService, TOKEN_MINTS } from "../blockchain/jupiter";
import { TransactionExecutor } from "../blockchain/executor";
import { createInitialState, addActivity, broadcast } from "./state";
import type { AppState } from "./state";
import type { ActivityItem } from "./types";


const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: CORS_HEADERS });
}

export function createServer(port = 3001) {
  const solanaService = new SolanaService("testnet");
  const poolDataService = new PoolDataService(solanaService.getConnection());
  const jupiterService = new JupiterService(solanaService.getConnection());
  const executor = new TransactionExecutor(solanaService, jupiterService, poolDataService);
  const groqKey = process.env.GROQ_API_KEY ?? "";

  const agents: Agent[] = [
    new StrategistNeuron(groqKey),
    new YieldNeuron(groqKey),
    new RiskNeuron(groqKey),
    new LiquidityNeuron(groqKey),
    new TrendNeuron(groqKey),
    new SentimentNeuron(groqKey),
    new WhaleNeuron(groqKey),
    new RebalancerNeuron(groqKey),
    new GasOptimizerNeuron(groqKey),
    new AirdropNeuron(groqKey),
  ];

  const state: AppState = createInitialState(solanaService.getWalletAddress());

  async function refreshPortfolio(): Promise<void> {
    try {
      const wallet = solanaService.getWallet();
      const [sol, usdc, solPrice] = await Promise.all([
        solanaService.getBalance(wallet.publicKey),
        solanaService.getTokenBalance(TOKEN_MINTS.USDC),
        jupiterService.getSolPrice(),
      ]);
      const price = solPrice ?? 170;
      const prevTotal = state.portfolio.totalUsd;
      const totalUsd = sol * price + usdc;
      const change24h =
        prevTotal > 0 ? ((totalUsd - prevTotal) / prevTotal) * 100 : 0;
      state.portfolio = { ...state.portfolio, sol, usdc, totalUsd, change24h };
      broadcast(state, { event: "portfolio_update", data: state.portfolio });
    } catch {
      // devnet balance fetch failures are non-fatal
    }
  }

  async function runCycle(): Promise<void> {
    if (state.cycleRunning) return;

    state.cycleRunning = true;
    broadcast(state, { event: "cycle_start", data: {} });

    // Mark all agents as THINKING
    state.agents = state.agents.map((a) => ({ ...a, status: "THINKING" as const }));
    broadcast(state, { event: "agents_update", data: state.agents });

    await refreshPortfolio();

    const pools = await poolDataService.getAllPools();
    const context = {
      portfolio: { sol: state.portfolio.sol, usdc: state.portfolio.usdc },
      pools,
    };

    // Collect proposals (concurrent, individual failures skipped)
    const proposalResults = await Promise.allSettled(
      agents.map(async (agent, i) => {
        // 30s timeout for agent thinking
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Think timeout")), 30000)
        );

        const proposal = await Promise.race([agent.think(context), timeout]);

        const proposalId = `${Date.now()}-p${i}`;
        const item: ActivityItem = {
          id: proposalId,
          type: "PROPOSAL",
          agent: state.agents[i]?.name ?? proposal.agent,
          action: proposal.action,
          target: proposal.target,
          status: "PENDING",
          timestamp: new Date().toISOString(),
        };

        addActivity(state, item);

        state.agents = state.agents.map((a, j) =>
          j === i
            ? {
                ...a,
                status: "ACTIVE" as const,
                lastAction: proposal.action,
                confidence: proposal.confidence,
              }
            : a
        );

        broadcast(state, { event: "agents_update", data: state.agents });
        broadcast(state, { event: "proposal", data: item });
        return { proposal, agentIdx: i, proposalId };
      })
    );

    const proposals = proposalResults
      .filter(
        (r): r is PromiseFulfilledResult<{ proposal: any; agentIdx: number; proposalId: string }> =>
          r.status === "fulfilled"
      )
      .map((r) => r.value);

    // Vote phase — find the consensus winner (most YES votes)
    let successful = 0;
    let failed = 0;
    let winner: { proposal: any; agentIdx: number; yesVotes: number } | null = null;

    for (const { proposal, agentIdx, proposalId } of proposals) {
      const voteResults = await Promise.allSettled(
        agents.map(async (a) => {
          const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Vote timeout")), 20000)
          );
          return Promise.race([a.vote(proposal), timeout]);
        })
      );
      const votes = voteResults
        .filter(
          (r): r is PromiseFulfilledResult<"YES" | "NO" | "ABSTAIN"> =>
            r.status === "fulfilled"
        )
        .map((r) => r.value);

      const yes = votes.filter((v) => v === "YES").length;
      const no = votes.filter((v) => v === "NO").length;
      const abstain = votes.filter((v) => v === "ABSTAIN").length;
      const passed = yes > no;
      const status = passed ? ("SUCCESS" as const) : ("FAILED" as const);

      // Update the original proposal status in state
      state.activity = state.activity.map(item =>
        item.id === proposalId ? { ...item, status } : item
      );

      const voteItem: ActivityItem = {
        id: `${Date.now()}-v${agentIdx}`,
        type: "VOTE",
        agent: state.agents[agentIdx]?.name ?? proposal.agent,
        action: `Vote ${passed ? "PASSED" : "REJECTED"} — ${yes}Y / ${no}N / ${abstain}A`,
        target: proposal.target,
        status,
        timestamp: new Date().toISOString(),
      };

      addActivity(state, voteItem);
      broadcast(state, {
        event: "vote_complete",
        data: { itemId: proposalId, status, voteResult: { yes, no, abstain, passed } },
      });

      if (passed) {
        successful++;
        // Track the proposal with the most YES votes — execute only the winner
        if (!winner || yes > winner.yesVotes) {
          winner = { proposal, agentIdx, yesVotes: yes };
        }
      } else {
        failed++;
      }
    }

    // Execute only the consensus winner — one Jupiter call per cycle, no rate limit hammering
    if (winner) {
      const { proposal, agentIdx } = winner;
      executor.executeProposal(proposal).then((execResult) => {
        const execItem: ActivityItem = {
          id: `${Date.now()}-e${agentIdx}`,
          type: "EXECUTION",
          agent: proposal.agent,
          action: execResult.message,
          target: execResult.transaction?.signature
            ? `tx:${execResult.transaction.signature}`
            : proposal.target,
          status: execResult.success ? "SUCCESS" : "FAILED",
          timestamp: new Date().toISOString(),
          txSignature: execResult.transaction?.signature,
        };
        addActivity(state, execItem);
        broadcast(state, { event: "execution_complete", data: execItem });
        refreshPortfolio();
      }).catch(() => {});
    }

    state.cycleRunning = false;
    state.lastCycleAt = new Date();
    state.agents = state.agents.map((a) => ({ ...a, status: "IDLE" as const }));
    broadcast(state, { event: "agents_update", data: state.agents });

    broadcast(state, {
      event: "cycle_complete",
      data: { successful, failed, total: proposals.length },
    });

    // Refresh portfolio after cycle
    await refreshPortfolio();
  }

  const server = Bun.serve({
    port,
    async fetch(req: Request, server) {
      if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      }

      const url = new URL(req.url);

      if (url.pathname === "/ws") {
        const upgraded = server.upgrade(req);
        if (upgraded) return undefined;
        return new Response("WebSocket upgrade expected", { status: 426, headers: CORS_HEADERS });
      }

      if (url.pathname === "/health") {
        return jsonResponse({ status: "ok", timestamp: new Date().toISOString() });
      }

      if (url.pathname === "/api/portfolio" && req.method === "GET") {
        return jsonResponse(state.portfolio);
      }

      if (url.pathname === "/api/pools" && req.method === "GET") {
        const pools = await poolDataService.getAllPools();
        return jsonResponse(pools);
      }

      if (url.pathname === "/api/agents" && req.method === "GET") {
        return jsonResponse(state.agents);
      }

      if (url.pathname === "/api/activity" && req.method === "GET") {
        return jsonResponse(state.activity);
      }

      if (url.pathname === "/api/blockhash" && req.method === "GET") {
        const bh = await solanaService.getConnection().getLatestBlockhash("finalized");
        return jsonResponse(bh);
      }

      if (url.pathname === "/api/vault/deposit" && req.method === "POST") {
        let body: { signedTx?: string };
        try {
          body = await req.json();
        } catch {
          return jsonResponse({ error: "Invalid JSON body" }, 400);
        }
        if (!body.signedTx || typeof body.signedTx !== "string") {
          return jsonResponse({ error: "signedTx is required" }, 400);
        }
        try {
          const txBytes = Buffer.from(body.signedTx, "base64");
          const signature = await solanaService.getConnection().sendRawTransaction(txBytes, {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          });
          await solanaService.getConnection().confirmTransaction(signature, "confirmed");
          return jsonResponse({ signature });
        } catch (err: any) {
          return jsonResponse({ error: err?.message ?? "Transaction failed" }, 500);
        }
      }

      if (url.pathname === "/api/vault" && req.method === "GET") {
        const balance = await solanaService.getBalance(solanaService.getWallet().publicKey);
        return jsonResponse({
          address: solanaService.getWalletAddress(),
          balance,
          network: solanaService.getNetwork(),
        });
      }

      if (url.pathname === "/api/vault/withdraw" && req.method === "POST") {
        let body: { walletAddress?: string; amountSol?: number };
        try {
          body = await req.json();
        } catch {
          return jsonResponse({ error: "Invalid JSON body" }, 400);
        }
        const { walletAddress, amountSol } = body;
        if (!walletAddress || typeof walletAddress !== "string") {
          return jsonResponse({ error: "walletAddress is required" }, 400);
        }
        if (!amountSol || typeof amountSol !== "number" || amountSol <= 0) {
          return jsonResponse({ error: "amountSol must be a positive number" }, 400);
        }
        const vaultBalance = await solanaService.getBalance(solanaService.getWallet().publicKey);
        if (amountSol > vaultBalance) {
          return jsonResponse({ error: `Insufficient vault balance (${vaultBalance.toFixed(4)} SOL)` }, 400);
        }
        try {
          const txSignature = await solanaService.sendSol(walletAddress, amountSol);
          return jsonResponse({ txSignature });
        } catch (err: any) {
          return jsonResponse({ error: err?.message ?? "Transaction failed" }, 500);
        }
      }

      if (url.pathname === "/api/vault/positions" && req.method === "GET") {
        const [sol, usdc] = await Promise.all([
          solanaService.getBalance(solanaService.getWallet().publicKey),
          solanaService.getTokenBalance(TOKEN_MINTS.USDC),
        ]);
        return jsonResponse({ sol, usdc });
      }

      if (url.pathname === "/api/swap/quote" && req.method === "GET") {
        const direction = url.searchParams.get("direction") ?? "SOL_TO_USDC";
        const amount = parseFloat(url.searchParams.get("amount") ?? "0");
        if (!amount || amount <= 0) {
          return jsonResponse({ error: "amount must be a positive number" }, 400);
        }
        const inputMint = direction === "SOL_TO_USDC" ? TOKEN_MINTS.SOL : TOKEN_MINTS.USDC;
        const outputMint = direction === "SOL_TO_USDC" ? TOKEN_MINTS.USDC : TOKEN_MINTS.SOL;
        const amountInBaseUnits = direction === "SOL_TO_USDC"
          ? jupiterService.solToLamports(amount)
          : jupiterService.usdcToBaseUnits(amount);
        try {
          const quote = await jupiterService.getSwapQuote(inputMint, outputMint, amountInBaseUnits);
          const estimatedOutput = direction === "SOL_TO_USDC"
            ? jupiterService.baseUnitsToUsdc(Number(quote.outAmount))
            : jupiterService.lamportsToSol(Number(quote.outAmount));
          return jsonResponse({ direction, inputAmount: amount, estimatedOutput, priceImpactPct: quote.priceImpactPct });
        } catch (err: any) {
          return jsonResponse({ error: err?.message ?? "Quote failed" }, 502);
        }
      }

      if (url.pathname === "/api/vault/swap" && req.method === "POST") {
        let body: { direction?: string; amount?: number; slippageBps?: number };
        try {
          body = await req.json();
        } catch {
          return jsonResponse({ error: "Invalid JSON body" }, 400);
        }
        const { direction = "SOL_TO_USDC", amount, slippageBps = 100 } = body;
        if (!amount || typeof amount !== "number" || amount <= 0) {
          return jsonResponse({ error: "amount must be a positive number" }, 400);
        }
        const vaultBal = await solanaService.getBalance(solanaService.getWallet().publicKey);
        if (direction === "SOL_TO_USDC" && amount > vaultBal) {
          return jsonResponse({ error: `Insufficient vault balance (${vaultBal.toFixed(4)} SOL)` }, 400);
        }
        const inputMint = direction === "SOL_TO_USDC" ? TOKEN_MINTS.SOL : TOKEN_MINTS.USDC;
        const outputMint = direction === "SOL_TO_USDC" ? TOKEN_MINTS.USDC : TOKEN_MINTS.SOL;
        const amountInBaseUnits = direction === "SOL_TO_USDC"
          ? jupiterService.solToLamports(amount)
          : jupiterService.usdcToBaseUnits(amount);
        try {
          const quote = await jupiterService.getSwapQuote(inputMint, outputMint, amountInBaseUnits, slippageBps);
          const result = await jupiterService.executeSwap(quote, solanaService.getWallet());
          await refreshPortfolio();
          return jsonResponse({
            signature: result.signature,
            explorer: result.explorer,
            inputAmount: result.inputAmount,
            outputAmount: result.outputAmount,
          });
        } catch (err: any) {
          return jsonResponse({ error: err?.message ?? "Swap failed" }, 500);
        }
      }

      if (url.pathname === "/api/cycle" && req.method === "POST") {
        if (state.cycleRunning) {
          return jsonResponse({ error: "Cycle already running" }, 409);
        }
        runCycle(); // fire-and-forget
        return jsonResponse({ started: true });
      }

      return new Response("Not found", { status: 404, headers: CORS_HEADERS });
    },
    websocket: {
      open(ws: ServerWebSocket<unknown>) {
        state.wsClients.add(ws);
        ws.send(
          JSON.stringify({
            event: "connected",
            data: {
              portfolio: state.portfolio,
              agents: state.agents,
              activity: state.activity,
            },
          }),
        );
      },
      message(ws: ServerWebSocket<unknown>, msg: string | Buffer) {
        try {
          const data = JSON.parse(String(msg));
          if (data.type === "trigger_cycle") {
            runCycle();
          }
        } catch {}
      },
      close(ws: ServerWebSocket<unknown>) {
        state.wsClients.delete(ws);
      },
    },
  });

  return server;
}
