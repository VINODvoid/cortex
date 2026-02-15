import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

export class SolanaService {
  private connection: Connection;
  private wallet: Keypair;
  private network: "devnet" | "mainnet-beta";

  constructor(network: "devnet" | "mainnet-beta" = "devnet") {
    this.network = network;

    // Initalize connection to Solana RPC
    const rpc =
      network === "devnet"
        ? "https://api.devnet.solana.com"
        : "https://api.mainnet-beta.solana.com";
    this.connection = new Connection(rpc, "confirmed");
    this.wallet = Keypair.generate();
  }

  // Check the balance method
  async getBalance(address: PublicKey): Promise<number> {
    // Fetch balance in LAMPORTS
    const lamports = await this.connection.getBalance(address);

    // Convert LAMPORTS to SOL (1 SOL = 10 ^ 9 LAMPORTS;\
    return lamports / LAMPORTS_PER_SOL;
  }
  // Get the wallet address
  getWalletAddress(): string {
    return this.wallet.publicKey.toBase58();
  }

  // Request Airdrop
  async requestAirdrop(): Promise<string> {
    // request 2 SOL from devnet faucet
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
