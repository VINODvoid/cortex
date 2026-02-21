import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Repeat,
  ChevronRight,
  LayoutGrid,
  Zap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppContext } from '../../context/AppContext';

const { width, height } = Dimensions.get('window');

const COLORS = {
  BLACK: '#000000',
  GLASS: 'rgba(255, 255, 255, 0.03)',
  GLASS_STONG: 'rgba(255, 255, 255, 0.06)',
  ACCENT: '#5E5CE6',
  POSITIVE: '#30D158',
  SECONDARY_TEXT: 'rgba(235, 235, 245, 0.5)',
  BORDER: 'rgba(255, 255, 255, 0.08)',
};

const CountUpNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState('0.00');
  const animatedValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    animatedValue.addListener(({ value }) => {
      setDisplayValue(
        value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      );
    });
    Animated.spring(animatedValue, {
      toValue: value,
      damping: 25,
      stiffness: 80,
      useNativeDriver: false,
    }).start();
    return () => animatedValue.removeAllListeners();
  }, [value]);
  return <Text style={styles.focalValue}>{displayValue}</Text>;
};

const InsetListItem = ({ title, desc, value, status, isLast }: any) => (
  <View style={[styles.listItem, isLast && { borderBottomWidth: 0 }]}>
    <View style={styles.listTextContent}>
      <Text style={styles.itemTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.itemDesc} numberOfLines={1}>{desc}</Text>
    </View>
    <View style={styles.listValueContent}>
      <Text
        style={[styles.itemValue, status === 'POSITIVE' && { color: COLORS.POSITIVE }]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <ChevronRight size={14} color={COLORS.SECONDARY_TEXT} />
    </View>
  </View>
);

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const { portfolio, agents, cycleRunning, triggerCycle } = useAppContext();

  const displayAgents = agents.slice(0, 3).map((agent) => ({
    title: agent.name,
    desc: agent.role.charAt(0).toUpperCase() + agent.role.slice(1),
    value: agent.status === 'IDLE' ? 'Idle' : agent.status === 'THINKING' ? 'Thinking' : 'Active',
    status: agent.status !== 'IDLE' ? 'POSITIVE' : 'NEUTRAL',
  }));

  const solUsd = portfolio.sol > 0
    ? `$${(portfolio.sol * 170).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    : '—';

  const handleCycle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await triggerCycle();
  };

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.BLACK }} />
        <LinearGradient
          colors={['rgba(94, 92, 230, 0.15)', 'rgba(94, 92, 230, 0.05)', 'transparent']}
          style={styles.topRimLight}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <LinearGradient
          colors={['rgba(94, 92, 230, 0.12)', 'transparent']}
          style={styles.fullScreenBloomTop}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 0.8 }}
        />
        <LinearGradient
          colors={['rgba(48, 209, 88, 0.03)', 'transparent']}
          style={styles.fullScreenBloomBottom}
          start={{ x: 1, y: 1 }}
          end={{ x: 0.2, y: 0.2 }}
        />
      </View>

      <View style={[styles.brandHeader, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.brandName}>CORTEX</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]}
      >
        <View style={styles.heroSection}>
          <Text style={styles.heroLabel}>Portfolio Value</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.currencyPrefix}>$</Text>
            <CountUpNumber value={portfolio.totalUsd} />
          </View>
          <View style={styles.indicatorRow}>
            <View style={styles.pillIndicator}>
              <Text style={styles.indicatorText}>
                {portfolio.change24h >= 0 ? '+' : ''}{portfolio.change24h.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          {[
            { label: 'Send', icon: ArrowUpRight, color: COLORS.ACCENT },
            { label: 'Receive', icon: ArrowDownLeft, color: '#FFF' },
            { label: 'Swap', icon: Repeat, color: '#FFF' },
          ].map((action, i) => (
            <Pressable
              key={i}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
            >
              <View style={[styles.actionIconCircle, i === 0 && { backgroundColor: COLORS.ACCENT }]}>
                <action.icon size={20} color="#FFF" strokeWidth={2.5} />
              </View>
              <Text style={styles.actionText}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Run Cycle button */}
        <Pressable
          onPress={handleCycle}
          disabled={cycleRunning}
          style={({ pressed }) => [
            styles.cycleBtn,
            cycleRunning && styles.cycleBtnRunning,
            pressed && !cycleRunning && styles.cycleBtnPressed,
          ]}
        >
          {cycleRunning ? (
            <>
              <ActivityIndicator size="small" color={COLORS.ACCENT} style={{ marginRight: 8 }} />
              <Text style={styles.cycleBtnText}>Running Cycle...</Text>
            </>
          ) : (
            <>
              <Zap size={16} color={COLORS.ACCENT} style={{ marginRight: 6 }} />
              <Text style={styles.cycleBtnText}>Run Cycle</Text>
            </>
          )}
        </Pressable>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Agent Swarm</Text>
            <LayoutGrid size={18} color={COLORS.SECONDARY_TEXT} />
          </View>
          <View style={styles.glassCard}>
            {displayAgents.length > 0 ? (
              displayAgents.map((agent, i) => (
                <InsetListItem
                  key={i}
                  title={agent.title}
                  desc={agent.desc}
                  value={agent.value}
                  status={agent.status}
                  isLast={i === displayAgents.length - 1}
                />
              ))
            ) : (
              <>
                <InsetListItem title="Strategist" desc="Yield Optimization" value="Active" status="POSITIVE" />
                <InsetListItem title="Risk Guard" desc="Exposure Monitoring" value="Secure" status="POSITIVE" />
                <InsetListItem title="Whale Watch" desc="Large Order Flow" value="Idle" status="NEUTRAL" isLast />
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Top Assets</Text></View>
          <View style={styles.glassCard}>
            <InsetListItem title="Solana" desc={`${portfolio.sol.toFixed(2)} SOL`} value={solUsd} />
            <InsetListItem title="USDC" desc={`${portfolio.usdc.toFixed(2)} USDC`} value={`$${portfolio.usdc.toFixed(0)}`} />
            <InsetListItem title="Jupiter" desc="4,200 JUP" value="$3,820" isLast />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BLACK },
  topRimLight: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.15, opacity: 0.6 },
  fullScreenBloomTop: { position: 'absolute', top: -height * 0.3, left: -width * 0.4, width: width * 1.8, height: height * 0.9 },
  fullScreenBloomBottom: { position: 'absolute', bottom: -height * 0.2, right: -width * 0.4, width: width * 1.6, height: height * 0.8 },
  brandHeader: { alignItems: 'center', paddingBottom: 24 },
  brandName: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '900', letterSpacing: 8 },
  scrollContent: { paddingHorizontal: 24 },
  heroSection: { alignItems: 'center', marginVertical: 48 },
  heroLabel: { color: COLORS.SECONDARY_TEXT, fontSize: 13, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  balanceContainer: { flexDirection: 'row', alignItems: 'flex-start' },
  currencyPrefix: { color: 'rgba(255,255,255,0.3)', fontSize: 32, fontWeight: '600', marginTop: 8, marginRight: 4 },
  focalValue: { color: '#FFFFFF', fontSize: 56, fontWeight: '800', letterSpacing: -2 },
  indicatorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 12 },
  pillIndicator: { backgroundColor: 'rgba(48, 209, 88, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  indicatorText: { color: COLORS.POSITIVE, fontSize: 13, fontWeight: '700' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 16 },
  actionBtn: { flex: 1, backgroundColor: COLORS.GLASS, borderRadius: 24, paddingVertical: 20, alignItems: 'center', borderWidth: 1, borderColor: COLORS.BORDER, overflow: 'hidden' },
  actionBtnPressed: { backgroundColor: COLORS.GLASS_STONG, transform: [{ scale: 0.97 }] },
  actionIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  cycleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(94, 92, 230, 0.12)', borderRadius: 20, paddingVertical: 14, marginBottom: 48, borderWidth: 1, borderColor: 'rgba(94, 92, 230, 0.25)' },
  cycleBtnRunning: { opacity: 0.6 },
  cycleBtnPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  cycleBtnText: { color: COLORS.ACCENT, fontSize: 15, fontWeight: '700' },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  glassCard: { backgroundColor: COLORS.GLASS, borderRadius: 28, paddingHorizontal: 20, borderWidth: 1, borderColor: COLORS.BORDER, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER, overflow: 'hidden' },
  listTextContent: { flex: 1, overflow: 'hidden', marginRight: 12 },
  itemTitle: { color: '#FFF', fontSize: 17, fontWeight: '600', marginBottom: 2 },
  itemDesc: { color: COLORS.SECONDARY_TEXT, fontSize: 14, fontWeight: '400' },
  listValueContent: { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 60, justifyContent: 'flex-end' },
  itemValue: { color: '#FFF', fontSize: 16, fontWeight: '600', textAlign: 'right' },
});
