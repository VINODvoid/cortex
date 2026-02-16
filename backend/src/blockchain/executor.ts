import type { Proposal } from "../agents/base";
import type { SolanaService } from "./solana";
import type { JupiterService } from "./jupiter";
import type { PoolDataService } from "./pools";
import { TOKEN_MINTS } from "./jupiter";

export interface ExecutionResult {
  success: boolean;
  action: string;
  agent: string;
  target?: string;
  transaction?: {
    signature: string;
    explorer: string;
    inputAmount: number;
    outputAmount: number;
  };
  error?: string;
  message: string;
}

/**
 * TransactionExecutor converts agent proposals into blockchain transactions
 */
export class TransactionExecutor {
  constructor(
    private solanaService: SolanaService,
    private jupiterService: JupiterService,
    private poolDataService: PoolDataService,
  ) {}

  /**
   * Execute a proposal that passed voting
   */
  async executeProposal(proposal: Proposal): Promise<ExecutionResult> {
    console.log(`\n🔄 Executing ${proposal.agent}'s proposal: ${proposal.action}`);

    try {
      // Route to appropriate handler based on action type
      const actionLower = proposal.action.toLowerCase();

      if (actionLower === "hold") {
        return this.executeHold(proposal);
      }

      if (
        actionLower.includes("provide_liquidity") ||
        actionLower.includes("liquidity")
      ) {
        return await this.executeProvideLiquidity(proposal);
      }

      if (
        actionLower.includes("rebalance") ||
        actionLower.includes("diversify")
      ) {
        return await this.executeRebalance(proposal);
      }

      if (actionLower.includes("exit") || actionLower.includes("withdraw")) {
        return await this.executeExit(proposal);
      }

      if (actionLower.includes("buy") || actionLower.includes("trend")) {
        return await this.executeBuy(proposal);
      }

      // Default: log unhandled action
      return {
        success: true,
        action: proposal.action,
        agent: proposal.agent,
        target: proposal.target,
        message: `Action '${proposal.action}' acknowledged but not yet implemented`,
      };
    } catch (error) {
      return {
        success: false,
        action: proposal.action,
        agent: proposal.agent,
        target: proposal.target,
        error: error instanceof Error ? error.message : String(error),
        message: `Failed to execute ${proposal.action}`,
      };
    }
  }

  /**
   * Execute multiple proposals in sequence
   */
  async executeProposals(proposals: Proposal[]): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];

    for (const proposal of proposals) {
      const result = await this.executeProposal(proposal);
      results.push(result);

      // Add delay between transactions to avoid rate limits
      if (result.transaction) {
        await this.sleep(2000);
      }
    }

    return results;
  }

  /**
   * Hold - No action needed
   */
  private executeHold(proposal: Proposal): ExecutionResult {
    return {
      success: true,
      action: proposal.action,
      agent: proposal.agent,
      message: "Holding position - no action taken",
    };
  }

  /**
   * Provide Liquidity - Swap SOL to target token (simulates liquidity provision)
   */
  private async executeProvideLiquidity(
    proposal: Proposal,
  ): Promise<ExecutionResult> {
    const wallet = this.solanaService.getWallet();
    const balance = await this.solanaService.getBalance(wallet.publicKey);

    // Check if we have sufficient balance
    if (balance < 0.1) {
      return {
        success: false,
        action: proposal.action,
        agent: proposal.agent,
        target: proposal.target,
        error: `Insufficient balance: ${balance.toFixed(4)} SOL`,
        message: "Cannot provide liquidity - insufficient funds",
      };
    }

    // Determine swap amount (10% of balance, max 1 SOL)
    const swapAmount = Math.min(balance * 0.1, 1.0);
    const swapAmountLamports = this.jupiterService.solToLamports(swapAmount);

    console.log(`   Swapping ${swapAmount.toFixed(4)} SOL → USDC`);

    // Get quote
    const quote = await this.jupiterService.getSwapQuote(
      TOKEN_MINTS.SOL,
      TOKEN_MINTS.USDC,
      swapAmountLamports,
      100, // 1% slippage for safety
    );

    const estimatedOutput = this.jupiterService.baseUnitsToUsdc(
      Number(quote.outAmount),
    );
    console.log(`   Estimated output: ${estimatedOutput.toFixed(2)} USDC`);

    // Execute swap
    const result = await this.jupiterService.executeSwap(quote, wallet);

    return {
      success: true,
      action: proposal.action,
      agent: proposal.agent,
      target: proposal.target,
      transaction: {
        signature: result.signature,
        explorer: result.explorer,
        inputAmount: this.jupiterService.lamportsToSol(result.inputAmount),
        outputAmount: this.jupiterService.baseUnitsToUsdc(result.outputAmount),
      },
      message: `Successfully swapped ${swapAmount.toFixed(4)} SOL → ${estimatedOutput.toFixed(2)} USDC`,
    };
  }

  /**
   * Rebalance - Redistribute portfolio across targets
   */
  private async executeRebalance(proposal: Proposal): Promise<ExecutionResult> {
    // For MVP, treat rebalance similar to provide_liquidity
    // In production, this would analyze current allocation and rebalance accordingly
    console.log("   Note: Rebalance simplified to liquidity provision for MVP");
    return await this.executeProvideLiquidity(proposal);
  }

  /**
   * Exit Position - Swap back to SOL
   */
  private async executeExit(proposal: Proposal): Promise<ExecutionResult> {
    return {
      success: true,
      action: proposal.action,
      agent: proposal.agent,
      target: proposal.target,
      message:
        "Exit position acknowledged (requires tracking current positions - TBD)",
    };
  }

  /**
   * Buy Trend - Buy trending asset
   */
  private async executeBuy(proposal: Proposal): Promise<ExecutionResult> {
    // Similar to provide_liquidity but could target specific trending tokens
    console.log("   Note: Buy trend simplified to liquidity provision for MVP");
    return await this.executeProvideLiquidity(proposal);
  }

  /**
   * Helper: Sleep for delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get execution summary for all results
   */
  static summarize(results: ExecutionResult[]): {
    total: number;
    successful: number;
    failed: number;
    transactions: number;
  } {
    return {
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      transactions: results.filter((r) => r.transaction).length,
    };
  }
}
