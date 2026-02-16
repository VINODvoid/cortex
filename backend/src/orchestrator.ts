import type { Agent, Proposal } from "./agents/base";
import type { SolanaService } from "./blockchain/solana";
import type { PoolDataService } from "./blockchain/pools";

interface VoteResult {
  yes: number;
  no: number;
  abstain: number;
  passed: boolean;
}

export class Cortex {
  constructor(
    private agents: Agent[],
    private solanaService: SolanaService,
    private poolDataService: PoolDataService,
  ) {}
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

    // Then in the voting loop, display results:
    for (const proposal of proposals) {
      console.log(
        `\nVoting on ${proposal.agent}'s proposal (${proposal.action})...`,
      );

      const voteResult = await this.voteOnProposal(proposal);

      console.log(`   YES: ${voteResult.yes}, NO: ${voteResult.no}, ABSTAIN:
      ${voteResult.abstain}`);
      console.log(
        ` Result: ${voteResult.passed ? "✅ PASSED" : "❌ REJECTED"}`,
      );
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
