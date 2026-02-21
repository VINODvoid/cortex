import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Activity,
  Shield,
  BarChart3,
  Zap,
  ChevronRight,
  Droplets,
  TrendingUp,
  Eye,
  RefreshCw,
  Gauge,
  Gift,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppContext } from '../../context/AppContext';

const { width, height } = Dimensions.get('window');

const COLORS = {
  BLACK: '#000000',
  GLASS: 'rgba(255, 255, 255, 0.03)',
  ACCENT: '#5E5CE6',
  POSITIVE: '#30D158',
  ORANGE: '#FF9F0A',
  SECONDARY_TEXT: 'rgba(235, 235, 245, 0.5)',
  BORDER: 'rgba(255, 255, 255, 0.08)',
};

const ROLE_ICONS: Record<string, any> = {
  strategist: Activity,
  yield: Zap,
  risk: Shield,
  liquidity: Droplets,
  trend: TrendingUp,
  sentiment: BarChart3,
  whale: Eye,
  rebalance: RefreshCw,
  gas: Gauge,
  airdrop: Gift,
};

export default function AgentsScreen() {
  const insets = useSafeAreaInsets();
  const dotScale = useRef(new Animated.Value(1)).current;
  const { agents, cycleRunning } = useAppContext();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale, { toValue: 1.4, duration: 1200, useNativeDriver: true }),
        Animated.timing(dotScale, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const orchestrator = agents[0] ?? { name: 'Strategist-Alpha', role: 'Cross-Chain Yield Aggregator', status: 'IDLE', lastAction: 'Awaiting cycle...', confidence: 0 };
  const specializedUnits = agents.slice(1);
  const activeCount = agents.filter((a) => a.status !== 'IDLE').length;

  const orchestratorStatus = cycleRunning ? 'THINKING' : 'IDLE';
  const orchestratorStatusColor = cycleRunning ? COLORS.ORANGE : COLORS.POSITIVE;
  const orchestratorStatusBg = cycleRunning
    ? 'rgba(255, 159, 10, 0.1)'
    : 'rgba(48, 209, 88, 0.1)';

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
          colors={['rgba(255, 159, 10, 0.03)', 'transparent']}
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
          <Text style={styles.heroLabel}>Swarm Intelligence</Text>
          <View style={styles.statusRow}>
            <Text style={styles.focalValue}>{String(agents.length || 10).padStart(2, '0')}</Text>
            <Text style={styles.focalSubValue}>Agents</Text>
          </View>
          <View style={styles.indicatorRow}>
            <View style={styles.pulseContainer}>
              <Animated.View style={[styles.pulseDot, { transform: [{ scale: dotScale }] }]} />
            </View>
            <Text style={styles.secondaryIndicatorText}>
              {cycleRunning ? 'Cycle Running • ' : 'System Nominal • '}
              {activeCount} Active
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Primary Orchestrator</Text></View>
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
            style={styles.orchestratorCard}
          >
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.agentName}>{orchestrator.name}</Text>
                <Text style={styles.agentRole}>Cross-Chain Yield Aggregator</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: orchestratorStatusBg }]}>
                <Text style={[styles.statusText, { color: orchestratorStatusColor }]}>
                  {orchestratorStatus}
                </Text>
              </View>
            </View>
            <View style={styles.taskContainer}>
              <Text style={styles.taskLabel}>CURRENT OPERATION</Text>
              <Text style={styles.taskText}>
                {orchestrator.lastAction || 'Awaiting next cycle...'}
              </Text>
            </View>
            <View style={styles.cardFooter}>
              <View style={styles.metricRow}>
                <Activity size={14} color={COLORS.SECONDARY_TEXT} />
                <Text style={styles.metricText}>
                  Confidence: {orchestrator.confidence > 0 ? `${orchestrator.confidence}%` : '—'}
                </Text>
              </View>
              <ChevronRight size={16} color={COLORS.SECONDARY_TEXT} />
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Specialized Units</Text></View>
          <View style={styles.glassCard}>
            {(specializedUnits.length > 0 ? specializedUnits : [
              { name: 'Risk Agent', role: 'risk', status: 'ACTIVE', lastAction: '', confidence: 0 },
              { name: 'Yield Scout', role: 'yield', status: 'ACTIVE', lastAction: '', confidence: 0 },
              { name: 'Trend Engine', role: 'trend', status: 'IDLE', lastAction: '', confidence: 0 },
            ]).map((unit, i, arr) => {
              const Icon = ROLE_ICONS[unit.role] ?? Zap;
              const statusLabel =
                unit.status === 'THINKING' ? 'Thinking' :
                unit.status === 'ACTIVE' ? 'Active' :
                unit.status === 'SCANNING' ? 'Scanning' : 'Idle';
              return (
                <View key={i} style={[styles.listItem, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={styles.listIconContent}>
                    <View style={styles.smallIconCircle}>
                      <Icon size={16} color={COLORS.ACCENT} />
                    </View>
                    <Text style={styles.itemTitle}>{unit.name}</Text>
                  </View>
                  <View style={styles.listValueContent}>
                    <Text style={styles.itemValue}>{statusLabel}</Text>
                    <ChevronRight size={14} color={COLORS.SECONDARY_TEXT} />
                  </View>
                </View>
              );
            })}
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
  statusRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  focalValue: { color: '#FFFFFF', fontSize: 64, fontWeight: '800', letterSpacing: -2, lineHeight: 64 },
  focalSubValue: { color: 'rgba(255,255,255,0.3)', fontSize: 32, fontWeight: '600', marginBottom: 6 },
  indicatorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, gap: 10 },
  pulseContainer: { width: 12, height: 12, justifyContent: 'center', alignItems: 'center' },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.POSITIVE },
  secondaryIndicatorText: { color: COLORS.SECONDARY_TEXT, fontSize: 13, fontWeight: '500' },
  section: { marginBottom: 32 },
  sectionHeader: { marginBottom: 16, paddingHorizontal: 4 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  orchestratorCard: { backgroundColor: COLORS.GLASS, borderRadius: 28, padding: 24, borderWidth: 1, borderColor: COLORS.BORDER, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  agentName: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  agentRole: { color: COLORS.SECONDARY_TEXT, fontSize: 14, fontWeight: '400', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '800' },
  taskContainer: { marginBottom: 24 },
  taskLabel: { color: COLORS.ACCENT, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  taskText: { color: '#FFF', fontSize: 16, lineHeight: 24, fontWeight: '500' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.BORDER, paddingTop: 16 },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricText: { color: COLORS.SECONDARY_TEXT, fontSize: 14, fontWeight: '600' },
  glassCard: { backgroundColor: COLORS.GLASS, borderRadius: 28, paddingHorizontal: 20, borderWidth: 1, borderColor: COLORS.BORDER, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER, overflow: 'hidden' },
  listIconContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  smallIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  itemTitle: { color: '#FFF', fontSize: 17, fontWeight: '600' },
  listValueContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemValue: { color: COLORS.SECONDARY_TEXT, fontSize: 15, fontWeight: '600' },
});
