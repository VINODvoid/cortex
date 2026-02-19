import React, { useState, useEffect, useRef } from 'react';
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
  TrendingUp, 
  PieChart, 
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const COLORS = {
  BLACK: '#000000',
  GLASS: 'rgba(255, 255, 255, 0.03)',
  ACCENT: '#5E5CE6',
  POSITIVE: '#30D158',
  SECONDARY_TEXT: 'rgba(235, 235, 245, 0.5)',
  BORDER: 'rgba(255, 255, 255, 0.08)',
};

export default function PortfolioScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState('1M');
  const chartOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(chartOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
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
          colors={['rgba(255, 255, 255, 0.03)', 'transparent']} 
          style={styles.fullScreenBloomBottom} 
          start={{ x: 1, y: 1 }} end={{ x: 0.2, y: 0.2 }}
        />
      </View>
      
      <View style={[styles.brandHeader, { paddingTop: insets.top + 8 }]}><Text style={styles.brandName}>CORTEX</Text></View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]}>
        <View style={styles.heroSection}>
          <Text style={styles.heroLabel}>Total Assets</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.currencyPrefix}>$</Text>
            <Text style={styles.focalValue}>128,452.94</Text>
          </View>
          <View style={styles.indicatorRow}>
            <TrendingUp size={14} color={COLORS.POSITIVE} />
            <Text style={styles.positiveText}>+$12,401.20 (10.2%)</Text>
          </View>
        </View>

        <Animated.View style={[styles.chartWrapper, { opacity: chartOpacity }]}>
          <View style={styles.chartArea}>
            {[40, 60, 45, 75, 55, 90, 85, 100, 95, 110].map((h, i) => (
              <View key={i} style={[styles.chartBar, { height: `${h * 0.6}%`, opacity: 0.1 + (i * 0.1) }]} />
            ))}
          </View>
          <View style={styles.periodRow}>
            {['1D', '1W', '1M', '1Y', 'ALL'].map((p) => (
              <Pressable 
                key={p} 
                onPress={() => { setPeriod(p); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              >
                <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <View style={styles.statsRow}>
          <View style={styles.statGlassCard}><Text style={styles.statLabel}>Available</Text><Text style={styles.statValue}>$42,105</Text></View>
          <View style={styles.statGlassCard}><Text style={styles.statLabel}>Staked</Text><Text style={styles.statValue}>$86,347</Text></View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Holdings</Text><PieChart size={18} color={COLORS.SECONDARY_TEXT} /></View>
          <View style={styles.glassCard}>
            {[
              { symbol: 'SOL', name: 'Solana', amount: '142.50', value: '$24,510', color: '#8247E5' },
              { symbol: 'USDC', name: 'USD Coin', amount: '12,040', value: '$12,040', color: '#2775CA' },
              { symbol: 'JUP', name: 'Jupiter', amount: '4,200', value: '$3,820', color: '#101419' },
            ].map((asset, i, arr) => (
              <View key={i} style={[styles.listItem, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.listIconContent}>
                  <View style={[styles.assetIcon, { backgroundColor: asset.color }]}><Text style={styles.assetSymbolText}>{asset.symbol[0]}</Text></View>
                  <View><Text style={styles.itemTitle}>{asset.name}</Text><Text style={styles.itemDesc}>{asset.amount} {asset.symbol}</Text></View>
                </View>
                <View style={styles.listValueContent}><Text style={styles.itemValue}>{asset.value}</Text><ChevronRight size={14} color={COLORS.SECONDARY_TEXT} /></View>
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
  balanceContainer: { flexDirection: 'row', alignItems: 'flex-start' },
  currencyPrefix: { color: 'rgba(255,255,255,0.3)', fontSize: 32, fontWeight: '600', marginTop: 8, marginRight: 4 },
  focalValue: { color: '#FFFFFF', fontSize: 56, fontWeight: '800', letterSpacing: -2 },
  indicatorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 6 },
  positiveText: { color: COLORS.POSITIVE, fontSize: 15, fontWeight: '600' },
  chartWrapper: { backgroundColor: COLORS.GLASS, borderRadius: 32, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: COLORS.BORDER },
  chartArea: { height: 120, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 },
  chartBar: { width: 14, backgroundColor: COLORS.ACCENT, borderRadius: 4 },
  periodRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 4 },
  periodBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 12 },
  periodBtnActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  periodText: { color: COLORS.SECONDARY_TEXT, fontSize: 12, fontWeight: '700' },
  periodTextActive: { color: '#FFF' },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  statGlassCard: { flex: 1, backgroundColor: COLORS.GLASS, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: COLORS.BORDER },
  statLabel: { color: COLORS.SECONDARY_TEXT, fontSize: 12, fontWeight: '600', marginBottom: 4 },
  statValue: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  glassCard: { backgroundColor: COLORS.GLASS, borderRadius: 28, paddingHorizontal: 20, borderWidth: 1, borderColor: COLORS.BORDER },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
  listIconContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  assetIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  assetSymbolText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  itemTitle: { color: '#FFF', fontSize: 17, fontWeight: '600', marginBottom: 2 },
  itemDesc: { color: COLORS.SECONDARY_TEXT, fontSize: 14, fontWeight: '400' },
  listValueContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemValue: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});