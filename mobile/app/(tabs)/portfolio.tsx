import React, { useState, useEffect, useRef } from 'react';
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
  PanResponder,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Line,
  Circle,
} from 'react-native-svg';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useAppContext } from '../../context/AppContext';
import { useWallet } from '../../context/WalletContext';
import { api } from '../../services/api';
import { BrandHeader } from '../../components/BrandHeader';
import { SPECTRUM, RADIUS, VOID } from '../../constants/theme';

const { width } = Dimensions.get('window');

// ─── CHART LAYOUT ─────────────────────────────────────────────────────────────
const SCREEN_PAD     = 28;
const CARD_PAD       = 20;
const CHART_W        = width - SCREEN_PAD * 2 - CARD_PAD * 2;
const CHART_H        = 130;
const PILL_TRACK_PAD = 3;
const PILL_W         = (CHART_W - PILL_TRACK_PAD * 2) / 4;
const PILL_H         = 28;

const PERIODS = ['1D', '1W', '1M', 'ALL'] as const;
type Period = typeof PERIODS[number];

const PERIOD_DATA: Record<Period, number[]> = {
  '1D': [52, 48, 55, 50, 58, 54, 62, 57, 65, 60, 68, 62, 70, 64],
  '1W': [38, 44, 40, 52, 47, 59, 54, 66, 61, 72, 67, 75, 70, 78],
  '1M': [24, 33, 28, 44, 39, 54, 49, 63, 58, 71, 66, 75, 70, 78],
  'ALL': [10, 22, 17, 32, 27, 44, 50, 62, 57, 69, 64, 73, 68, 78],
};

// ─── CHART PATH HELPERS ───────────────────────────────────────────────────────

function buildPath(data: number[], w: number, h: number, pad = 16): string {
  const n   = data.length;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (n - 1)) * w,
    y: h - pad - ((v - min) / rng) * (h - pad * 2),
  }));
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const cp1x = pts[i].x     + (pts[i + 1].x - pts[i].x) * 0.45;
    const cp2x = pts[i + 1].x - (pts[i + 1].x - pts[i].x) * 0.45;
    d += ` C${cp1x.toFixed(1)},${pts[i].y.toFixed(1)} ${cp2x.toFixed(1)},${pts[i + 1].y.toFixed(1)} ${pts[i + 1].x.toFixed(1)},${pts[i + 1].y.toFixed(1)}`;
  }
  return d;
}

function getPointAtX(x: number, data: number[], w: number, h: number, pad = 16) {
  const n   = data.length;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;
  const idx = Math.max(0, Math.min(Math.round((x / w) * (n - 1)), n - 1));
  const v   = data[idx];
  return {
    x:     (idx / (n - 1)) * w,
    y:     h - pad - ((v - min) / rng) * (h - pad * 2),
    value: v,
  };
}

// ─── STATIC CHART SVG ─────────────────────────────────────────────────────────
// Rendered statically — animation is done via FadeIn on the parent View key

function ChartSvg({ data, accent }: { data: number[]; accent: string }) {
  const linePath = buildPath(data, CHART_W, CHART_H);
  const fillPath = `${linePath} L${CHART_W},${CHART_H} L0,${CHART_H} Z`;
  return (
    <Svg width={CHART_W} height={CHART_H}>
      <Defs>
        <SvgLinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0"    stopColor={accent} stopOpacity="0.30" />
          <Stop offset="0.55" stopColor={accent} stopOpacity="0.07" />
          <Stop offset="1"    stopColor={accent} stopOpacity="0"    />
        </SvgLinearGradient>
      </Defs>

      {/* Horizontal grid references */}
      {[0.28, 0.55, 0.80].map((frac) => (
        <Line
          key={frac}
          x1={0} y1={CHART_H * frac}
          x2={CHART_W} y2={CHART_H * frac}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
          strokeDasharray="2,7"
        />
      ))}

      {/* Area fill */}
      <Path d={fillPath} fill="url(#areaFill)" />

      {/* Outer glow */}
      <Path
        d={linePath}
        fill="none"
        stroke={accent}
        strokeWidth="9"
        strokeLinecap="round"
        opacity="0.10"
      />

      {/* Main line */}
      <Path
        d={linePath}
        fill="none"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── PREMIUM CHART (touch + animated dot) ─────────────────────────────────────

interface ChartProps {
  data:      number[];
  totalUsd:  number;
  accent?:   string;
}

function PremiumChart({ data, totalUsd, accent = SPECTRUM.mint }: ChartProps) {
  const dotAlpha = useSharedValue(0);
  const dotPulse = useSharedValue(1);
  const [touch, setTouch] = useState<{ x: number; y: number; value: number } | null>(null);

  // Mutable ref so PanResponder always reads latest data without re-creating
  const ref = useRef({ data, setTouch });
  ref.current = { data, setTouch };

  const endPt = getPointAtX(CHART_W, data, CHART_W, CHART_H);

  // Pulsing dot animation — fires on mount & when data changes (via remount from key)
  useEffect(() => {
    dotAlpha.value = 0;
    dotPulse.value = 1;
    // Delay matches the FadeIn duration (350ms) on the parent
    dotAlpha.value = withDelay(320, withTiming(1, { duration: 280 }));
    dotPulse.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1.9, { duration: 1000, easing: Easing.out(Easing.quad) }),
          withTiming(1.0, { duration: 1000, easing: Easing.in(Easing.quad)  }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const dotRingStyle = useAnimatedStyle(() => ({
    opacity:   dotAlpha.value * 0.24,
    transform: [{ scale: dotPulse.value }],
  }));
  const dotCoreStyle = useAnimatedStyle(() => ({
    opacity: dotAlpha.value,
  }));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: (evt) => {
        Haptics.selectionAsync();
        const x  = Math.max(0, Math.min(evt.nativeEvent.locationX, CHART_W));
        ref.current.setTouch(getPointAtX(x, ref.current.data, CHART_W, CHART_H));
      },
      onPanResponderMove: (evt) => {
        const x  = Math.max(0, Math.min(evt.nativeEvent.locationX, CHART_W));
        ref.current.setTouch(getPointAtX(x, ref.current.data, CHART_W, CHART_H));
      },
      onPanResponderRelease:   () => ref.current.setTouch(null),
      onPanResponderTerminate: () => ref.current.setTouch(null),
    }),
  ).current;

  const touchUsd = touch ? (() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const t   = (touch.value - min) / (max - min || 1);
    return Math.round(totalUsd * (0.80 + t * 0.40));
  })() : null;

  const TIP_W = 76;

  return (
    <View style={{ height: CHART_H, width: CHART_W }} {...panResponder.panHandlers}>
      {/* Chart SVG — static, no clip trick needed */}
      <ChartSvg data={data} accent={accent} />

      {/* Pulsing ring — Animated.View, guaranteed to work */}
      <Animated.View
        style={[{
          position: 'absolute',
          width: 20, height: 20, borderRadius: 10,
          backgroundColor: accent,
          left: endPt.x - 10,
          top:  endPt.y - 10,
        }, dotRingStyle]}
      />
      {/* Solid core dot */}
      <Animated.View
        style={[{
          position: 'absolute',
          width: 7, height: 7, borderRadius: 3.5,
          backgroundColor: accent,
          left: endPt.x - 3.5,
          top:  endPt.y - 3.5,
        }, dotCoreStyle]}
      />

      {/* Touch cursor layer */}
      {touch && (
        <Svg width={CHART_W} height={CHART_H} style={StyleSheet.absoluteFillObject}>
          <Line
            x1={touch.x} y1={0}
            x2={touch.x} y2={CHART_H}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1}
          />
          <Circle cx={touch.x} cy={touch.y} r={14} fill={accent} opacity={0.10} />
          <Circle cx={touch.x} cy={touch.y} r={5}  fill={accent} />
        </Svg>
      )}

      {/* Price tooltip */}
      {touch && touchUsd !== null && (
        <View style={[chartStyles.tooltip, {
          left: Math.max(0, Math.min(touch.x - TIP_W / 2, CHART_W - TIP_W)),
          top:  Math.max(2, touch.y - 36),
        }]}>
          <Text style={chartStyles.tooltipText}>${touchUsd.toLocaleString()}</Text>
        </View>
      )}
    </View>
  );
}

// ─── PERIOD PICKER ────────────────────────────────────────────────────────────

function PeriodPicker({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const pillX = useSharedValue(PERIODS.indexOf(value) * PILL_W);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  function press(p: Period) {
    pillX.value = withSpring(PERIODS.indexOf(p) * PILL_W, {
      damping: 22, stiffness: 320, mass: 0.8,
    });
    Haptics.selectionAsync();
    onChange(p);
  }

  return (
    <View style={pickerStyles.track}>
      <Animated.View style={[pickerStyles.pill, pillStyle]} />
      {PERIODS.map((p) => (
        <Pressable key={p} style={pickerStyles.btn} onPress={() => press(p)}>
          <Text style={[pickerStyles.label, value === p && pickerStyles.labelActive]}>{p}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PressableScale = ({ children, onPress, style }: any) => {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 10, stiffness: 200 }); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
      style={[style, aStyle]}
    >
      {children}
    </AnimatedPressable>
  );
};

const Logo = ({ size = 24, color = '#FFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size * (48 / 38)} viewBox="0 0 38 48">
    <Path
      fillRule="evenodd" clipRule="evenodd"
      d="m19 12.5c-4.1421 0-7.5-3.35786-7.5-7.5h-5c0 6.9036 5.5964 12.5 12.5 12.5s12.5-5.5964 12.5-12.5h-5c0 4.14214-3.3579 7.5-7.5 7.5zm-7.5 30.5c0-4.1421 3.3579-7.5 7.5-7.5s7.5 3.3579 7.5 7.5h5c0-6.9036-5.5964-12.5-12.5-12.5s-12.5 5.5964-12.5 12.5zm-4-19c0-4.1421-3.35786-7.5-7.5-7.5v-5c6.90356 0 12.5 5.5964 12.5 12.5s-5.59644 12.5-12.5 12.5v-5c4.14214 0 7.5-3.3579 7.5-7.5zm23 0c0-4.1421 3.3579-7.5 7.5-7.5v-5c-6.9036 0-12.5 5.5964-12.5 12.5s5.5964 12.5 12.5 12.5v-5c-4.1421 0-7.5-3.3579-7.5-7.5z"
      fill={color}
    />
  </Svg>
);

// ─── VAULT MODAL ──────────────────────────────────────────────────────────────

interface VaultTxModalProps {
  visible: boolean;
  mode: 'deposit' | 'withdraw';
  vaultBalance: number;
  walletBalance: number | null;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<string>;
}

function VaultTxModal({ visible, mode, vaultBalance, walletBalance, onClose, onConfirm }: VaultTxModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txSig, setTxSig]   = useState<string | null>(null);
  const [error, setError]   = useState<string | null>(null);

  const maxAmount   = mode === 'deposit' ? (walletBalance ?? 0) : vaultBalance;
  const isDeposit   = mode === 'deposit';
  const accentColor = isDeposit ? SPECTRUM.mint : SPECTRUM.violet;

  function reset() { setAmount(''); setLoading(false); setTxSig(null); setError(null); }
  function handleClose() { reset(); onClose(); }

  async function handleConfirm() {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) { setError('Enter a valid amount'); return; }
    if (parsed > maxAmount) { setError(`Max: ${maxAmount.toFixed(4)} SOL`); return; }
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
            <View style={[modalStyles.handle, { backgroundColor: accentColor }]} />
            <Text style={modalStyles.title}>{isDeposit ? 'Add Liquidity' : 'Withdraw Funds'}</Text>
            {!txSig ? (
              <>
                <View style={modalStyles.balanceRow}>
                  <Text style={modalStyles.balLabel}>{isDeposit ? 'WALLET' : 'VAULT'}</Text>
                  <Text style={modalStyles.balValue}>{maxAmount.toFixed(4)} SOL</Text>
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
                <PressableScale
                  style={[modalStyles.confirmBtn, { backgroundColor: accentColor }]}
                  onPress={handleConfirm}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator size="small" color="#000" />
                    : <Text style={modalStyles.confirmLabel}>AUTHORIZE</Text>
                  }
                </PressableScale>
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

// ─── PORTFOLIO SCREEN ─────────────────────────────────────────────────────────

export default function PortfolioScreen() {
  const { portfolio, vault, refreshVault, withdrawFromVault } = useAppContext();
  const { connected, publicKey, balance, depositToVault } = useWallet();

  const [period, setPeriod]               = useState<Period>('1M');
  const [depositVisible, setDeposit]      = useState(false);
  const [withdrawVisible, setWithdraw]    = useState(false);

  const vaultBalance = vault?.balance ?? 0;
  const solUsd       = portfolio.sol * 170;
  const isPositive   = portfolio.change24h >= 0;
  const accent       = isPositive ? SPECTRUM.mint : SPECTRUM.coral;

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
    <View style={s.container}>
      <BrandHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingBottom: 160 }]}
      >

        {/* ═══════════════════════════════════════════════════════
            PERFORMANCE CARD
        ════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.duration(700).delay(80)} style={s.section}>
          <View style={s.perfCard}>

            {/* Subtle top accent line — 1px */}
            <View style={[s.topAccent, { backgroundColor: accent }]} />

            {/* ── Header ── */}
            <Text style={s.cardLabel}>PORTFOLIO PERFORMANCE</Text>

            {/* ── Price row ── */}
            <View style={s.priceRow}>
              <Text style={s.priceValue}>${portfolio.totalUsd.toLocaleString()}</Text>
              <View style={[s.changePill, isPositive ? s.pillGreen : s.pillRed]}>
                {isPositive
                  ? <TrendingUp  size={10} color={SPECTRUM.mint}  strokeWidth={2.5} />
                  : <TrendingDown size={10} color={SPECTRUM.coral} strokeWidth={2.5} />
                }
                <Text style={[s.changeText, { color: isPositive ? SPECTRUM.mint : SPECTRUM.coral }]}>
                  {isPositive ? '+' : ''}{portfolio.change24h.toFixed(2)}%
                </Text>
              </View>
            </View>

            {/* ── Chart — keyed so FadeIn fires on every period switch ── */}
            <View style={s.chartOuter}>
              <Animated.View
                key={period}
                entering={FadeIn.duration(350).easing(Easing.out(Easing.ease))}
              >
                <PremiumChart
                  data={PERIOD_DATA[period]}
                  totalUsd={portfolio.totalUsd}
                  accent={accent}
                />
              </Animated.View>
            </View>

            {/* ── Separator ── */}
            <View style={s.sep} />

            {/* ── Period picker ── */}
            <PeriodPicker value={period} onChange={setPeriod} />
          </View>
        </Animated.View>

        {/* ═══════════════════════════════════════════════════════
            VAULT CARD
        ════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.duration(700).delay(180)} style={s.section}>
          <View style={s.glassCard}>
            <View style={s.vaultHeader}>
              <View>
                <Text style={s.cardLabel}>VAULT LIQUIDITY</Text>
                <Text style={s.vaultAmt}>
                  {vaultBalance.toFixed(4)}{' '}
                  <Text style={s.vaultSym}>SOL</Text>
                </Text>
              </View>
              <Logo size={22} color={SPECTRUM.violet} />
            </View>

            <View style={s.actionRow}>
              <PressableScale
                style={[s.actionBtn, s.btnWhite]}
                onPress={() => setDeposit(true)}
              >
                <Plus size={15} color="#000" strokeWidth={3} />
                <Text style={s.btnWhiteLabel}>DEPOSIT</Text>
              </PressableScale>

              <PressableScale
                style={[s.actionBtn, s.btnGhost]}
                onPress={() => setWithdraw(true)}
              >
                <Minus size={15} color="#FFF" strokeWidth={2.5} />
                <Text style={s.btnGhostLabel}>WITHDRAW</Text>
              </PressableScale>
            </View>
          </View>
        </Animated.View>

        {/* ═══════════════════════════════════════════════════════
            ASSET BREAKDOWN
        ════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.duration(700).delay(260)} style={s.assetSection}>
          <Text style={s.sectionLabel}>ASSET BREAKDOWN</Text>
          <View style={s.assetCard}>
            {[
              { name: 'SOLANA',   sym: 'SOL',  amt: portfolio.sol, usd: solUsd, color: SPECTRUM.violet },
              { name: 'USD COIN', sym: 'USDC', amt: 0,             usd: 0,      color: SPECTRUM.azure  },
            ].map((a, i, arr) => (
              <View
                key={i}
                style={[s.assetRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}
              >
                <View style={s.assetLeft}>
                  <View style={[s.assetDot, { backgroundColor: a.color }]} />
                  <View>
                    <Text style={s.assetName}>{a.name}</Text>
                    <Text style={s.assetSub}>{a.amt.toFixed(2)} {a.sym}</Text>
                  </View>
                </View>
                <Text style={s.assetUsd}>
                  ${a.usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

      </ScrollView>

      <VaultTxModal
        visible={depositVisible} mode="deposit"
        vaultBalance={vaultBalance} walletBalance={balance}
        onClose={() => setDeposit(false)} onConfirm={handleDeposit}
      />
      <VaultTxModal
        visible={withdrawVisible} mode="withdraw"
        vaultBalance={vaultBalance} walletBalance={balance}
        onClose={() => setWithdraw(false)} onConfirm={handleWithdraw}
      />
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scroll:    { paddingHorizontal: SCREEN_PAD, paddingTop: 8 },
  section:   { marginBottom: 16 },

  // ── Performance card ──────────────────────────────────────────────────────
  perfCard: {
    padding: CARD_PAD,
    paddingTop: 22,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: VOID.rise1,      // #0E0E10 — distinct from pure black
    overflow: 'hidden',               // clips the topAccent to rounded corners
  },
  topAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    opacity: 0.40,
  },

  cardLabel: {
    color: 'rgba(255,255,255,0.22)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  priceValue: {
    color: '#FFF',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  pillGreen: { backgroundColor: 'rgba(52,211,153,0.12)'  },
  pillRed:   { backgroundColor: 'rgba(248,113,113,0.12)' },
  changeText: { fontSize: 12, fontWeight: '700' },

  chartOuter: { marginBottom: 16 },

  sep: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 14,
  },

  // ── Vault card ────────────────────────────────────────────────────────────
  glassCard: {
    padding: CARD_PAD,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  vaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  vaultAmt: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 6,
  },
  vaultSym: { color: 'rgba(255,255,255,0.22)', fontSize: 16, fontWeight: '600' },

  actionRow:    { flexDirection: 'row', gap: 12 },
  actionBtn:    { flex: 1, height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnWhite:     { backgroundColor: '#FAFAFA' },
  btnWhiteLabel:{ color: '#000', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  btnGhost:     { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  btnGhostLabel:{ color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 1 },

  // ── Asset breakdown ───────────────────────────────────────────────────────
  assetSection: { marginBottom: 40, marginTop: 8 },
  sectionLabel: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 14,
  },
  assetCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  assetLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  assetDot:  { width: 6, height: 6, borderRadius: 3 },
  assetName: { color: '#FFF', fontSize: 13, fontWeight: '800', marginBottom: 3 },
  assetSub:  { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '600' },
  assetUsd:  { color: '#FFF', fontSize: 14, fontWeight: '700' },
});

// ── Chart tooltip ─────────────────────────────────────────────────────────────
const chartStyles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    width: 76,
    backgroundColor: 'rgba(12,12,14,0.95)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center',
  },
  tooltipText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

// ── Period picker ─────────────────────────────────────────────────────────────
const pickerStyles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.sm,
    padding: PILL_TRACK_PAD,
    height: PILL_H + PILL_TRACK_PAD * 2,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
  },
  pill: {
    position: 'absolute',
    top:  PILL_TRACK_PAD,
    left: PILL_TRACK_PAD,
    width:  PILL_W,
    height: PILL_H,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: RADIUS.xs,
  },
  btn: {
    width: PILL_W, height: PILL_H,
    alignItems: 'center', justifyContent: 'center',
  },
  label: {
    color: 'rgba(255,255,255,0.28)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  labelActive: { color: '#FAFAFA' },
});

// ── Vault modal ───────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#0C0C0E',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 28,
    paddingBottom: 60,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  handle:       { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 24, opacity: 0.4 },
  title:        { color: '#FFF', fontSize: 20, fontWeight: '800', letterSpacing: -0.5, marginBottom: 24 },
  balanceRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  balLabel:     { color: 'rgba(255,255,255,0.28)', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  balValue:     { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '700' },
  inputRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  input:        { flex: 1, height: 64, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, paddingHorizontal: 20, color: '#FFF', fontSize: 24, fontWeight: '700', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  maxBtn:       { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  maxLabel:     { fontSize: 10, fontWeight: '900' },
  errorText:    { color: SPECTRUM.coral, fontSize: 12, fontWeight: '600', marginBottom: 16 },
  confirmBtn:   { height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  confirmLabel: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  successSection: { alignItems: 'center', paddingVertical: 20 },
  successTitle:   { fontSize: 18, fontWeight: '900', letterSpacing: 1 },
});
