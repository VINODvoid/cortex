import React, { memo, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Dimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Compass, 
  Cpu, 
  Shield, 
  Workflow 
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const COLORS = {
  BLACK: '#000000',
  BAR_BG: 'rgba(10, 10, 12, 0.85)', 
  ACCENT: '#FFFFFF', 
  INACTIVE: 'rgba(255, 255, 255, 0.25)',
  BORDER: 'rgba(255, 255, 255, 0.08)',
};

const TabButton = memo(({ item, isFocused, onPress }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const beadScale = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const Icon = item.icon;
  const color = isFocused ? COLORS.ACCENT : COLORS.INACTIVE;

  useEffect(() => {
    Animated.spring(beadScale, {
      toValue: isFocused ? 1 : 0,
      tension: 300,
      friction: 15,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.88, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      <Animated.View style={[styles.tabButtonInner, { transform: [{ scale }] }]}>
        <Icon 
          size={22} 
          color={color} 
          strokeWidth={isFocused ? 2.5 : 1.5} 
        />
        <Text style={[styles.tabLabel, { color }]}>{item.label}</Text>
        
        <Animated.View 
          style={[
            styles.bead, 
            { transform: [{ scale: beadScale }], opacity: beadScale }
          ]} 
        />
      </Animated.View>
    </Pressable>
  );
});

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  
  const TABS = [
    { name: 'home', label: 'Cortex', icon: Compass },
    { name: 'agents', label: 'Swarm', icon: Cpu },
    { name: 'portfolio', label: 'Vault', icon: Shield },
    { name: 'activity', label: 'Logic', icon: Workflow },
  ] as const;

  return (
    <View style={[styles.outerContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
      <View style={styles.islandContainer}>
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.BAR_BG }]} />
        
        <View style={styles.inner}>
          {TABS.map((item, index) => {
            const isFocused = state.index === index;
            const route = state.routes[index];
            
            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate(route.name);
              }
            };

            return (
              <TabButton 
                key={item.name} 
                item={item} 
                isFocused={isFocused} 
                onPress={onPress} 
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="agents" />
      <Tabs.Screen name="portfolio" />
      <Tabs.Screen name="activity" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  outerContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24 },
  islandContainer: { height: 72, borderRadius: 36, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.BORDER },
  inner: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  tabButtonInner: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
  bead: { position: 'absolute', bottom: -12, width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFF' }
});