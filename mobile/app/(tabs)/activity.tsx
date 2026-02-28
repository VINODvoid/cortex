import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
  Easing,
  Linking,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Zap,
  Shield,
  Repeat,
  Clock,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Activity as ActivityIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppContext, type ActivityItem as ActivityItemType } from '../../context/AppContext';
import { BrandHeader } from '../../components/BrandHeader';
import { INK, VOID, SPECTRUM, BORDER } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

function getIcon(type: ActivityItemType['type']) {
  switch (type) {
    case 'PROPOSAL': return Zap;
    case 'VOTE': return Shield;
    case 'EXECUTION': return Repeat;
    default: return ActivityIcon;
  }
}

function formatTime(ts: string): string {
  const d = new Date(ts);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'JUST NOW';
  if (diffMins < 60) return `${diffMins}M AGO`;
  const diffH = Math.floor(diffMins / 60);
  if (diffH < 24) return `${diffH}H AGO`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase();
}

const ActivityRow = ({ item, isLast }: { item: ActivityItemType; isLast: boolean }) => {
  const Icon = getIcon(item.type);
  const statusColor = item.status === 'SUCCESS' ? SPECTRUM.mint : item.status === 'FAILED' ? SPECTRUM.coral : SPECTRUM.violet;

  return (
    <Pressable
      onPress={() => Haptics.selectionAsync()}
      style={({ pressed }) => [
        styles.listItem,
        pressed && { backgroundColor: 'rgba(255,255,255,0.02)' },
        isLast && { borderBottomWidth: 0 },
      ]}
    >
      <View style={styles.listLeftContent}>
        <View style={[styles.iconCircle, { borderColor: 'rgba(255,255,255,0.06)' }]}>
          <Icon size={14} color={statusColor} strokeWidth={1.5} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.action.toUpperCase()}</Text>
          <Text style={styles.itemDesc}>{item.agent.toUpperCase()} • {formatTime(item.timestamp)}</Text>
        </View>
      </View>
      <View style={styles.listRightContent}>
        {item.status === 'PENDING' && (
          <Clock size={10} color={SPECTRUM.violet} style={{ marginRight: 6 }} />
        )}
        <Text style={[styles.itemStatus, { color: statusColor }]}>
          {item.status}
        </Text>
        <ChevronRight size={12} color="rgba(255,255,255,0.2)" />
      </View>
    </Pressable>
  );
};

// ─── MAIN ACTIVITY SCREEN ────────────────────────────────────────────────────

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { activity, refresh } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);
  
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(contentFade, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, []);

  const successCount = activity.filter(a => a.status === 'SUCCESS').length;

  return (
    <View style={styles.container}>
      <BrandHeader />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 }]}
        style={{ opacity: contentFade }}
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
        {/* ─── Success Hero ─── */}
        <View style={styles.heroSection}>
          <Text style={styles.microLabel}>DECISION ACCURACY</Text>
          <View style={styles.focalRow}>
            <Text style={styles.focalValue}>{successCount}</Text>
            <Text style={styles.focalSubValue}>SUCCESSES</Text>
          </View>
          <View style={styles.accuracyPill}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>SWARM OPERATING AT PEAK CAPACITY</Text>
          </View>
        </View>

        {/* ─── Logic Timeline ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>LOGIC TIMELINE</Text>
          </View>
          <View style={styles.timelineList}>
            {activity.length === 0 ? (
              <View style={styles.emptyState}>
                <ActivityIcon size={24} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>NO EVENTS RECORDED</Text>
              </View>
            ) : (
              activity.map((item, i) => (
                <ActivityRow key={item.id} item={item} isLast={i === activity.length - 1} />
              ))
            )}
          </View>
        </View>

        {/* ─── Verification Archive ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>ON-CHAIN VERIFICATION</Text>
          </View>
          <View style={styles.glassList}>
            {activity.filter(a => a.txSignature).slice(0, 3).map((item, i, arr) => (
              <Pressable key={i} style={[styles.verificationItem, i === arr.length - 1 && { borderBottomWidth: 0 }]} onPress={() => Linking.openURL(`https://explorer.solana.com/tx/${item.txSignature}?cluster=testnet`)}>
                <View>
                  <Text style={styles.verifTitle}>{item.action.toUpperCase()}</Text>
                  <Text style={styles.verifSig}>{item.txSignature?.slice(0, 16)}...</Text>
                </View>
                <ArrowUpRight size={14} color={SPECTRUM.violet} />
              </Pressable>
            ))}
            {activity.filter(a => a.txSignature).length === 0 && (
              <Text style={styles.emptyTextSmall}>Awaiting executions...</Text>
            )}
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
  heroSection: { alignItems: 'center', marginVertical: 32 },
  microLabel: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 12 },
  focalRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  focalValue: { color: '#FFF', fontSize: 64, fontWeight: '800', letterSpacing: -2, lineHeight: 64 },
  focalSubValue: { color: 'rgba(255,255,255,0.3)', fontSize: 24, fontWeight: '600', marginBottom: 8 },
  accuracyPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(52, 211, 153, 0.05)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 8, marginTop: 24, borderWidth: 1, borderColor: 'rgba(52, 211, 153, 0.1)' },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: SPECTRUM.mint },
  activeText: { color: SPECTRUM.mint, fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  // Section Styles
  section: { marginBottom: 40 },
  sectionHeader: { marginBottom: 16 },
  sectionLabel: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  timelineList: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  
  // List Item Styles
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  listLeftContent: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  textContainer: { flex: 1 },
  itemTitle: { color: '#FFF', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  itemDesc: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 4 },
  listRightContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemStatus: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  emptyTextSmall: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '800', padding: 20, textAlign: 'center' },

  // Verification Archive
  glassList: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  verificationItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  verifTitle: { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  verifSig: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '600' },
});
