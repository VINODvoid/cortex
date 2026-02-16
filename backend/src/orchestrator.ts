import type { Agent, Proposal } from "./agents/base";
import type { SolanaService } from "./blockchain/solana";
import type { PoolDataService } from "./blockchain/pools";
import type { JupiterService } from "./blockchain/jupiter";
import {
  TransactionExecutor,
  type ExecutionResult,
} from "./blockchain/executor";

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
    // Starting the cycle
    console.log("Starting agent cycle...\n");
    // Collect proposals
    const proposals = await this.collectProposals();
    console.log(`Collected ${proposals.length} proposals:\n`);

    // Display proposals
    for (const proposal of proposals) {
      console.log(`\n📌 ${proposal.agent.toUpperCase()}: ${proposal.action}`);
      console.log(`   Target: ${proposal.target || "N/A"}`);
      console.log(`   Reasoning: ${proposal.reasoning}`);
      console.log(`   Confidence: ${proposal.confidence}%`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n🗳️  VOTING PHASE\n");

    // Collect votes for all proposals
    const proposalsWithVotes: ProposalWithVote[] = [];

    for (const proposal of proposals) {
      console.log(
        `\nVoting on ${proposal.agent}'s proposal (${proposal.action})...`,
      );

      const voteResult = await this.voteOnProposal(proposal);

      console.log(`   YES: ${voteResult.yes}, NO: ${voteResult.no}, ABSTAIN: ${voteResult.abstain}`);
      console.log(
        `   Result: ${voteResult.passed ? "✅ PASSED" : "❌ REJECTED"}`,
      );

      proposalsWithVotes.push({ proposal, voteResult });
    }

    // Execute passed proposals
    const passedProposals = proposalsWithVotes
      .filter((p) => p.voteResult.passed)
      .map((p) => p.proposal);

    if (passedProposals.length > 0) {
      console.log("\n" + "=".repeat(60));
      console.log("\n⚡ EXECUTION PHASE\n");
      console.log(`Executing ${passedProposals.length} passed proposal(s)...\n`);

      const results = await this.executor.executeProposals(passedProposals);

      // Display execution results
      console.log("\n📊 Execution Summary:\n");
      for (const result of results) {
        const status = result.success ? "✅" : "❌";
        console.log(`${status} ${result.agent}: ${result.message}`);
        if (result.transaction) {
          console.log(`   🔗 ${result.transaction.explorer}`);
        }
        if (result.error) {
          console.log(`   ⚠️  Error: ${result.error}`);
        }
      }

      const summary = TransactionExecutor.summarize(results);
      console.log(`\n   Total: ${summary.total} | Success: ${summary.successful} | Failed: ${summary.failed} | Transactions: ${summary.transactions}`);
    } else {
      console.log("\n⚠️  No proposals passed - nothing to execute");
    }
  }
  private async collectProposals(): Promise<Proposal[]> {
    // Fetch real blockchain data
    const walletAddress = this.solanaService.getWallet().publicKey;
    const solBalance = await this.solanaService.getBalance(walletAddress);
    const pools = await this.poolDataService.getAllPools();

    // Build context with real data
    const context = {
      portfolio: {
        sol: solBalance,
        usdc: 0, // TODO: Fetch USDC balance from SPL token account
      },
      pools,
    };

    console.log(`\n💼 Portfolio: ${solBalance.toFixed(2)} SOL`);
    console.log(`📊 Fetched ${pools.length} DeFi pools\n`);

    const proposals = await Promise.all(
      this.agents.map((agent) => agent.think(context)),
    );

    return proposals;
  }
  private async voteOnProposal(proposal: Proposal): Promise<VoteResult> {
    // Todo: Implement
    // Get Proposals from all agents in parallel
    // for parallel use Promise.parallel
    const votes = await Promise.all(
      this.agents.map((agent) => agent.vote(proposal)),
    );

    const yes = votes.filter((v) => v === "YES").length;
    const no = votes.filter((v) => v === "NO").length;
    const abstain = votes.filter((v) => v === "ABSTAIN").length;

    // Determining if passed
    const passed = yes > no; // if passed return yes or no : boolean

    return { yes, no, abstain, passed };
  }
}
