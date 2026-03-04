import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import type is erased at runtime — no native module needed for the type
import type { Web3MobileWallet } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import {
  PublicKey,
  Connection,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { api } from "../services/api";

// Lazy-load the native MWA transact — unavailable in Expo Go / simulators
type TransactFn = (callback: (wallet: Web3MobileWallet) => Promise<void>) => Promise<void>;
let _transact: TransactFn | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  _transact = require("@solana-mobile/mobile-wallet-adapter-protocol-web3js").transact;
} catch {
  // Native module not registered — wallet features unavailable (demo mode only)
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const STORAGE = {
  AUTH_TOKEN:  "cortex_auth_token",
  PUBLIC_KEY:  "cortex_public_key",   // base58
  WALLET_LABEL: "cortex_wallet_label",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface WalletContextValue {
  connected: boolean;
  connecting: boolean;
  /** True while loading persisted session from storage on app start */
  isRestoring: boolean;
  publicKey: PublicKey | null;
  walletLabel: string;
  balance: number | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  depositToVault: (vaultAddress: string, amountSol: number) => Promise<string>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const APP_IDENTITY = {
  name: "CORTEX",
  uri: "https://raw.githubusercontent.com/VINODvoid/cortex/main/",
  icon: "mobile/assets/icon.png",
};

const CONNECTION = new Connection(clusterApiUrl("devnet"), "confirmed");

// ─── Context ─────────────────────────────────────────────────────────────────

const WalletContext = createContext<WalletContextValue>({
  connected: false,
  connecting: false,
  isRestoring: true,
  publicKey: null,
  walletLabel: "",
  balance: null,
  connect: async () => {},
  disconnect: async () => {},
  refreshBalance: async () => {},
  depositToVault: async () => "",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function decodeAddress(addr: string | Uint8Array): PublicKey {
  if (typeof addr === "string") {
    return new PublicKey(Buffer.from(addr, "base64")); // MWA returns base64-encoded address
  }
  return new PublicKey(Buffer.from(addr));
}

async function persistSession(
  authToken: string,
  publicKey: PublicKey,
  label: string,
) {
  await Promise.all([
    AsyncStorage.setItem(STORAGE.AUTH_TOKEN, authToken),
    AsyncStorage.setItem(STORAGE.PUBLIC_KEY, publicKey.toBase58()),
    AsyncStorage.setItem(STORAGE.WALLET_LABEL, label),
  ]);
}

async function clearSession() {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE.AUTH_TOKEN),
    AsyncStorage.removeItem(STORAGE.PUBLIC_KEY),
    AsyncStorage.removeItem(STORAGE.WALLET_LABEL),
  ]);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [walletLabel, setWalletLabel] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // ── Restore persisted session on mount (no Phantom required) ──────────────
  useEffect(() => {
    async function restore() {
      try {
        const [storedToken, storedPk, storedLabel] = await Promise.all([
          AsyncStorage.getItem(STORAGE.AUTH_TOKEN),
          AsyncStorage.getItem(STORAGE.PUBLIC_KEY),
          AsyncStorage.getItem(STORAGE.WALLET_LABEL),
        ]);

        if (storedToken && storedPk) {
          const pk = new PublicKey(storedPk); // base58 → PublicKey
          setAuthToken(storedToken);
          setPublicKey(pk);
          setWalletLabel(storedLabel ?? "Wallet");
          setConnected(true);

          // Refresh balance from RPC (no Phantom needed)
          try {
            const lamports = await CONNECTION.getBalance(pk);
            setBalance(lamports / LAMPORTS_PER_SOL);
          } catch {
            // Non-fatal — balance will refresh on next poll
          }
        }
      } catch {
        // Storage read failed — start fresh
      } finally {
        setIsRestoring(false);
      }
    }

    restore();
  }, []);

  // ── Balance refresh ────────────────────────────────────────────────────────

  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;
    try {
      const lamports = await CONNECTION.getBalance(publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch {
      // non-fatal
    }
  }, [publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance();
      const id = setInterval(refreshBalance, 30000);
      return () => clearInterval(id);
    }
  }, [connected, publicKey, refreshBalance]);

  // ── Connect ───────────────────────────────────────────────────────────────

  const connect = useCallback(async () => {
    if (connected || connecting) return;
    if (!_transact) {
      console.warn("[WalletContext] Native MWA module unavailable — demo mode only");
      return;
    }
    setConnecting(true);
    let sessionData: { pk: PublicKey; token: string; label: string } | null = null;
    try {
      await _transact(async (wallet: Web3MobileWallet) => {
        const { accounts, auth_token, wallet_uri_base } = await wallet.authorize({
          cluster: "devnet",
          identity: APP_IDENTITY,
          ...(authToken ? { auth_token: authToken } : {}),
        });

        const account = accounts[0];
        if (!account) throw new Error("No account returned from wallet");

        const pk = decodeAddress(account.address);
        const label = account.label ?? wallet_uri_base ?? "Wallet";

        // Capture data — no AsyncStorage inside Phantom session
        sessionData = { pk, token: auth_token, label };

        setPublicKey(pk);
        setAuthToken(auth_token);
        setWalletLabel(label);
        setConnected(true);

        try {
          const lamports = await CONNECTION.getBalance(pk);
          setBalance(lamports / LAMPORTS_PER_SOL);
        } catch {}
      });

      // Persist AFTER session closes
      if (sessionData) {
        const { pk, token, label } = sessionData;
        persistSession(token, pk, label).catch(() => {});
      }
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      if (
        !msg.includes("cancelled by user") &&
        !msg.includes("User cancelled") &&
        !msg.includes("dismissed")
      ) {
        console.warn("[WalletContext] connect failed:", err);
      }
    } finally {
      setConnecting(false);
    }
  }, [connected, connecting, authToken]);

  // ── Disconnect ────────────────────────────────────────────────────────────

  const disconnect = useCallback(async () => {
    // Clear persisted session first so a crash mid-deauth doesn't leave stale data
    await clearSession();

    if (connected && authToken && _transact) {
      try {
        await _transact!(async (wallet: Web3MobileWallet) => {
          await wallet.deauthorize({ auth_token: authToken });
        });
      } catch {
        // Even if deauth fails, clear local state
      }
    }

    setConnected(false);
    setPublicKey(null);
    setBalance(null);
    setWalletLabel("");
    setAuthToken(null);
  }, [connected, authToken]);

  // ── Deposit to vault ──────────────────────────────────────────────────────

  const depositToVault = useCallback(
    async (vaultAddress: string, amountSol: number): Promise<string> => {
      if (!_transact) throw new Error("Wallet not connected");

      // Fetch blockhash via backend — avoids hitting public Solana RPC from mobile.
      const { blockhash, lastValidBlockHeight } = await api.getBlockhash();

      let signedTxBytes: Uint8Array | null = null;
      let newAuthToken: string | null = null;

      await _transact(async (wallet: Web3MobileWallet) => {
        const { accounts, auth_token } = await wallet.authorize({
          cluster: "devnet",
          identity: APP_IDENTITY,
          ...(authToken ? { auth_token: authToken } : {}),
        });
        newAuthToken = auth_token;

        const account = accounts[0];
        if (!account) throw new Error("No accounts authorized in this session");
        const signerPk = decodeAddress(account.address);

        const tx = new Transaction({
          feePayer: signerPk,
          blockhash,
          lastValidBlockHeight,
        }).add(
          SystemProgram.transfer({
            fromPubkey: signerPk,
            toPubkey: new PublicKey(vaultAddress),
            lamports: Math.round(amountSol * LAMPORTS_PER_SOL),
          }),
        );

        // Sign only — backend handles submission so mobile never hits Solana RPC.
        const [signedTx] = await wallet.signTransactions({ transactions: [tx] });
        signedTxBytes = new Uint8Array(signedTx.serialize());
      });

      // Persist refreshed auth token AFTER Phantom session is closed.
      if (newAuthToken) {
        setAuthToken(newAuthToken);
        AsyncStorage.setItem(STORAGE.AUTH_TOKEN, newAuthToken).catch(() => {});
      }

      if (!signedTxBytes) throw new Error("Transaction signing failed");

      // Submit via backend — backend relays to Solana and confirms.
      const txBase64 = Buffer.from(signedTxBytes).toString("base64");
      const result = await api.submitDeposit(txBase64);
      if (result.error) throw new Error(result.error);

      return result.signature ?? "";
    },
    [authToken],
  );

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        isRestoring,
        publicKey,
        walletLabel,
        balance,
        connect,
        disconnect,
        refreshBalance,
        depositToVault,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWallet(): WalletContextValue {
  return useContext(WalletContext);
}
