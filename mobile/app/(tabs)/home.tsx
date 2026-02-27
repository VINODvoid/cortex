import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated as RNAnimated,
  Dimensions,
  ActivityIndicator,
  Easing,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Cpu,
  Layers,
  TrendingUp,
  Activity,
  Wallet,
  ArrowRight,
  Repeat,
  ArrowDown,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  FadeInDown 
} from 'react-native-reanimated';
import { useAppContext } from '../../context/AppContext';
import { useWallet } from '../../context/WalletContext';
import { BrandHeader } from '../../components/BrandHeader';
import { INK, VOID, SPECTRUM, RADIUS, SPACE, TYPOGRAPHY, GLASS, BORDER } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

// ─── INTERNAL COMPONENTS ───────────────────────────────────────────────────

const Logo = ({ size = 24, color = "#FFF" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size * (48/38)} viewBox="0 0 38 48">
    <Path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="m19 12.5c-4.1421 0-7.5-3.35786-7.5-7.5h-5c0 6.9036 5.5964 12.5 12.5 12.5s12.5-5.5964 12.5-12.5h-5c0 4.14214-3.3579 7.5-7.5 7.5zm-7.5 30.5c0-4.1421 3.3579-7.5 7.5-7.5s7.5 3.3579 7.5 7.5h5c0-6.9036-5.5964-12.5-12.5-12.5s-12.5 5.5964-12.5 12.5zm-4-19c0-4.1421-3.35786-7.5-7.5-7.5v-5c6.90356 0 12.5 5.5964 12.5 12.5s-5.59644 12.5-12.5 12.5v-5c4.14214 0 7.5-3.3579 7.5-7.5zm23 0c0-4.1421 3.3579-7.5 7.5-7.5v-5c-6.9036 0-12.5 5.5964-12.5 12.5s5.5964 12.5 12.5 12.5v-5c-4.1421 0-7.5-3.3579-7.5-7.5z" 
      fill={color} 
    />
  </Svg>
);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PressableScale = ({ children, onPress, style, disabled }: any) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.97, { damping: 10, stiffness: 200 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
};

const CountUpNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState('0.00');
  const animatedValue = useRef(new RNAnimated.Value(0)).current;
  
  useEffect(() => {
    animatedValue.addListener(({ value }) => {
      setDisplayValue(
        value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      );
    });
    RNAnimated.spring(animatedValue, {
      toValue: value,
      damping: 20,
      stiffness: 70,
      useNativeDriver: false,
    }).start();
    return () => animatedValue.removeAllListeners();
  }, [value]);
  
  return <Text style={styles.heroValue}>{displayValue}</Text>;
};

// ─── SWAP MODAL ────────────────────────────────────────────────────────────

function SwapModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSwap = () => {
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 2000);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Pressable style={swapStyles.overlay} onPress={onClose}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <Pressable style={swapStyles.sheet} onPress={() => {}}>
            <View style={swapStyles.header}>
              <Text style={swapStyles.title}>Neural Swap</Text>
              <Pressable onPress={onClose} style={swapStyles.closeBtn}>
                <Text style={swapStyles.closeText}>CANCEL</Text>
              </Pressable>
            </View>

            <View style={swapStyles.inputGroup}>
              {/* FROM */}
              <View style={swapStyles.assetCard}>
                <View style={swapStyles.assetInfo}>
                  <Text style={swapStyles.assetLabel}>YOU PAY</Text>
                  <View style={swapStyles.assetPicker}>
                    <Image 
                      source={require('../../assets/solana.png')} 
                      style={swapStyles.assetIconImage} 
                    />
                    <Text style={swapStyles.assetName}>SOL</Text>
                    <ChevronRight size={14} color={INK.ghost} />
                  </View>
                </View>
                <TextInput
                  style={swapStyles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor={INK.ghost}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>

              {/* DIVIDER ICON */}
              <View style={swapStyles.dividerZone}>
                <View style={swapStyles.dividerLine} />
                <View style={swapStyles.iconCircle}>
                  <ArrowDown size={16} color={SPECTRUM.violet} strokeWidth={2.5} />
                </View>
                <View style={swapStyles.dividerLine} />
              </View>

              {/* TO */}
              <View style={swapStyles.assetCard}>
                <View style={swapStyles.assetInfo}>
                  <Text style={swapStyles.assetLabel}>YOU RECEIVE</Text>
                  <View style={swapStyles.assetPicker}>
                    <Image 
                      source={require('../../assets/usd-coin.png')} 
                      style={swapStyles.assetIconImage} 
                    />
                    <Text style={swapStyles.assetName}>USDC</Text>
                    <ChevronRight size={14} color={INK.ghost} />
                  </View>
                </View>
                <Text style={[swapStyles.amountInput, { color: INK.secondary }]}>
                  {amount ? (parseFloat(amount) * 170).toFixed(2) : '0.00'}
                </Text>
              </View>
            </View>

            <View style={swapStyles.footer}>
              <View style={swapStyles.metaRow}>
                <Text style={swapStyles.metaLabel}>RATE</Text>
                <Text style={swapStyles.metaValue}>1 SOL ≈ 170.42 USDC</Text>
              </View>
              <View style={swapStyles.metaRow}>
                <Text style={swapStyles.metaLabel}>SLIPPAGE</Text>
                <Text style={swapStyles.metaValue}>0.5%</Text>
              </View>

              <PressableScale style={swapStyles.swapBtn} onPress={handleSwap} disabled={loading || !amount}>
                {loading ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={swapStyles.swapBtnText}>AUTHORIZE SWAP</Text>
                )}
              </PressableScale>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const { portfolio, agents, cycleRunning, triggerCycle, vault } = useAppContext();
  const { balance, connected } = useWallet();
  
  const [swapVisible, setSwapVisible] = useState(false);
  const contentFade = useRef(new RNAnimated.Value(0)).current;
  const vaultBalance = vault?.balance ?? 0;

  useEffect(() => {
    RNAnimated.timing(contentFade, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, []);

  const handleCycle = async () => {
    if (vaultBalance <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await triggerCycle();
  };

  const activeAgents = agents.filter(a => a.status !== 'IDLE').length;
  const latestThought = agents.find(a => a.status === 'ACTIVE' || a.status === 'THINKING')?.lastAction 
    || "Monitoring global liquidity clusters...";

  return (
    <View style={styles.container}>
      <BrandHeader />

      <RNAnimated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]}
        style={{ opacity: contentFade }}
      >
        {/* ─── Vault Awareness Section ─── */}
        <View style={styles.statusSection}>
          {vaultBalance <= 0 ? (
            <PressableScale style={styles.vaultAlertCard}>
              <View style={styles.alertHeader}>
                <View style={[styles.statusDot, { backgroundColor: SPECTRUM.coral }]} />
                <Text style={styles.alertTitle}>VAULT DEACTIVATED</Text>
              </View>
              <Text style={styles.alertDesc}>Deposit SOL to authorize the neural swarm and begin automated management.</Text>
            </PressableScale>
          ) : (
            <View style={styles.swarmIndicator}>
              <Activity size={10} color={SPECTRUM.mint} />
              <Text style={styles.swarmText}>{activeAgents} NEURAL UNITS ENGAGED</Text>
            </View>
          )}
        </View>

        {/* ─── Hero Value ─── */}
        <View style={styles.heroIntelligence}>
          <View style={styles.balanceContainer}>
            <Text style={styles.currencyPrefix}>$</Text>
            <CountUpNumber value={portfolio.totalUsd} />
          </View>
          <View style={styles.trendRow}>
            <TrendingUp size={12} color={SPECTRUM.mint} />
            <Text style={styles.trendValue}>+{portfolio.change24h.toFixed(2)}%</Text>
            <Text style={styles.alphaLabel}>ALPHA FLOW</Text>
          </View>
        </View>

        {/* ─── Command Bar ─── */}
        <View style={styles.commandRow}>
          <PressableScale style={styles.commandPill} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <ArrowUpRight size={14} color={INK.primary} strokeWidth={2.5} />
            <Text style={styles.commandText}>SEND</Text>
          </PressableScale>
          <View style={styles.commandDivider} />
          <PressableScale style={styles.commandPill} onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setSwapVisible(true);
          }}>
            <Repeat size={14} color={INK.primary} strokeWidth={2.5} />
            <Text style={styles.commandText}>SWAP</Text>
          </PressableScale>
          <View style={styles.commandDivider} />
          <PressableScale style={styles.commandPill} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <ArrowDownLeft size={14} color={INK.primary} strokeWidth={2.5} />
            <Text style={styles.commandText}>RECEIVE</Text>
          </PressableScale>
        </View>

        {/* ─── Primary Command ─── */}
        <View style={styles.executeContainer}>
          <PressableScale
            onPress={handleCycle}
            disabled={cycleRunning || vaultBalance <= 0}
            style={[styles.executeBtnPremium, vaultBalance <= 0 && { opacity: 0.5 }]}
          >
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            {cycleRunning ? (
              <View style={styles.executingState}>
                <ActivityIndicator size="small" color={SPECTRUM.violet} />
                <Text style={styles.executingText}>SYNCHRONIZING</Text>
              </View>
            ) : (
              <View style={styles.idleState}>
                <Logo size={18} color={vaultBalance > 0 ? SPECTRUM.violet : 'rgba(255,255,255,0.2)'} />
                <Text style={styles.executeTitle}>
                  {vaultBalance > 0 ? 'INITIATE SWARM' : 'AWAITING LIQUIDITY'}
                </Text>
                <ArrowRight size={14} color="rgba(255,255,255,0.2)" />
              </View>
            )}
          </PressableScale>
        </View>

        {/* ─── Live Thought Ticker ─── */}
        <View style={styles.thoughtSection}>
          <View style={styles.thoughtHeader}>
            <Text style={styles.sectionLabel}>LATEST INTELLIGENCE</Text>
            <Cpu size={12} color="rgba(255,255,255,0.2)" />
          </View>
          <View style={styles.thoughtCard}>
            <Text style={styles.thoughtText}>{latestThought}</Text>
          </View>
        </View>

        {/* ─── Swarm Overview ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>ACTIVE COORDINATION</Text>
          </View>
          <View style={styles.swarmCompactCard}>
            {agents.slice(0, 3).map((agent, i) => (
              <View key={i} style={[styles.agentRowMinimal, i === 2 && { borderBottomWidth: 0 }]}>
                <View style={styles.agentInfo}>
                  <View style={[styles.statusDotSmall, { backgroundColor: agent.status !== 'IDLE' ? SPECTRUM.mint : 'rgba(255,255,255,0.1)' }]} />
                  <Text style={styles.agentNameSmall}>{agent.name.toUpperCase()}</Text>
                </View>
                <Text style={styles.agentStatusSmall}>{agent.status}</Text>
              </View>
            ))}
          </View>
        </View>

      </RNAnimated.ScrollView>

      <SwapModal visible={swapVisible} onClose={() => setSwapVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { paddingHorizontal: 28, paddingTop: 10 },

  // Status & Alerts
  statusSection: { alignItems: 'center', marginVertical: 20 },
  vaultAlertCard: {
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  alertTitle: { color: SPECTRUM.coral, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  alertDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '500', lineHeight: 18 },
  
  swarmIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.03)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  swarmText: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },

  // Hero Intelligence
  heroIntelligence: { alignItems: 'center', marginBottom: 40 },
  balanceContainer: { flexDirection: 'row', alignItems: 'flex-start' },
  currencyPrefix: { color: 'rgba(255,255,255,0.2)', fontSize: 32, fontWeight: '400', marginTop: 8, marginRight: 2 },
  heroValue: { color: '#FFF', fontSize: 64, fontWeight: '800', letterSpacing: -3 },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6 },
  trendValue: { color: SPECTRUM.mint, fontSize: 13, fontWeight: '700' },
  alphaLabel: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '800', letterSpacing: 2 },

  // Command Row
  commandRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 4,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  commandPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  commandText: { color: INK.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  commandDivider: { width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.05)' },

  // Execution
  executeContainer: { marginBottom: 40 },
  executeBtnPremium: {
    height: 64,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  idleState: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  executeTitle: { color: '#FFF', fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  executingState: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  executingText: { color: SPECTRUM.violet, fontSize: 12, fontWeight: '900', letterSpacing: 2 },

  // Thought Ticker
  thoughtSection: { marginBottom: 32 },
  thoughtHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionLabel: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  thoughtCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  thoughtText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500', lineHeight: 22, fontStyle: 'italic' },

  // Swarm Compact
  section: { marginBottom: 32 },
  sectionHeader: { marginBottom: 12 },
  swarmCompactCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  agentRowMinimal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  agentInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDotSmall: { width: 4, height: 4, borderRadius: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  agentNameSmall: { color: '#FFF', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  agentStatusSmall: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
});

const swapStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: VOID.rise2,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: 28,
    paddingBottom: 60,
    borderTopWidth: 1,
    borderColor: BORDER.subtle,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  title: { ...TYPOGRAPHY.title3, color: INK.primary },
  closeBtn: { padding: 4 },
  closeText: { ...TYPOGRAPHY.micro, color: INK.tertiary },

  inputGroup: { gap: 4 },
  assetCard: {
    backgroundColor: GLASS.g1,
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER.faint,
  },
  assetInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  assetLabel: { ...TYPOGRAPHY.micro, color: INK.tertiary },
  assetPicker: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: GLASS.g2, paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.pill },
  assetIcon: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  assetIconImage: { width: 18, height: 18, borderRadius: 9 },
  assetSymbol: { color: '#000', fontSize: 10, fontWeight: '900' },
  assetName: { ...TYPOGRAPHY.caption1, color: INK.primary },
  
  amountInput: { ...TYPOGRAPHY.title2, color: INK.primary, fontSize: 32, fontWeight: '700' },

  dividerZone: { height: 40, alignItems: 'center', justifyContent: 'center', marginVertical: -16, zIndex: 10 },
  dividerLine: { width: 1, flex: 1, backgroundColor: BORDER.faint },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: VOID.rise2, borderWidth: 1, borderColor: BORDER.subtle, justifyContent: 'center', alignItems: 'center' },

  footer: { marginTop: 32, gap: 16 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaLabel: { ...TYPOGRAPHY.micro, color: INK.ghost },
  metaValue: { ...TYPOGRAPHY.footnote, color: INK.secondary, fontWeight: '600' },

  swapBtn: { height: 64, backgroundColor: INK.primary, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  swapBtnText: { ...TYPOGRAPHY.headline, color: VOID.base, fontWeight: '900', letterSpacing: 1 },
});
