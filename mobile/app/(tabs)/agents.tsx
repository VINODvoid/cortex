import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Activity,
  Shield,
  Zap,
  ChevronRight,
  Droplets,
  TrendingUp,
  Eye,
  RefreshCw,
  Gauge,
  Gift,
  Cpu,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppContext } from '../../context/AppContext';
import { BrandHeader } from '../../components/BrandHeader';
import { INK, VOID, SPECTRUM, BORDER } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const ROLE_ICONS: Record<string, any> = {
  strategist: Activity,
  yield: Zap,
  risk: Shield,
  liquidity: Droplets,
  trend: TrendingUp,
  sentiment: Activity,
  whale: Eye,
  rebalance: RefreshCw,
  gas: Gauge,
  airdrop: Gift,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PressableScale = ({ children, onPress, style }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <AnimatedPressable
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
      onPress={onPress}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
};

export default function AgentsScreen() {
  const insets = useSafeAreaInsets();
  const { agents, cycleRunning } = useAppContext();
  
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(contentFade, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, []);

  const orchestrator = agents[0] || { name: 'ORCHESTRATOR', status: 'IDLE', lastAction: 'SCANNING...' };
  const specializedUnits = agents.slice(1);
  const activeCount = agents.filter((a) => a.status !== 'IDLE').length;

  return (
    <View style={styles.container}>
      <BrandHeader />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]}
        style={{ opacity: contentFade }}
      >
        {/* ─── Orchestrator Hero ─── */}
        <View style={styles.heroSection}>
          <View style={styles.heroHeader}>
            <Text style={styles.microLabel}>SYSTEM ORCHESTRATOR</Text>
            <View style={[styles.statusBadge, { borderColor: cycleRunning ? SPECTRUM.violet : SPECTRUM.mint }]}>
              <Text style={[styles.statusText, { color: cycleRunning ? SPECTRUM.violet : SPECTRUM.mint }]}>
                {cycleRunning ? 'THINKING' : 'READY'}
              </Text>
            </View>
          </View>
          <Text style={styles.orchestratorName}>{orchestrator.name.toUpperCase()}</Text>
          <Text style={styles.orchestratorAction}>{orchestrator.lastAction}</Text>
        </View>

        {/* ─── Consensus Bar ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>SWARM CONSENSUS</Text>
            <Text style={styles.activeCountLabel}>{activeCount} UNITS ACTIVE</Text>
          </View>
          <View style={styles.consensusBarContainer}>
            <View style={[styles.consensusFill, { width: '70%', backgroundColor: SPECTRUM.mint }]} />
            <View style={[styles.consensusFill, { width: '20%', backgroundColor: SPECTRUM.violet }]} />
            <View style={[styles.consensusFill, { width: '10%', backgroundColor: 'rgba(255,255,255,0.1)' }]} />
          </View>
          <View style={styles.consensusLegend}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: SPECTRUM.mint }]} /><Text style={styles.legendText}>YES</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: SPECTRUM.violet }]} /><Text style={styles.legendText}>NO</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: 'rgba(255,255,255,0.1)' }]} /><Text style={styles.legendText}>ABSTAIN</Text></View>
          </View>
        </View>

        {/* ─── Specialized Units ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>SPECIALIZED UNITS</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {specializedUnits.map((unit, i) => {
              const Icon = ROLE_ICONS[unit.role] || Zap;
              return (
                <PressableScale key={i} style={styles.agentCard}>
                  <View style={styles.cardTop}>
                    <View style={styles.iconCircle}>
                      <Icon size={16} color={SPECTRUM.violet} />
                    </View>
                    <View style={[styles.unitStatusDot, { backgroundColor: unit.status !== 'IDLE' ? SPECTRUM.mint : 'rgba(255,255,255,0.1)' }]} />
                  </View>
                  <Text style={styles.unitName}>{unit.name.toUpperCase()}</Text>
                  <Text style={styles.unitRole}>{unit.role.toUpperCase()}</Text>
                </PressableScale>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── Intelligence Monitoring ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>MONITORING FEED</Text>
          </View>
          <View style={styles.glassList}>
            {specializedUnits.slice(0, 4).map((unit, i, arr) => (
              <View key={i} style={[styles.listItem, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.listUnitName}>{unit.name}</Text>
                <Text style={styles.listUnitStatus}>{unit.status}</Text>
              </View>
            ))}
          </View>
        </View>

      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { paddingHorizontal: 28, paddingTop: 10 },

  // Hero Section
  heroSection: { marginBottom: 40, marginTop: 20 },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  microLabel: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  statusText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  orchestratorName: { color: '#FFF', fontSize: 32, fontWeight: '800', letterSpacing: -1, marginBottom: 12 },
  orchestratorAction: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '500', lineHeight: 22 },

  // Consensus Bar
  section: { marginBottom: 40 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionLabel: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  activeCountLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700' },
  consensusBarContainer: { height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, flexDirection: 'row', overflow: 'hidden', marginBottom: 12 },
  consensusFill: { height: '100%' },
  consensusLegend: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '800' },

  // Agent Cards
  horizontalScroll: { gap: 16, paddingRight: 28 },
  agentCard: {
    width: 140,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  unitStatusDot: { width: 6, height: 6, borderRadius: 3 },
  unitName: { color: '#FFF', fontSize: 13, fontWeight: '800', marginBottom: 4 },
  unitRole: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  // Monitoring List
  glassList: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  listUnitName: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  listUnitStatus: { color: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
});

