import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";

export interface SwapQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label?: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
}

export interface SwapResult {
  signature: string;
  inputAmount: number;
  outputAmount: number;
  explorer: string;
}

/**
 * Common Solana token mint addresses
 */
export const TOKEN_MINTS = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
} as const;

export class JupiterService {
  private connection: Connection;
  private apiUrl = "https://lite-api.jup.ag/swap/v1";
  private solPriceCache: { price: number; fetchedAt: number } | null = null;
  private readonly PRICE_CACHE_TTL_MS = 30_000;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Fetch live SOL/USD price from Jupiter Price API v2.
   * Caches result for 30s. Returns last cached price on failure; null if no cache.
   */
  async getSolPrice(): Promise<number | null> {
    const now = Date.now();
    if (
      this.solPriceCache &&
      now - this.solPriceCache.fetchedAt < this.PRICE_CACHE_TTL_MS
    ) {
      return this.solPriceCache.price;
    }

    try {
      const response = await fetch(
        `https://lite-api.jup.ag/price/v2?ids=${TOKEN_MINTS.SOL}`,
      );
      if (!response.ok) throw new Error(`Price API ${response.status}`);
      const data = (await response.json()) as {
        data: Record<string, { price: string }>;
      };
      const price = parseFloat(data.data[TOKEN_MINTS.SOL]?.price ?? "0");
      if (!price || isNaN(price)) throw new Error("Invalid price");
      this.solPriceCache = { price, fetchedAt: now };
      return price;
    } catch {
      return this.solPriceCache?.price ?? null;
    }
  }

  /**
   * Fetch a swap quote from Jupiter
   * @param inputMint - Token mint address to swap from
   * @param outputMint - Token mint address to swap to
   * @param amount - Amount in base units (lamports for SOL)
   * @param slippageBps - Slippage tolerance in basis points (50 = 0.5%)
   */
  async getSwapQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50,
  ): Promise<SwapQuote> {
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps: slippageBps.toString(),
      restrictIntermediateTokens: "true", // More stable routes
    });

    const response = await fetch(`${this.apiUrl}/quote?${params}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Jupiter quote failed: ${error}`);
    }

    return (await response.json()) as SwapQuote;
  }

  /**
   * Execute a swap transaction on Solana
   * @param quote - Quote response from getSwapQuote()
   * @param wallet - User's wallet keypair
   * @returns Transaction signature and details
   */
  async executeSwap(quote: SwapQuote, wallet: Keypair): Promise<SwapResult> {
    // Get serialized transaction from Jupiter
    const swapResponse = await fetch(`${this.apiUrl}/swap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: wallet.publicKey.toString(),
        wrapAndUnwrapSol: true, // Auto wrap/unwrap SOL
        dynamicComputeUnitLimit: true, // Let Jupiter estimate compute units
        prioritizationFeeLamports: {
          priorityLevelWithMaxLamports: {
            maxLamports: 10000000, // Max 0.01 SOL for priority fee
            priorityLevel: "medium",
          },
        },
      }),
    });

    if (!swapResponse.ok) {
      const error = await swapResponse.text();
      throw new Error(`Jupiter swap request failed: ${error}`);
    }

    const { swapTransaction } = (await swapResponse.json()) as {
      swapTransaction: string;
    };

    // Fetch blockhash for confirmation strategy (non-deprecated form)
    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash("confirmed");

    // Deserialize the transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    // Sign the transaction
    transaction.sign([wallet]);

    // Send the transaction
    const rawTransaction = transaction.serialize();
    const signature = await this.connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 2,
    });

    // Wait for confirmation using BlockheightBasedTransactionConfirmationStrategy
    await this.connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed",
    );

    // Parse amounts for result
    const inputAmount = Number(quote.inAmount);
    const outputAmount = Number(quote.outAmount);

    return {
      signature,
      inputAmount,
      outputAmount,
      explorer: `https://solscan.io/tx/${signature}`,
    };
  }

  /**
   * Helper: Convert SOL to lamports
   */
  solToLamports(sol: number): number {
    return Math.floor(sol * 1_000_000_000);
  }

  /**
   * Helper: Convert lamports to SOL
   */
  lamportsToSol(lamports: number): number {
    return lamports / 1_000_000_000;
  }

  /**
   * Helper: Convert USDC to base units (6 decimals)
   */
  usdcToBaseUnits(usdc: number): number {
    return Math.floor(usdc * 1_000_000);
  }

  /**
   * Helper: Convert USDC base units to USDC
   */
  baseUnitsToUsdc(baseUnits: number): number {
    return baseUnits / 1_000_000;
  }
}
