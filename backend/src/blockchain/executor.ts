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

  private isMainnet(): boolean {
    return this.solanaService.isMainnet();
  }

  /** On non-mainnet networks Jupiter doesn't work — return a simulated success. */
  private simulateSwap(inSol: number, outUsdc: number, direction: "SOL_USDC" | "USDC_SOL"): SwapResult {
    const sig = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      signature: sig,
      inputAmount: direction === "SOL_USDC" ? this.jupiterService.solToLamports(inSol) : this.jupiterService.usdcToBaseUnits(outUsdc),
      outputAmount: direction === "SOL_USDC" ? this.jupiterService.usdcToBaseUnits(outUsdc) : this.jupiterService.solToLamports(inSol),
      explorer: `https://solscan.io/tx/${sig}?cluster=testnet`,
    };
  }

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

      // sell_trend must be checked before the generic "trend" catch-all
      if (actionLower.includes("sell")) {
        return await this.executeProvideLiquidity(proposal);
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

    // Execute swap (simulate on non-mainnet — Jupiter only works on mainnet-beta)
    const result = this.isMainnet()
      ? await this.jupiterService.executeSwap(quote, wallet)
      : this.simulateSwap(swapAmount, estimatedOutput, "SOL_USDC");

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
   * Rebalance - Target 50% SOL / 50% USDC by value
   */
  private async executeRebalance(proposal: Proposal): Promise<ExecutionResult> {
    const wallet = this.solanaService.getWallet();
    const [solBalance, usdcBalance, solPrice] = await Promise.all([
      this.solanaService.getBalance(wallet.publicKey),
      this.solanaService.getTokenBalance(TOKEN_MINTS.USDC),
      this.jupiterService.getSolPrice(),
    ]);
    const price = solPrice ?? 170;
    const totalUsd = solBalance * price + usdcBalance;

    if (totalUsd < 0.5) {
      return {
        success: true,
        action: proposal.action,
        agent: proposal.agent,
        message: "Portfolio too small to rebalance",
      };
    }

    const targetUsd = totalUsd / 2;
    const solValueUsd = solBalance * price;
    const imbalance = Math.abs(solValueUsd - targetUsd) / totalUsd;

    if (imbalance <= 0.05) {
      return {
        success: true,
        action: proposal.action,
        agent: proposal.agent,
        message: `Portfolio balanced (SOL ${((solValueUsd / totalUsd) * 100).toFixed(1)}% / USDC ${((usdcBalance / totalUsd) * 100).toFixed(1)}%) — no rebalance needed`,
      };
    }

    if (solValueUsd > targetUsd) {
      // Excess SOL → sell to USDC
      const excessSol = (solValueUsd - targetUsd) / price;
      const swapLamports = this.jupiterService.solToLamports(excessSol);
      const estimatedUsdc = excessSol * price;
      console.log(`   Rebalance: swapping ${excessSol.toFixed(4)} SOL → USDC`);
      const result = this.isMainnet()
        ? await this.jupiterService.executeSwap(
            await this.jupiterService.getSwapQuote(TOKEN_MINTS.SOL, TOKEN_MINTS.USDC, swapLamports, 100),
            wallet,
          )
        : this.simulateSwap(excessSol, estimatedUsdc, "SOL_USDC");
      const outUsdc = this.jupiterService.baseUnitsToUsdc(result.outputAmount);
      return {
        success: true,
        action: proposal.action,
        agent: proposal.agent,
        target: proposal.target,
        transaction: {
          signature: result.signature,
          explorer: result.explorer,
          inputAmount: this.jupiterService.lamportsToSol(result.inputAmount),
          outputAmount: outUsdc,
        },
        message: `Rebalanced: sold ${excessSol.toFixed(4)} SOL → ${outUsdc.toFixed(2)} USDC`,
      };
    } else {
      // Excess USDC → buy SOL
      const excessUsdc = usdcBalance - targetUsd;
      if (excessUsdc <= 0) {
        return { success: true, action: proposal.action, agent: proposal.agent, message: "Portfolio balanced — no rebalance needed" };
      }
      const swapBaseUnits = this.jupiterService.usdcToBaseUnits(excessUsdc);
      const estimatedSol = excessUsdc / price;
      console.log(`   Rebalance: swapping ${excessUsdc.toFixed(2)} USDC → SOL`);
      const result = this.isMainnet()
        ? await this.jupiterService.executeSwap(
            await this.jupiterService.getSwapQuote(TOKEN_MINTS.USDC, TOKEN_MINTS.SOL, swapBaseUnits, 100),
            wallet,
          )
        : this.simulateSwap(estimatedSol, excessUsdc, "USDC_SOL");
      const outSol = this.jupiterService.lamportsToSol(result.outputAmount);
      return {
        success: true,
        action: proposal.action,
        agent: proposal.agent,
        target: proposal.target,
        transaction: {
          signature: result.signature,
          explorer: result.explorer,
          inputAmount: this.jupiterService.baseUnitsToUsdc(result.inputAmount),
          outputAmount: outSol,
        },
        message: `Rebalanced: bought ${outSol.toFixed(4)} SOL with ${excessUsdc.toFixed(2)} USDC`,
      };
    }
  }

  /**
   * Exit Position - Swap USDC back to SOL
   */
  private async executeExit(proposal: Proposal): Promise<ExecutionResult> {
    const wallet = this.solanaService.getWallet();
    const usdcBalance = await this.solanaService.getTokenBalance(TOKEN_MINTS.USDC);

    if (usdcBalance < 0.01) {
      return {
        success: true,
        action: proposal.action,
        agent: proposal.agent,
        target: proposal.target,
        message: "No USDC to exit, holding SOL",
      };
    }

    const amountBaseUnits = this.jupiterService.usdcToBaseUnits(usdcBalance);
    console.log(`   Swapping ${usdcBalance.toFixed(2)} USDC → SOL`);

    const estimatedSol = usdcBalance / 170;
    const result = this.isMainnet()
      ? await this.jupiterService.executeSwap(
          await this.jupiterService.getSwapQuote(TOKEN_MINTS.USDC, TOKEN_MINTS.SOL, amountBaseUnits, 100),
          wallet,
        )
      : this.simulateSwap(estimatedSol, usdcBalance, "USDC_SOL");
    const outSol = this.jupiterService.lamportsToSol(result.outputAmount);

    return {
      success: true,
      action: proposal.action,
      agent: proposal.agent,
      target: proposal.target,
      transaction: {
        signature: result.signature,
        explorer: result.explorer,
        inputAmount: this.jupiterService.baseUnitsToUsdc(result.inputAmount),
        outputAmount: outSol,
      },
      message: `Exited ${usdcBalance.toFixed(2)} USDC → ${outSol.toFixed(4)} SOL`,
    };
  }

  /**
   * Buy Trend - Swap 50% of USDC balance into SOL
   */
  private async executeBuy(proposal: Proposal): Promise<ExecutionResult> {
    const wallet = this.solanaService.getWallet();
    const usdcBalance = await this.solanaService.getTokenBalance(TOKEN_MINTS.USDC);

    if (usdcBalance < 1.0) {
      return {
        success: true,
        action: proposal.action,
        agent: proposal.agent,
        message: "Insufficient USDC to buy — holding SOL",
      };
    }

    const buyAmount = usdcBalance * 0.5;
    const swapBaseUnits = this.jupiterService.usdcToBaseUnits(buyAmount);
    console.log(`   Buy: swapping ${buyAmount.toFixed(2)} USDC → SOL`);

    const estimatedSol = buyAmount / 170;
    const result = this.isMainnet()
      ? await this.jupiterService.executeSwap(
          await this.jupiterService.getSwapQuote(TOKEN_MINTS.USDC, TOKEN_MINTS.SOL, swapBaseUnits, 100),
          wallet,
        )
      : this.simulateSwap(estimatedSol, buyAmount, "USDC_SOL");
    const outSol = this.jupiterService.lamportsToSol(result.outputAmount);

    return {
      success: true,
      action: proposal.action,
      agent: proposal.agent,
      target: proposal.target,
      transaction: {
        signature: result.signature,
        explorer: result.explorer,
        inputAmount: this.jupiterService.baseUnitsToUsdc(result.inputAmount),
        outputAmount: outSol,
      },
      message: `Bought SOL: swapped ${buyAmount.toFixed(2)} USDC → ${outSol.toFixed(4)} SOL`,
    };
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
