import { Connection } from "@solana/web3.js";

export interface Pool {
  name: string;
  apy: number;
  tvl: number;
}

export class PoolDataService {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }
  async fetchOrcaPools(): Promise<Pool[]> {
    return [
      {
        name: "Orca SOL/USDC",
        apy: 12.5,
        tvl: 87000000,
      },
      {
        name: "Orca ORCA/SOL",
        apy: 24.3,
        tvl: 12000000,
      },
    ];
  }
  async fetchMarinadePools(): Promise<Pool[]> {
    return [{ name: "Marinade Native Staking", apy: 6.8, tvl: 150000000 }];
  }
  async fetchKaminoPools(): Promise<Pool[]> {
    return [
      { name: "Kamino SOL Vault", apy: 8.2, tvl: 45000000 },
      { name: "Kamino USDC Vault", apy: 5.5, tvl: 32000000 },
    ];
  }
  async getAllPools(): Promise<Pool[]> {
    const orca = await this.fetchOrcaPools();
    const marinade = await this.fetchMarinadePools();
    const kamino = await this.fetchKaminoPools();

    return [...orca, ...marinade, ...kamino];
  }
}
