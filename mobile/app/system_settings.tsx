import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Dimensions,
  Linking,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  Cpu,
  Zap,
  LogOut,
  RefreshCcw,
  Wallet,
  ExternalLink,
  Wifi,
  WifiOff,
  Globe,
  Shield,
  Network,
  Activity,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BrandHeader } from '../components/BrandHeader';
import * as Haptics from 'expo-haptics';
import { useAppContext } from '../context/AppContext';
import { useWallet } from '../context/WalletContext';
import { INK, VOID, SPECTRUM, BORDER, GLASS, RADIUS } from '../constants/theme';
import { API_BASE } from '../constants/config';

const { height } = Dimensions.get('window');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncateAddress(addr: string, head = 6, tail = 4): string {
  if (!addr || addr.length < head + tail + 3) return addr;
  return `${addr.slice(0, head)}...${addr.slice(-tail)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.glassCard}>{children}</View>
    </View>
  );
}

function StatusPill({ online }: { online: boolean }) {
  return (
    <View style={styles.statusPill}>
      <View style={[styles.statusDot, { backgroundColor: online ? SPECTRUM.mint : SPECTRUM.coral }]} />
      <Text style={[styles.statusText, { color: online ? SPECTRUM.mint : SPECTRUM.coral }]}>
        {online ? 'ONLINE' : 'OFFLINE'}
      </Text>
    </View>
  );
}

interface SettingsRowProps {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  value?: string;
  valueColor?: string;
  mono?: boolean;
  type?: 'info' | 'switch' | 'chevron';
  switchValue?: boolean;
  onValueChange?: (v: boolean) => void;
  onPress?: () => void;
  isLast?: boolean;
  rightNode?: React.ReactNode;
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  valueColor,
  mono,
  type = 'info',
  switchValue,
  onValueChange,
  onPress,
  isLast,
  rightNode,
}: SettingsRowProps) {
  const rowStyle = [styles.settingsRow, isLast && { borderBottomWidth: 0 }];

  const right =
    rightNode ? rightNode :
    type === 'switch' ? (
      <Switch
        value={switchValue}
        onValueChange={(v) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onValueChange?.(v);
        }}
        trackColor={{ false: 'rgba(255,255,255,0.05)', true: SPECTRUM.violet }}
        thumbColor="#FFF"
      />
    ) : type === 'chevron' ? (
      <View style={styles.rowRight}>
        <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null, mono && styles.rowValueMono]}>
          {value}
        </Text>
        <ChevronRight size={14} color={INK.ghost} strokeWidth={1.5} />
      </View>
    ) : (
      <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null, mono && styles.rowValueMono]}>
        {value}
      </Text>
    );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [rowStyle, pressed && { opacity: 0.7 }]}>
        <View style={styles.rowLeft}>
          <View style={styles.iconContainer}>
            <Icon size={16} color={INK.secondary} strokeWidth={1.5} />
          </View>
          <Text style={styles.rowLabel}>{label}</Text>
        </View>
        {right}
      </Pressable>
    );
  }

  return (
    <View style={rowStyle}>
      <View style={styles.rowLeft}>
        <View style={styles.iconContainer}>
          <Icon size={16} color={INK.secondary} strokeWidth={1.5} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      {right}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isConnected, cycleRunning, agents, portfolio } = useAppContext();
  const { connected, connecting, publicKey, walletLabel, connect, disconnect } = useWallet();

  const [notifications, setNotifications] = useState(true);
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(contentFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const activeNeurons = agents.filter((a) => a.status !== 'IDLE').length;

  const walletDisplay = connected && publicKey
    ? `${walletLabel ? walletLabel + ' · ' : ''}${truncateAddress(publicKey.toString(), 6, 4)}`
    : 'NOT CONNECTED';

  function openVaultExplorer() {
    if (!portfolio.walletAddress) return;
    Linking.openURL(
      `https://explorer.solana.com/address/${portfolio.walletAddress}?cluster=devnet`
    ).catch(() => {});
  }

  function handleDisconnect() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'TERMINAL DISCONNECT',
      'Deauthorize this wallet and return to the entry screen?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await disconnect();
            router.replace('/');
          },
        },
      ],
      { cancelable: true }
    );
  }

  return (
    <View style={styles.container}>
      {/* Background */}
            <View style={StyleSheet.absoluteFill}>
              <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: VOID.base }} />
              <LinearGradient
                colors={['rgba(167, 139, 250, 0.05)', 'transparent']}
                style={styles.bgGradient}
              />
            </View>
      
            <BrandHeader title="TERMINAL CONFIG" showBack showSettings={false} transparent />
      
            <Animated.ScrollView
        style={{ opacity: contentFade }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── SYSTEM HEALTH HEADER ────────────────────────────────────────── */}
        <View style={styles.systemHealthHeader}>
          <LinearGradient
            colors={['rgba(167,139,250,0.1)', 'transparent']}
            style={styles.healthGradient}
          />
          <View style={styles.healthGrid}>
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>SYSTEM UPTIME</Text>
              <Text style={styles.healthValue}>99.98%</Text>
            </View>
            <View style={styles.healthDivider} />
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>NEURAL LOAD</Text>
              <Text style={[styles.healthValue, { color: SPECTRUM.mint }]}>OPTIMAL</Text>
            </View>
            <View style={styles.healthDivider} />
            <View style={styles.healthItem}>
              <Text style={styles.healthLabel}>API LATENCY</Text>
              <Text style={styles.healthValue}>24ms</Text>
            </View>
          </View>
          <View style={styles.healthFooter}>
            <Activity size={10} color={SPECTRUM.mint} strokeWidth={3} />
            <Text style={styles.healthFooterText}>CORE PROTOCOL STABLE · SHA-256 VERIFIED</Text>
          </View>
        </View>

        {/* ─── WALLET ──────────────────────────────────────────────────────── */}
        <Section title="WALLET">
          <SettingsRow
            icon={Wallet}
            label="CONNECTED WALLET"
            value={walletDisplay}
            valueColor={connected ? INK.secondary : INK.ghost}
            isLast
            rightNode={
              connected ? (
                <View style={styles.connectedBadge}>
                  <View style={[styles.statusDot, { backgroundColor: SPECTRUM.mint }]} />
                  <Text style={[styles.statusText, { color: SPECTRUM.mint }]}>CONNECTED</Text>
                </View>
              ) : connecting ? (
                <ActivityIndicator size="small" color={SPECTRUM.violet} />
              ) : (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    connect();
                  }}
                  style={styles.connectChip}
                >
                  <Text style={styles.connectChipText}>CONNECT</Text>
                </Pressable>
              )
            }
          />
        </Section>

        {/* ─── NETWORK ─────────────────────────────────────────────────────── */}
        <Section title="NETWORK">
          {/* Core Node */}
          <View style={styles.settingsRow}>
            <View style={styles.rowLeft}>
              <View style={styles.iconContainer}>
                <Network size={16} color={INK.secondary} strokeWidth={1.5} />
              </View>
              <Text style={styles.rowLabel}>CORE NODE</Text>
            </View>
            <StatusPill online={isConnected} />
          </View>

          {/* Backend API */}
          <View style={styles.settingsRow}>
            <View style={styles.rowLeft}>
              <View style={styles.iconContainer}>
                <Globe size={16} color={INK.secondary} strokeWidth={1.5} />
              </View>
              <Text style={styles.rowLabel}>BACKEND API</Text>
            </View>
            <Text style={[styles.rowValue, styles.rowValueMono]}>
              {API_BASE.replace('http://', '')}
            </Text>
          </View>

          {/* Cortex Vault */}
          <Pressable
            onPress={portfolio.walletAddress ? openVaultExplorer : undefined}
            style={({ pressed }) => [styles.settingsRow, pressed && { opacity: 0.7 }]}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconContainer}>
                <Shield size={16} color={INK.secondary} strokeWidth={1.5} />
              </View>
              <Text style={styles.rowLabel}>CORTEX VAULT</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, styles.rowValueMono, { color: SPECTRUM.violet }]}>
                {portfolio.walletAddress ? truncateAddress(portfolio.walletAddress, 6, 4) : '—'}
              </Text>
              {portfolio.walletAddress && (
                <ExternalLink size={12} color={INK.ghost} strokeWidth={1.5} />
              )}
            </View>
          </Pressable>

          {/* Network */}
          <SettingsRow icon={Wifi} label="NETWORK" value="Solana Devnet" isLast />
        </Section>

        {/* ─── INTELLIGENCE ────────────────────────────────────────────────── */}
        <Section title="INTELLIGENCE">
          <SettingsRow
            icon={Cpu}
            label="ACTIVE NEURONS"
            value={agents.length > 0 ? `${activeNeurons} / ${agents.length}` : '—'}
            valueColor={activeNeurons > 0 ? SPECTRUM.mint : INK.ghost}
          />
          <SettingsRow
            icon={Zap}
            label="CYCLE STATUS"
            value={cycleRunning ? 'RUNNING' : 'READY'}
            valueColor={cycleRunning ? SPECTRUM.gold : SPECTRUM.mint}
          />
          <SettingsRow
            icon={Activity}
            label="AUTO-CYCLE"
            value="5 MIN INTERVAL"
            isLast
          />
        </Section>

        {/* ─── PREFERENCES ─────────────────────────────────────────────────── */}
        <Section title="PREFERENCES">
          <SettingsRow
            icon={Bell}
            label="AGENT NOTIFICATIONS"
            type="switch"
            switchValue={notifications}
            onValueChange={setNotifications}
            isLast
          />
        </Section>

        {/* ─── SESSION ACTIONS ─────────────────────────────────────────────── */}
        <View style={styles.actionGroup}>
          <Pressable
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              router.replace('/');
            }}
            style={({ pressed }) => [styles.actionBtn, pressed && styles.btnPressed]}
          >
            <RefreshCcw size={16} color={INK.tertiary} strokeWidth={1.5} />
            <Text style={styles.actionBtnText}>RESET SESSION</Text>
          </Pressable>

          <Pressable
            onPress={handleDisconnect}
            style={({ pressed }) => [styles.disconnectBtn, pressed && styles.btnPressed]}
          >
            <LogOut size={16} color={SPECTRUM.coral} strokeWidth={1.5} />
            <Text style={styles.disconnectText}>TERMINAL DISCONNECT</Text>
          </Pressable>
        </View>

        <Text style={styles.versionText}>
          CORTEX SYSTEM V1.0.4 {connected ? '· WALLET AUTHORIZED' : '· NO WALLET'}
        </Text>
      </Animated.ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: VOID.base },
  bgGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.4 },

  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

  // System Health Header
  systemHealthHeader: {
    backgroundColor: 'rgba(10,10,12,0.8)',
    borderRadius: RADIUS.xl,
    padding: 20,
    marginBottom: 32,
    marginTop: 10,
    borderWidth: 0.5,
    borderColor: BORDER.faint,
    overflow: 'hidden',
  },
  healthGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  healthGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthItem: {
    flex: 1,
    alignItems: 'center',
  },
  healthLabel: {
    color: INK.tertiary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  healthValue: {
    color: INK.primary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  healthDivider: {
    width: 0.5,
    height: 20,
    backgroundColor: BORDER.faint,
  },
  healthFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.03)',
  },
  healthFooterText: {
    color: INK.ghost,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Section
  section: { marginBottom: 32 },
  sectionTitle: {
    color: INK.tertiary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  glassCard: {
    backgroundColor: 'rgba(10,10,12,0.95)',
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    borderWidth: 0.5,
    borderColor: BORDER.faint,
  },

  // Row
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.xs,
    backgroundColor: GLASS.g0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: BORDER.faint,
  },
  rowLabel: { color: INK.secondary, fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  rowValue: { color: INK.tertiary, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  rowValueMono: { fontFamily: 'Courier', fontSize: 11, letterSpacing: 0.2 },

  // Status
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GLASS.g0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  // Wallet connect states
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(52,211,153,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    borderWidth: 0.5,
    borderColor: 'rgba(52,211,153,0.2)',
  },
  connectChip: {
    backgroundColor: 'rgba(167,139,250,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.xs,
    borderWidth: 0.5,
    borderColor: 'rgba(167,139,250,0.25)',
  },
  connectChipText: {
    color: SPECTRUM.violet,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  // Actions
  actionGroup: { gap: 12, marginTop: 12 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  actionBtnText: { color: INK.tertiary, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  disconnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    backgroundColor: 'rgba(248,113,113,0.05)',
    borderRadius: RADIUS.md,
    borderWidth: 0.5,
    borderColor: 'rgba(248,113,113,0.12)',
  },
  disconnectText: { color: SPECTRUM.coral, fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  btnPressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },

  versionText: {
    color: INK.phantom,
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 32,
    letterSpacing: 1,
  },
});
