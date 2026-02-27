import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Linking,
  Dimensions,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Shield,
  Activity,
  Wallet,
  ArrowUpRight,
  Fingerprint,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BrandHeader } from '../components/BrandHeader';
import * as Haptics from 'expo-haptics';
import { useAppContext } from '../context/AppContext';
import { useWallet } from '../context/WalletContext';
import { INK, VOID, SPECTRUM, BORDER, GLASS, RADIUS } from '../constants/theme';

const { height } = Dimensions.get('window');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncateAddress(addr: string, head: number, tail: number): string {
  if (!addr || addr.length < head + tail + 3) return addr;
  return `${addr.slice(0, head)}...${addr.slice(-tail)}`;
}

// ─── DNA Pulse ────────────────────────────────────────────────────────────────

const DNAPulse = () => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      )
    ]).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinRev = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <View style={styles.dnaContainer}>
      <Animated.View
        style={[
          styles.dnaRing,
          {
            width: 100,
            height: 100,
            borderRadius: 50,
            opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.4] }),
            transform: [
              { rotate: spin },
              { scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) },
            ],
          },
        ]}
      >
        <View style={styles.ringDot} />
      </Animated.View>
      <Animated.View
        style={[
          styles.dnaRing,
          {
            width: 80,
            height: 80,
            borderRadius: 40,
            borderColor: SPECTRUM.indigo,
            opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.1] }),
            transform: [
              { rotate: spinRev },
              { scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1.2, 1] }) },
            ],
          },
        ]}
      >
        <View style={[styles.ringDot, { backgroundColor: SPECTRUM.indigo, top: -2, left: '40%' }]} />
      </Animated.View>
      <View style={styles.coreIdentity}>
        <LinearGradient
          colors={['rgba(167,139,250,0.2)', 'rgba(0,0,0,0.5)']}
          style={StyleSheet.absoluteFill}
        />
        <Fingerprint size={32} color={SPECTRUM.violet} strokeWidth={1.2} />
      </View>
    </View>
  );
};

// ─── Matrix Item ──────────────────────────────────────────────────────────────

interface MatrixItemProps {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  title: string;
  sub: string;
  onPress?: () => void;
  showArrow?: boolean;
  isLast?: boolean;
  titleColor?: string;
  subColor?: string;
}

const MatrixItem = ({
  icon: Icon,
  title,
  sub,
  onPress,
  showArrow = true,
  isLast = false,
  titleColor,
  subColor,
}: MatrixItemProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.matrixItem,
      isLast && { borderBottomWidth: 0 },
      pressed && onPress ? { opacity: 0.7 } : undefined,
    ]}
  >
    <View style={styles.matrixIcon}>
      <Icon size={18} color={INK.secondary} strokeWidth={1.5} />
    </View>
    <View style={styles.matrixText}>
      <Text style={[styles.matrixTitle, titleColor ? { color: titleColor } : undefined]}>
        {title}
      </Text>
      <Text style={[styles.matrixSub, subColor ? { color: subColor } : undefined]}>{sub}</Text>
    </View>
    {showArrow && onPress ? (
      <ArrowUpRight size={14} color={INK.ghost} strokeWidth={1.5} />
    ) : null}
  </Pressable>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { portfolio, agents, isConnected } = useAppContext();
  const { connected, connecting, publicKey, walletLabel, connect, balance } = useWallet();

  const contentFade = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(contentFade, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, []);

  // Derived values
  const operatorName = walletLabel
    ? walletLabel.toUpperCase()
    : connected
    ? 'UNKNOWN WALLET'
    : 'NO WALLET CONNECTED';

  const operatorAddressDisplay =
    connected && publicKey
      ? truncateAddress(publicKey.toString(), 8, 8)
      : 'TAP MATRIX TO CONNECT';

  const changeColor = portfolio.change24h >= 0 ? SPECTRUM.mint : SPECTRUM.coral;
  const changeDisplay = `${portfolio.change24h >= 0 ? '+' : ''}${portfolio.change24h.toFixed(2)}%`;

  const activeNeurons = agents.filter((a) => a.status !== 'IDLE').length;

  // Matrix interactions
  function handleWalletPress() {
    if (connected && publicKey) {
      Linking.openURL(
        `https://explorer.solana.com/address/${publicKey.toString()}?cluster=testnet`
      ).catch(() => {});
    } else if (!connecting) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      connect();
    }
  }

  function handleVaultPress() {
    if (!portfolio.walletAddress) return;
    Linking.openURL(
      `https://explorer.solana.com/address/${portfolio.walletAddress}?cluster=testnet`
    ).catch(() => {});
  }

  const walletMatrixTitle =
    connected && publicKey
      ? truncateAddress(publicKey.toString(), 6, 4)
      : connecting
      ? 'CONNECTING...'
      : 'TAP TO CONNECT';

  const walletMatrixSub = connected && balance !== null
    ? `${balance.toFixed(2)} SOL · ${walletLabel?.toUpperCase() || 'WALLET'}`
    : 'PHANTOM · BACKPACK · SOLFLARE';

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: VOID.base }} />
        <LinearGradient
          colors={['rgba(167,139,250,0.08)', 'transparent']}
          style={styles.bgGradient}
        />
      </View>

      <BrandHeader title="OPERATOR ID" showBack showProfile={false} transparent />

      <Animated.ScrollView
        style={{ opacity: contentFade }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Identity ─────────────────────────────────────────────────────── */}
        <View style={styles.identitySection}>
          <DNAPulse />
          <View style={styles.nameContainer}>
            <View style={styles.premiumBadge}>
              <Shield size={10} color={SPECTRUM.violet} strokeWidth={2.5} />
              <Text style={styles.premiumText}>VERIFIED OPERATOR</Text>
            </View>
            <Text style={styles.operatorName}>{operatorName}</Text>
            <View style={styles.addressBadge}>
              <Text style={styles.addressText}>{operatorAddressDisplay}</Text>
            </View>
          </View>
        </View>

        {/* ─── Wealth Card ──────────────────────────────────────────────────── */}
        <View style={styles.wealthCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.02)', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>TOTAL MAGNITUDE</Text>
            <View style={styles.statusPill}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isConnected ? SPECTRUM.mint : SPECTRUM.coral },
                ]}
              />
              <Text style={styles.statusText}>{isConnected ? 'SYNCED' : 'OFFLINE'}</Text>
            </View>
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.currencyPrefix}>$</Text>
            <Text style={styles.mainBalance}>
              {portfolio.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>SOLANA</Text>
              <Text style={styles.metricValue}>{portfolio.sol.toFixed(2)}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>USDC</Text>
              <Text style={styles.metricValue}>{portfolio.usdc.toFixed(0)}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>24H CHANGE</Text>
              <Text style={[styles.metricValue, { color: changeColor }]}>{changeDisplay}</Text>
            </View>
          </View>
        </View>

        {/* ─── Matrix Grid ──────────────────────────────────────────────────── */}
        <View style={styles.matrixGrid}>
          {/* Your Wallet */}
          <MatrixItem
            icon={Wallet}
            title={walletMatrixTitle}
            sub={walletMatrixSub}
            onPress={handleWalletPress}
            showArrow
            titleColor={connected ? INK.primary : SPECTRUM.violet}
          />

          {/* Cortex Vault */}
          <MatrixItem
            icon={Shield}
            title={
              portfolio.walletAddress
                ? truncateAddress(portfolio.walletAddress, 6, 4)
                : 'NO VAULT'
            }
            sub="AI-MANAGED VAULT · DEVNET"
            onPress={portfolio.walletAddress ? handleVaultPress : undefined}
            showArrow={!!portfolio.walletAddress}
            titleColor={portfolio.walletAddress ? INK.primary : INK.ghost}
          />

          {/* Neural Sync */}
          <MatrixItem
            icon={Activity}
            title={`${activeNeurons} NEURONS ACTIVE`}
            sub={isConnected ? 'SYNCED · LIVE' : 'BACKEND OFFLINE'}
            showArrow={false}
            isLast
            titleColor={activeNeurons > 0 ? SPECTRUM.mint : INK.tertiary}
            subColor={isConnected ? SPECTRUM.mint : SPECTRUM.coral}
          />
        </View>

        <Text style={styles.footerBranding}>CORTEX NEURAL PROTOCOL — V1.0.4</Text>
      </Animated.ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: VOID.base },
  bgGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.5 },

  scrollContent: { paddingHorizontal: 24, paddingTop: 10 },

  // Identity
  identitySection: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  dnaContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dnaRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: SPECTRUM.violet,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringDot: {
    position: 'absolute',
    top: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SPECTRUM.violet,
    shadowColor: SPECTRUM.violet,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  coreIdentity: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: VOID.rise2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER.subtle,
    overflow: 'hidden',
    shadowColor: SPECTRUM.violet,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  nameContainer: { alignItems: 'center', gap: 10 },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(167,139,250,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 0.5,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  premiumText: {
    color: SPECTRUM.violet,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  operatorTitle: { color: INK.tertiary, fontSize: 10, fontWeight: '800', letterSpacing: 4 },
  operatorName: { 
    color: INK.primary, 
    fontSize: 28, 
    fontWeight: '800', 
    letterSpacing: -0.5,
    textAlign: 'center'
  },
  addressBadge: {
    backgroundColor: GLASS.g0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    marginTop: 4,
    borderWidth: 0.5,
    borderColor: BORDER.faint,
  },
  addressText: {
    color: INK.ghost,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: 'Courier',
  },

  // Wealth Card
  wealthCard: {
    backgroundColor: 'rgba(10,10,12,0.95)',
    borderRadius: RADIUS.xl,
    padding: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 24,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardLabel: { color: INK.tertiary, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GLASS.g0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  statusDot: { width: 4, height: 4, borderRadius: 2 },
  statusText: { color: INK.secondary, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  currencyPrefix: { color: INK.ghost, fontSize: 32, fontWeight: '400', marginTop: 8, marginRight: 2 },
  mainBalance: { color: INK.primary, fontSize: 52, fontWeight: '700', letterSpacing: -1.5 },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 20,
  },
  metric: { alignItems: 'center', flex: 1 },
  metricLabel: {
    color: INK.tertiary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  metricValue: { color: INK.primary, fontSize: 15, fontWeight: '700' },
  metricDivider: { width: 0.5, height: 20, backgroundColor: 'rgba(255,255,255,0.05)' },

  // Matrix Grid
  matrixGrid: {
    backgroundColor: 'rgba(10,10,12,0.95)',
    borderRadius: RADIUS.xl,
    paddingHorizontal: 20,
    borderWidth: 0.5,
    borderColor: BORDER.faint,
  },
  matrixItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  matrixIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: GLASS.g0,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 0.5,
    borderColor: BORDER.faint,
  },
  matrixText: { flex: 1 },
  matrixTitle: {
    color: INK.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'Courier',
  },
  matrixSub: {
    color: INK.tertiary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
  },

  footerBranding: {
    color: INK.phantom,
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 40,
    letterSpacing: 2,
  },
});
