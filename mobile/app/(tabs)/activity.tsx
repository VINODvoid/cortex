import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
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
  Activity,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppContext, type ActivityItem as ActivityItemType } from '../../context/AppContext';

const { width, height } = Dimensions.get('window');

const COLORS = {
  BLACK: '#000000',
  GLASS: 'rgba(255, 255, 255, 0.03)',
  ACCENT: '#5E5CE6',
  POSITIVE: '#30D158',
  SECONDARY_TEXT: 'rgba(235, 235, 245, 0.5)',
  BORDER: 'rgba(255, 255, 255, 0.08)',
};

function getIcon(type: ActivityItemType['type']) {
  switch (type) {
    case 'PROPOSAL': return Zap;
    case 'VOTE': return Shield;
    case 'EXECUTION': return Repeat;
    default: return Activity;
  }
}

function getIconBg(type: ActivityItemType['type'], status: ActivityItemType['status']): string {
  if (status === 'SUCCESS') return COLORS.POSITIVE;
  if (status === 'FAILED') return 'rgba(255, 69, 58, 0.6)';
  if (type === 'PROPOSAL') return COLORS.ACCENT;
  return 'rgba(255, 255, 255, 0.1)';
}

function formatTime(ts: string): string {
  const d = new Date(ts);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffH = Math.floor(diffMins / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function isToday(ts: string): boolean {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

const ActivityRow = ({ item, isLast }: { item: ActivityItemType; isLast: boolean }) => {
  const Icon = getIcon(item.type);
  const iconBg = getIconBg(item.type, item.status);
  const subtitle = `${item.agent} • ${formatTime(item.timestamp)}`;
  const value = item.target || (item.status === 'SUCCESS' ? 'Done' : item.status === 'FAILED' ? 'Failed' : '');

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
        <View style={[styles.smallIconCircle, { backgroundColor: iconBg }]}>
          <Icon size={16} color="#FFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.action}
          </Text>
          <View style={styles.itemSubRow}>
            {item.status === 'PENDING' && (
              <Clock size={12} color={COLORS.ACCENT} style={{ marginRight: 4 }} />
            )}
            <Text
              style={[styles.itemDesc, item.status === 'PENDING' && { color: COLORS.ACCENT }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.listRightContent}>
        {value ? (
          <Text style={styles.itemValue} numberOfLines={1} ellipsizeMode="clip">
            {value}
          </Text>
        ) : null}
        <ChevronRight size={14} color={COLORS.SECONDARY_TEXT} />
      </View>
    </Pressable>
  );
};

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { activity } = useAppContext();

  const todayItems = activity.filter((i) => isToday(i.timestamp));
  const earlierItems = activity.filter((i) => !isToday(i.timestamp));

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
          colors={['rgba(255, 255, 255, 0.03)', 'transparent']}
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
          <Text style={styles.heroLabel}>Event Timeline</Text>
          <View style={styles.focalRow}>
            <Text style={styles.focalValue}>{String(activity.length).padStart(2, '0')}</Text>
            <Text style={styles.focalSubValue}>Events</Text>
          </View>
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={styles.filterPill}
          >
            <Filter size={14} color={COLORS.ACCENT} />
            <Text style={styles.filterText}>Filter History</Text>
          </Pressable>
        </View>

        {activity.length === 0 && (
          <View style={styles.emptyState}>
            <Activity size={32} color={COLORS.SECONDARY_TEXT} />
            <Text style={styles.emptyText}>No activity yet</Text>
            <Text style={styles.emptySubtext}>Run a cycle from the home screen to see agent events here.</Text>
          </View>
        )}

        {todayItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Today</Text></View>
            <View style={styles.glassCard}>
              {todayItems.map((item, i) => (
                <ActivityRow key={item.id} item={item} isLast={i === todayItems.length - 1} />
              ))}
            </View>
          </View>
        )}

        {earlierItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Earlier</Text></View>
            <View style={styles.glassCard}>
              {earlierItems.map((item, i) => (
                <ActivityRow key={item.id} item={item} isLast={i === earlierItems.length - 1} />
              ))}
            </View>
          </View>
        )}
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
  focalRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  focalValue: { color: '#FFFFFF', fontSize: 64, fontWeight: '800', letterSpacing: -2, lineHeight: 64 },
  focalSubValue: { color: 'rgba(255,255,255,0.3)', fontSize: 32, fontWeight: '600', marginBottom: 6 },
  filterPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(94, 92, 230, 0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 8, marginTop: 24 },
  filterText: { color: COLORS.ACCENT, fontSize: 13, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  emptySubtext: { color: COLORS.SECONDARY_TEXT, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  section: { marginBottom: 32 },
  sectionHeader: { marginBottom: 16, paddingHorizontal: 4 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  glassCard: { backgroundColor: COLORS.GLASS, borderRadius: 28, paddingHorizontal: 20, borderWidth: 1, borderColor: COLORS.BORDER, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER, overflow: 'hidden' },
  listLeftContent: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1, overflow: 'hidden' },
  textContainer: { flex: 1, overflow: 'hidden' },
  smallIconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  itemTitle: { color: '#FFF', fontSize: 17, fontWeight: '600', marginBottom: 2 },
  itemSubRow: { flexDirection: 'row', alignItems: 'center' },
  itemDesc: { color: COLORS.SECONDARY_TEXT, fontSize: 14, fontWeight: '400' },
  listRightContent: { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 80, justifyContent: 'flex-end' },
  itemValue: { color: '#FFF', fontSize: 16, fontWeight: '600', textAlign: 'right' },
});
