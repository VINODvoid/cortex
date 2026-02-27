import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

/**
 * Load a Keypair from SOLANA_PRIVATE_KEY env var.
 * Accepts both JSON byte-array format ([1,2,3,...]) and base58 format.
 * Falls back to an ephemeral key with a loud warning when the var is unset.
 */
function loadWallet(): Keypair {
  const raw = process.env.SOLANA_PRIVATE_KEY;

  if (!raw) {
    console.warn(
      "[WARN] SOLANA_PRIVATE_KEY is not set — generating an ephemeral wallet.\n" +
        "       Any funds sent to this address will be permanently lost on restart.\n" +
        "       Set SOLANA_PRIVATE_KEY in .env to persist the wallet.",
    );
    return Keypair.generate();
  }

  const trimmed = raw.trim();

  if (trimmed.startsWith("[")) {
    // JSON byte-array: e.g. [12,34,56,...]
    const bytes = JSON.parse(trimmed) as number[];
    return Keypair.fromSecretKey(Uint8Array.from(bytes));
  }

  // Base58-encoded secret key (Phantom export format)
  return Keypair.fromSecretKey(bs58.decode(trimmed));
}

type Network = "devnet" | "testnet" | "mainnet-beta";

function rpcUrl(network: Network): string {
  switch (network) {
    case "mainnet-beta": return "https://api.mainnet-beta.solana.com";
    case "testnet": return "https://api.testnet.solana.com";
    default: return "https://api.devnet.solana.com";
  }
}

export class SolanaService {
  private connection: Connection;
  private wallet: Keypair;
  private network: Network;

  constructor(network: Network = "devnet") {
    this.network = (process.env.SOLANA_NETWORK as Network | undefined) ?? network;

    const rpc = process.env.SOLANA_RPC_URL ?? rpcUrl(this.network);

    this.connection = new Connection(rpc, "confirmed");
    this.wallet = loadWallet();
  }

  async getBalance(address: PublicKey): Promise<number> {
    const lamports = await this.connection.getBalance(address);
    return lamports / LAMPORTS_PER_SOL;
  }

  getWalletAddress(): string {
    return this.wallet.publicKey.toBase58();
  }

  getNetwork(): string {
    return this.network;
  }

  isMainnet(): boolean {
    return this.network === "mainnet-beta";
  }

  async getTokenBalance(mintAddress: string): Promise<number> {
    try {
      const mint = new PublicKey(mintAddress);
      const accounts = await this.connection.getTokenAccountsByOwner(
        this.wallet.publicKey,
        { mint },
      );
      if (accounts.value.length === 0) return 0;
      const balance = await this.connection.getTokenAccountBalance(accounts.value[0].pubkey);
      return balance.value.uiAmount ?? 0;
    } catch {
      return 0;
    }
  }

  async requestAirdrop(): Promise<string> {
    const signature = await this.connection.requestAirdrop(
      this.wallet.publicKey,
      2 * LAMPORTS_PER_SOL,
    );
    await this.connection.confirmTransaction(signature);
    return signature;
  }

  async sendSol(toAddress: string, amountSol: number): Promise<string> {
    const to = new PublicKey(toAddress);
    const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);
    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash();
    const tx = new Transaction({ feePayer: this.wallet.publicKey, blockhash, lastValidBlockHeight })
      .add(
        SystemProgram.transfer({
          fromPubkey: this.wallet.publicKey,
          toPubkey: to,
          lamports,
        }),
      );
    return sendAndConfirmTransaction(this.connection, tx, [this.wallet]);
  }

  getWallet(): Keypair {
    return this.wallet;
  }

  getConnection(): Connection {
    return this.connection;
  }
}
