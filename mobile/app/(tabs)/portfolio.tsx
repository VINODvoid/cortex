import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Plus,
  Minus,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useAppContext } from '../../context/AppContext';
import { useWallet } from '../../context/WalletContext';
import { api } from '../../services/api';
import { BrandHeader } from '../../components/BrandHeader';
import { SPECTRUM, RADIUS, VOID, INK, TYPOGRAPHY, BORDER, GLASS } from '../../constants/theme';

const { width } = Dimensions.get('window');

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PressableScale = ({ children, onPress, style }: any) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 10, stiffness: 200 }); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
};

const Logo = ({ size = 24, color = '#FFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size * (48 / 38)} viewBox="0 0 38 48">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m19 12.5c-4.1421 0-7.5-3.35786-7.5-7.5h-5c0 6.9036 5.5964 12.5 12.5 12.5s12.5-5.5964 12.5-12.5h-5c0 4.14214-3.3579 7.5-7.5 7.5zm-7.5 30.5c0-4.1421 3.3579-7.5 7.5-7.5s7.5 3.3579 7.5 7.5h5c0-6.9036-5.5964-12.5-12.5-12.5s-12.5 5.5964-12.5 12.5zm-4-19c0-4.1421-3.35786-7.5-7.5-7.5v-5c6.90356 0 12.5 5.5964 12.5 12.5s-5.59644 12.5-12.5 12.5v-5c4.14214 0 7.5-3.3579 7.5-7.5zm23 0c0-4.1421 3.3579-7.5 7.5-7.5v-5c-6.9036 0-12.5 5.5964-12.5 12.5s5.5964 12.5 12.5 12.5v-5c-4.1421 0-7.5-3.3579-7.5-7.5z"
      fill={color}
    />
  </Svg>
);

// ─── MODAL COMPONENT ──────────────────────────────────────────────────────────

interface VaultTxModalProps {
  visible: boolean;
  mode: 'deposit' | 'withdraw';
  vaultBalance: number;
  walletBalance: number | null;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<string>;
}

function VaultTxModal({
  visible,
  mode,
  vaultBalance,
  walletBalance,
  onClose,
  onConfirm,
}: VaultTxModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txSig, setTxSig] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const maxAmount = mode === 'deposit' ? (walletBalance ?? 0) : vaultBalance;
  const isDeposit = mode === 'deposit';
  const accentColor = isDeposit ? SPECTRUM.mint : SPECTRUM.violet;

  function reset() {
    setAmount('');
    setLoading(false);
    setTxSig(null);
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleConfirm() {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (parsed > maxAmount) {
      setError(`Max: ${maxAmount.toFixed(4)} SOL`);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const sig = await onConfirm(parsed);
      setTxSig(sig || 'sent');
    } catch (err: any) {
      setError(err?.message ?? 'Transaction failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Pressable style={modalStyles.overlay} onPress={handleClose}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <Pressable style={modalStyles.sheet} onPress={() => {}}>
            <View style={[modalStyles.topLine, { backgroundColor: accentColor }]} />
            <Text style={modalStyles.title}>{isDeposit ? 'Add Liquidity' : 'Withdraw Funds'}</Text>

            {!txSig ? (
              <>
                <View style={modalStyles.balanceRow}>
                  <Text style={modalStyles.balanceLabel}>{isDeposit ? 'WALLET' : 'VAULT'}</Text>
                  <Text style={modalStyles.balanceValue}>{maxAmount.toFixed(4)} SOL</Text>
                </View>

                <View style={modalStyles.inputRow}>
                  <TextInput
                    style={modalStyles.input}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor="rgba(255,255,255,0.1)"
                    keyboardType="decimal-pad"
                    editable={!loading}
                    autoFocus
                  />
                  <Pressable
                    onPress={() => setAmount(String(Math.max(0, maxAmount - 0.0001).toFixed(4)))}
                    style={[modalStyles.maxBtn, { borderColor: accentColor }]}
                  >
                    <Text style={[modalStyles.maxLabel, { color: accentColor }]}>MAX</Text>
                  </Pressable>
                </View>

                {error ? <Text style={modalStyles.errorText}>{error}</Text> : null}

                <View style={modalStyles.actionRow}>
                  <PressableScale
                    style={[modalStyles.confirmBtn, { backgroundColor: accentColor }]}
                    onPress={handleConfirm}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <Text style={modalStyles.confirmLabel}>AUTHORIZE</Text>
                    )}
                  </PressableScale>
                </View>
              </>
            ) : (
              <View style={modalStyles.successSection}>
                <Text style={[modalStyles.successTitle, { color: accentColor }]}>TRANSACTION SENT</Text>
                <PressableScale
                  style={[modalStyles.confirmBtn, { backgroundColor: accentColor, marginTop: 20, width: '100%' }]}
                  onPress={handleClose}
                >
                  <Text style={modalStyles.confirmLabel}>DISMISS</Text>
                </PressableScale>
              </View>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── CHART HELPERS ────────────────────────────────────────────────────────────

// Hardcoded demo curves per period — realistic-looking, always visible
const DEMO_PATHS: Record<string, { line: string; fill: string }> = {
  '1D': {
    line: "M0 42 C5 40,8 35,14 38 C20 41,22 30,28 28 C34 26,36 32,42 29 C48 26,50 20,56 22 C62 24,64 18,70 15 C76 12,80 18,86 14 C92 10,96 8,100 5",
    fill: "M0 42 C5 40,8 35,14 38 C20 41,22 30,28 28 C34 26,36 32,42 29 C48 26,50 20,56 22 C62 24,64 18,70 15 C76 12,80 18,86 14 C92 10,96 8,100 5 L100 60 L0 60 Z",
  },
  '1W': {
    line: "M0 50 C6 48,10 42,16 44 C22 46,24 36,30 32 C36 28,40 34,46 30 C52 26,54 18,60 20 C66 22,68 14,74 12 C80 10,84 16,90 10 C96 4,98 6,100 3",
    fill: "M0 50 C6 48,10 42,16 44 C22 46,24 36,30 32 C36 28,40 34,46 30 C52 26,54 18,60 20 C66 22,68 14,74 12 C80 10,84 16,90 10 C96 4,98 6,100 3 L100 60 L0 60 Z",
  },
  '1M': {
    line: "M0 55 C4 52,8 48,14 46 C20 44,22 50,28 44 C34 38,38 42,44 36 C50 30,52 34,58 28 C64 22,68 26,74 20 C80 14,84 18,90 12 C96 6,98 8,100 4",
    fill: "M0 55 C4 52,8 48,14 46 C20 44,22 50,28 44 C34 38,38 42,44 36 C50 30,52 34,58 28 C64 22,68 26,74 20 C80 14,84 18,90 12 C96 6,98 8,100 4 L100 60 L0 60 Z",
  },
  'ALL': {
    line: "M0 58 C6 55,10 52,16 50 C22 48,24 54,30 48 C36 42,40 46,46 38 C52 30,56 34,62 26 C68 18,72 22,78 16 C84 10,88 14,94 8 C98 4,99 5,100 3",
    fill: "M0 58 C6 55,10 52,16 50 C22 48,24 54,30 48 C36 42,40 46,46 38 C52 30,56 34,62 26 C68 18,72 22,78 16 C84 10,88 14,94 8 C98 4,99 5,100 3 L100 60 L0 60 Z",
  },
};

function buildChartPaths(
  points: Array<{ t: number; v: number }>,
  viewW = 100,
  viewH = 60,
): { line: string; fill: string } | null {
  if (points.length < 2) return null;

  const minV = Math.min(...points.map((p) => p.v));
  const maxV = Math.max(...points.map((p) => p.v));
  const vRange = maxV - minV || 1;
  const pad = viewH * 0.1;

  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * viewW,
    y: viewH - pad - ((p.v - minV) / vRange) * (viewH - pad * 2),
  }));

  // Smooth line using cubic bezier control points
  let d = `M${coords[0].x.toFixed(2)} ${coords[0].y.toFixed(2)}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C${cpx.toFixed(2)} ${prev.y.toFixed(2)},${cpx.toFixed(2)} ${curr.y.toFixed(2)},${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
  }

  const lastX = coords[coords.length - 1].x.toFixed(2);
  const fill = `${d} L${lastX} ${viewH} L0 ${viewH} Z`;

  return { line: d, fill };
}

export default function PortfolioScreen() {
  const { portfolio, vault, refreshVault, withdrawFromVault, refresh, solPrice } = useAppContext();
  const { connected, publicKey, balance, depositToVault } = useWallet();

  const [period, setPeriod] = useState('1D');
  const [depositVisible, setDepositVisible] = useState(false);
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [historyPoints, setHistoryPoints] = useState<Array<{ t: number; v: number }>>([]);

  useEffect(() => {
    api.getPortfolioHistory(period)
      .then(setHistoryPoints)
      .catch(() => setHistoryPoints([]));
  }, [period]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const vaultBalance = vault?.balance ?? 0;
  const solUsd = portfolio.sol * solPrice;
  const vaultUsd = vaultBalance * solPrice;

  async function handleDeposit(amountSol: number): Promise<string> {
    let address = vault?.address;
    if (!address) {
      const fresh = await api.getVault();
      address = fresh.address;
      if (!address) throw new Error('Vault address unavailable');
    }
    const sig = await depositToVault(address, amountSol);
    await refreshVault();
    return sig;
  }

  async function handleWithdraw(amountSol: number): Promise<string> {
    if (!publicKey) throw new Error('Wallet not connected');
    return withdrawFromVault(publicKey.toBase58(), amountSol);
  }

  return (
    <View style={styles.container}>
      <BrandHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={SPECTRUM.mint}
            colors={[SPECTRUM.mint]}
            progressBackgroundColor="#000"
          />
        }
      >
        {/* ─── Performance Card ─── */}
        <Animated.View entering={FadeInDown.duration(800).delay(100)} style={styles.section}>
          <View style={styles.cardContainer}>
            <Text style={styles.overline}>PORTFOLIO PERFORMANCE</Text>
            
            <Text style={styles.heroNum}>
              ${(portfolio.totalUsd + vaultUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View style={styles.metaRow}>
              <View style={[styles.alphaBadge, { backgroundColor: portfolio.change24h >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)' }]}>
                <TrendingUp size={10} color={portfolio.change24h >= 0 ? SPECTRUM.mint : SPECTRUM.coral} />
                <Text style={[styles.alphaText, { color: portfolio.change24h >= 0 ? SPECTRUM.mint : SPECTRUM.coral }]}>
                  {portfolio.change24h >= 0 ? '+' : ''}{portfolio.change24h.toFixed(2)}%
                </Text>
              </View>
              {solPrice > 0 && (
                <Text style={styles.solPriceLabel}>SOL ${solPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              )}
            </View>

            <View style={styles.chartArea}>
              <View style={styles.periodPicker}>
                {['1D', '1W', '1M', 'ALL'].map((p) => (
                  <Pressable key={p} onPress={() => setPeriod(p)} style={[styles.periodBtn, period === p && styles.periodBtnActive]}>
                    <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
                  </Pressable>
                ))}
              </View>
              
              <View style={styles.svgWrapper}>
                {(() => {
                  const realPaths = buildChartPaths(historyPoints);
                  const demoPaths = DEMO_PATHS[period] ?? DEMO_PATHS['1M'];
                  const linePath = realPaths?.line ?? demoPaths.line;
                  const fillPath = realPaths?.fill ?? demoPaths.fill;
                  const color = portfolio.change24h >= 0 ? SPECTRUM.mint : SPECTRUM.coral;
                  return (
                    <Svg height="80" width="100%" viewBox="0 0 100 60" preserveAspectRatio="none">
                      <Defs>
                        <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor={color} stopOpacity="0.15" />
                          <Stop offset="1" stopColor={color} stopOpacity="0" />
                        </LinearGradient>
                      </Defs>
                      <Path
                        d={linePath}
                        fill="none"
                        stroke={color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <Path d={fillPath} fill="url(#chartGrad)" />
                    </Svg>
                  );
                })()}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ─── Vault Card (The Module) ─── */}
        <Animated.View entering={FadeInDown.duration(800).delay(200)} style={styles.section}>
          <View style={[styles.cardContainer, { backgroundColor: VOID.rise1, borderColor: BORDER.mid }]}>
            <View style={styles.vaultHeader}>
              <View style={styles.vaultStatusRow}>
                <ShieldCheck size={14} color={SPECTRUM.mint} />
                <Text style={styles.vaultStatusText}>SECURED VAULT</Text>
              </View>
              <Logo size={20} color={INK.ghost} />
            </View>

            <View style={styles.vaultBalanceContainer}>
              <Text style={styles.vaultValueMain}>
                {vaultBalance.toFixed(4)} <Text style={styles.vaultSymbolSmall}>SOL</Text>
              </Text>
              <Text style={styles.vaultUsdSub}>≈ ${vaultUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>

            <View style={styles.vaultActionGrid}>
              <PressableScale style={[styles.vaultModuleBtn, styles.vaultPrimary]} onPress={() => setDepositVisible(true)}>
                <View style={styles.btnIconCircle}><Plus size={14} color="#000" strokeWidth={3} /></View>
                <Text style={styles.vaultPrimaryText}>DEPOSIT</Text>
              </PressableScale>
              
              <PressableScale style={[styles.vaultModuleBtn, styles.vaultSecondary]} onPress={() => setWithdrawVisible(true)}>
                <Text style={styles.vaultSecondaryText}>WITHDRAW</Text>
                <ArrowUpRight size={14} color={INK.secondary} strokeWidth={2} />
              </PressableScale>
            </View>
          </View>
        </Animated.View>

        {/* ─── Asset Breakdown ─── */}
        <Animated.View entering={FadeInDown.duration(800).delay(300)} style={styles.assetSection}>
          <Text style={styles.sectionLabel}>ASSET BREAKDOWN</Text>
          <View style={styles.assetList}>
            {[
              { name: 'SOLANA', symbol: 'SOL', amount: portfolio.sol, value: solUsd, icon: require('../../assets/solana.png') },
              { name: 'USD COIN', symbol: 'USDC', amount: portfolio.usdc, value: portfolio.usdc, icon: require('../../assets/usd-coin.png') }
            ].map((asset, i, arr) => (
              <View key={i} style={[styles.assetItem, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.assetLeading}>
                  <Image source={asset.icon} style={styles.assetIconImage} />
                  <View>
                    <Text style={styles.assetName}>{asset.name}</Text>
                    <Text style={styles.assetSub}>{asset.amount.toFixed(2)} {asset.symbol}</Text>
                  </View>
                </View>
                <Text style={styles.assetPrice}>${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

      </ScrollView>

      <VaultTxModal visible={depositVisible} mode="deposit" vaultBalance={vaultBalance} walletBalance={balance} onClose={() => setDepositVisible(false)} onConfirm={handleDeposit} />
      <VaultTxModal visible={withdrawVisible} mode="withdraw" vaultBalance={vaultBalance} walletBalance={balance} onClose={() => setWithdrawVisible(false)} onConfirm={handleWithdraw} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: VOID.base },
  scrollContent: { paddingHorizontal: 28, paddingTop: 10 },

  // Shared Card Styles
  section: { marginBottom: 20 },
  cardContainer: {
    padding: 24,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: BORDER.faint,
    backgroundColor: GLASS.g0,
  },

  // Typography Precision
  overline: { ...TYPOGRAPHY.overline, color: INK.tertiary, marginBottom: 12 },
  heroNum: { ...TYPOGRAPHY.heroNum, color: INK.primary },
  
  // Performance Section
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 24 },
  alphaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.xs },
  alphaText: { fontSize: 12, fontWeight: '700' as const },
  solPriceLabel: { color: INK.tertiary, fontSize: 11, fontWeight: '600' as const },
  
  chartArea: { marginTop: 0 },
  periodPicker: { flexDirection: 'row', backgroundColor: GLASS.g1, borderRadius: RADIUS.sm, padding: 3, gap: 2, marginBottom: 20, alignSelf: 'flex-start' },
  periodBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.xs },
  periodBtnActive: { backgroundColor: GLASS.g3 },
  periodText: { ...TYPOGRAPHY.caption2, color: INK.tertiary },
  periodTextActive: { color: INK.primary },
  svgWrapper: { height: 80, width: '100%', overflow: 'hidden' },

  // Vault Module Redesign
  vaultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  vaultStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vaultStatusText: { ...TYPOGRAPHY.micro, color: SPECTRUM.mint },
  
  vaultBalanceContainer: { marginBottom: 28 },
  vaultValueMain: { ...TYPOGRAPHY.title2, color: INK.primary, fontSize: 32 },
  vaultSymbolSmall: { ...TYPOGRAPHY.title3, color: INK.ghost },
  vaultUsdSub: { ...TYPOGRAPHY.subhead, color: INK.tertiary, marginTop: 4 },

  vaultActionGrid: { flexDirection: 'row', gap: 12 },
  vaultModuleBtn: { flex: 1, height: 58, borderRadius: RADIUS.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  vaultPrimary: { backgroundColor: INK.primary },
  vaultPrimaryText: { ...TYPOGRAPHY.caption1, color: VOID.base, fontWeight: '900' },
  btnIconCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  
  vaultSecondary: { backgroundColor: GLASS.g2, borderWidth: 1, borderColor: BORDER.subtle },
  vaultSecondaryText: { ...TYPOGRAPHY.caption1, color: INK.secondary, fontWeight: '700' },

  // Asset Breakdown
  assetSection: { marginBottom: 40, marginTop: 12 },
  sectionLabel: { ...TYPOGRAPHY.overline, color: INK.tertiary, marginBottom: 16 },
  assetList: { backgroundColor: GLASS.g0, borderRadius: RADIUS.lg, paddingHorizontal: 20, borderWidth: 1, borderColor: BORDER.faint },
  assetItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: BORDER.faint },
  assetLeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  assetIconImage: { width: 24, height: 24, borderRadius: 12 },
  assetDot: { width: 6, height: 6, borderRadius: 3 },
  assetName: { ...TYPOGRAPHY.headline, color: INK.primary, fontSize: 14 },
  assetSub: { ...TYPOGRAPHY.subhead, color: INK.tertiary },
  assetPrice: { ...TYPOGRAPHY.subhead, color: INK.primary, fontWeight: '700' },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: VOID.rise2,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: 28,
    paddingBottom: 60,
    borderTopWidth: 1,
    borderColor: BORDER.strong,
  },
  topLine: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 24, opacity: 0.5 },
  title: { ...TYPOGRAPHY.title3, color: INK.primary, marginBottom: 24 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  balanceLabel: { ...TYPOGRAPHY.micro, color: INK.tertiary },
  balanceValue: { ...TYPOGRAPHY.subhead, color: INK.secondary, fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  input: { flex: 1, height: 64, backgroundColor: GLASS.g1, borderRadius: RADIUS.md, paddingHorizontal: 20, color: INK.primary, fontSize: 24, fontWeight: '700' },
  maxBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.sm, borderWidth: 1 },
  maxLabel: { ...TYPOGRAPHY.micro },
  errorText: { ...TYPOGRAPHY.footnote, color: SPECTRUM.coral, marginBottom: 16 },
  actionRow: { marginTop: 8 },
  confirmBtn: { height: 60, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  confirmLabel: { ...TYPOGRAPHY.headline, color: VOID.base, fontWeight: '900' },
  successSection: { alignItems: 'center', paddingVertical: 20 },
  successTitle: { ...TYPOGRAPHY.title3, color: INK.primary },
});
