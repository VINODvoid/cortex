import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
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

export class SolanaService {
  private connection: Connection;
  private wallet: Keypair;
  private network: "devnet" | "mainnet-beta";

  constructor(network: "devnet" | "mainnet-beta" = "devnet") {
    this.network = network;

    const rpc =
      process.env.SOLANA_RPC_URL ??
      (network === "devnet"
        ? "https://api.devnet.solana.com"
        : "https://api.mainnet-beta.solana.com");

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

  async requestAirdrop(): Promise<string> {
    const signature = await this.connection.requestAirdrop(
      this.wallet.publicKey,
      2 * LAMPORTS_PER_SOL,
    );
    await this.connection.confirmTransaction(signature);
    return signature;
  }

  getWallet(): Keypair {
    return this.wallet;
  }

  getConnection(): Connection {
    return this.connection;
  }
}
