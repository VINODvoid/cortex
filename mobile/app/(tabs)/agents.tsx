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
  ChevronRight
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

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

export default function AgentsScreen() {
  const insets = useSafeAreaInsets();
  const dotScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale, { toValue: 1.4, duration: 1200, useNativeDriver: true }),
        Animated.timing(dotScale, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* FIXED SEAMLESS FULL-SCREEN ATMOSPHERE */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.BLACK }} />
        <LinearGradient 
          colors={['rgba(94, 92, 230, 0.12)', 'transparent']} 
          style={styles.fullScreenBloomTop} 
          start={{ x: 0, y: 0 }} end={{ x: 0.8, y: 0.8 }}
        />
        <LinearGradient 
          colors={['rgba(255, 159, 10, 0.03)', 'transparent']} 
          style={styles.fullScreenBloomBottom} 
          start={{ x: 1, y: 1 }} end={{ x: 0.2, y: 0.2 }}
        />
      </View>
      
      <View style={[styles.brandHeader, { paddingTop: insets.top + 8 }]}><Text style={styles.brandName}>CORTEX</Text></View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]}>
        <View style={styles.heroSection}>
          <Text style={styles.heroLabel}>Swarm Intelligence</Text>
          <View style={styles.statusRow}>
            <Text style={styles.focalValue}>08</Text>
            <Text style={styles.focalSubValue}>Active</Text>
          </View>
          <View style={styles.indicatorRow}>
            <View style={styles.pulseContainer}><Animated.View style={[styles.pulseDot, { transform: [{ scale: dotScale }] }]} /></View>
            <Text style={styles.secondaryIndicatorText}>System Nominal • 99.9% Uptime</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Primary Orchestrator</Text></View>
          <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)} style={styles.orchestratorCard}>
            <View style={styles.cardTop}>
              <View><Text style={styles.agentName}>Strategist-Alpha</Text><Text style={styles.agentRole}>Cross-Chain Yield Aggregator</Text></View>
              <View style={styles.statusBadge}><Text style={styles.statusText}>THINKING</Text></View>
            </View>
            <View style={styles.taskContainer}><Text style={styles.taskLabel}>CURRENT OPERATION</Text><Text style={styles.taskText}>Optimizing liquidity depth for SOL/USDC pair across 4 protocols.</Text></View>
            <View style={styles.cardFooter}><View style={styles.metricRow}><Activity size={14} color={COLORS.SECONDARY_TEXT} /><Text style={styles.metricText}>Efficiency: 94.2%</Text></View><ChevronRight size={16} color={COLORS.SECONDARY_TEXT} /></View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Specialized Units</Text></View>
          <View style={styles.glassCard}>
            {[
              { title: 'Risk Agent', icon: Shield, status: 'Active' },
              { title: 'Yield scout', icon: Zap, status: 'Scanning' },
              { title: 'Trend Engine', icon: BarChart3, status: 'Stable' },
            ].map((unit, i, arr) => (
              <View key={i} style={[styles.listItem, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.listIconContent}><View style={styles.smallIconCircle}><unit.icon size={16} color={COLORS.ACCENT} /></View><Text style={styles.itemTitle}>{unit.title}</Text></View>
                <View style={styles.listValueContent}><Text style={styles.itemValue}>{unit.status}</Text><ChevronRight size={14} color={COLORS.SECONDARY_TEXT} /></View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BLACK },
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
  orchestratorCard: { backgroundColor: COLORS.GLASS, borderRadius: 28, padding: 24, borderWidth: 1, borderColor: COLORS.BORDER },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  agentName: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  agentRole: { color: COLORS.SECONDARY_TEXT, fontSize: 14, fontWeight: '400', marginTop: 2 },
  statusBadge: { backgroundColor: 'rgba(255, 159, 10, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: COLORS.ORANGE, fontSize: 11, fontWeight: '800' },
  taskContainer: { marginBottom: 24 },
  taskLabel: { color: COLORS.ACCENT, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  taskText: { color: '#FFF', fontSize: 16, lineHeight: 24, fontWeight: '500' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.BORDER, paddingTop: 16 },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricText: { color: COLORS.SECONDARY_TEXT, fontSize: 14, fontWeight: '600' },
  glassCard: { backgroundColor: COLORS.GLASS, borderRadius: 28, paddingHorizontal: 20, borderWidth: 1, borderColor: COLORS.BORDER },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
  listIconContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  smallIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  itemTitle: { color: '#FFF', fontSize: 17, fontWeight: '600' },
  listValueContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemValue: { color: COLORS.SECONDARY_TEXT, fontSize: 15, fontWeight: '600' },
});