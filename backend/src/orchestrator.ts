import type { Agent, Proposal } from "./agents/base";
import type { SolanaService } from "./blockchain/solana";
import type { PoolDataService } from "./blockchain/pools";
import type { JupiterService } from "./blockchain/jupiter";
import {
  TransactionExecutor,
  type ExecutionResult,
} from "./blockchain/executor";

const QUORUM_REQUIRED = 3; // Minimum YES votes for a proposal to pass

interface VoteResult {
  yes: number;
  no: number;
  abstain: number;
  passed: boolean;
}

interface ProposalWithVote {
  proposal: Proposal;
  voteResult: VoteResult;
}

export class Cortex {
  private executor: TransactionExecutor;

  constructor(
    private agents: Agent[],
    private solanaService: SolanaService,
    private poolDataService: PoolDataService,
    private jupiterService: JupiterService,
  ) {
    this.executor = new TransactionExecutor(
      solanaService,
      jupiterService,
      poolDataService,
    );
  }

  async runCycle() {
    console.log("Starting agent cycle...\n");

    const proposals = await this.collectProposals();
    console.log(`Collected ${proposals.length} proposals:\n`);

    for (const proposal of proposals) {
      console.log(`\n📌 ${proposal.agent.toUpperCase()}: ${proposal.action}`);
      console.log(`   Target: ${proposal.target ?? "N/A"}`);
      console.log(`   Reasoning: ${proposal.reasoning}`);
      console.log(`   Confidence: ${proposal.confidence}%`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n🗳️  VOTING PHASE\n");

    const proposalsWithVotes: ProposalWithVote[] = [];

    for (const proposal of proposals) {
      console.log(`\nVoting on ${proposal.agent}'s proposal (${proposal.action})...`);

      const voteResult = await this.voteOnProposal(proposal);

      console.log(`   YES: ${voteResult.yes}, NO: ${voteResult.no}, ABSTAIN: ${voteResult.abstain}`);
      console.log(`   Quorum: ${voteResult.yes}/${QUORUM_REQUIRED} required`);
      console.log(`   Result: ${voteResult.passed ? "✅ PASSED" : "❌ REJECTED"}`);

      proposalsWithVotes.push({ proposal, voteResult });
    }

    const passedProposals = proposalsWithVotes
      .filter((p) => p.voteResult.passed)
      .map((p) => p.proposal);

    if (passedProposals.length > 0) {
      console.log("\n" + "=".repeat(60));
      console.log("\n⚡ EXECUTION PHASE\n");
      console.log(`Executing ${passedProposals.length} passed proposal(s)...\n`);

      const results: ExecutionResult[] = await this.executor.executeProposals(passedProposals);

      console.log("\n📊 Execution Summary:\n");
      for (const result of results) {
        const icon = result.success ? "✅" : "❌";
        console.log(`${icon} ${result.agent}: ${result.message}`);
        if (result.transaction) {
          console.log(`   🔗 ${result.transaction.explorer}`);
        }
        if (result.error) {
          console.log(`   ⚠️  Error: ${result.error}`);
        }
      }

      const summary = TransactionExecutor.summarize(results);
      console.log(
        `\n   Total: ${summary.total} | Success: ${summary.successful} | Failed: ${summary.failed} | Txns: ${summary.transactions}`,
      );
    } else {
      console.log("\n⚠️  No proposals reached quorum — nothing executed");
    }
  }

  private async collectProposals(): Promise<Proposal[]> {
    const walletAddress = this.solanaService.getWallet().publicKey;
    const solBalance = await this.solanaService.getBalance(walletAddress);
    const pools = await this.poolDataService.getAllPools();

    const context = {
      portfolio: { sol: solBalance, usdc: 0 },
      pools,
    };

    console.log(`\n💼 Portfolio: ${solBalance.toFixed(4)} SOL`);
    console.log(`📊 Fetched ${pools.length} DeFi pools\n`);

    // Use allSettled so one failing agent doesn't kill the whole cycle
    const results = await Promise.allSettled(
      this.agents.map((agent) => agent.think(context)),
    );

    const proposals: Proposal[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        proposals.push(result.value);
      } else {
        console.warn(`[WARN] Agent think() rejected:`, result.reason);
      }
    }

    return proposals;
  }

  private async voteOnProposal(proposal: Proposal): Promise<VoteResult> {
    // Use allSettled so one failing vote doesn't block the rest
    const results = await Promise.allSettled(
      this.agents.map((agent) => agent.vote(proposal)),
    );

    let yes = 0;
    let no = 0;
    let abstain = 0;

    for (const result of results) {
      if (result.status === "fulfilled") {
        if (result.value === "YES") yes++;
        else if (result.value === "NO") no++;
        else abstain++;
      } else {
        abstain++; // Treat vote failures as abstentions
        console.warn(`[WARN] Agent vote() rejected:`, result.reason);
      }
    }

    // Quorum: must reach QUORUM_REQUIRED YES votes AND outnumber NOs
    const passed = yes >= QUORUM_REQUIRED && yes > no;

    return { yes, no, abstain, passed };
  }
}
