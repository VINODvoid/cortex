import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState, useEffect } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
  Easing,
  SharedValue,
  interpolateColor,
} from "react-native-reanimated";
import {
  Cpu, Zap, Target, Shield, Activity, Radio,
  ChevronRight, Wallet, ArrowRight, Fingerprint, Check,
} from "lucide-react-native";
import { BrandHeader } from "../components/BrandHeader";
import { INK, VOID, RADIUS, SPECTRUM } from "../constants/theme";
import { useWallet } from "../context/WalletContext";

const { width, height } = Dimensions.get("window");

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const VC = 150; 
const NODE_R = 100; 
const NEURAL_NODES = Array.from({ length: 6 }, (_, i) => {
  const a = ((i * 60 - 90) * Math.PI) / 180;
  return { x: Math.cos(a) * NODE_R, y: Math.sin(a) * NODE_R, deg: i * 60 - 90 };
});

const HEX_SIDES = NEURAL_NODES.map((n, i) => {
  const n2 = NEURAL_NODES[(i + 1) % 6];
  return { 
    cx: (n.x + n2.x) / 2, 
    cy: (n.y + n2.y) / 2, 
    len: Math.sqrt((n2.x - n.x) ** 2 + (n2.y - n.y) ** 2), 
    angle: (Math.atan2(n2.y - n.y, n2.x - n.x) * 180) / Math.PI 
  };
});

const SWARM_AGENTS = [
  { orbit: 60, speed: 6500, startAngle: 0, Icon: Cpu },
  { orbit: 60, speed: 6500, startAngle: 120, Icon: Zap },
  { orbit: 60, speed: 6500, startAngle: 240, Icon: Target },
  { orbit: 100, speed: 11000, startAngle: 60, Icon: Shield },
  { orbit: 100, speed: 11000, startAngle: 180, Icon: Activity },
  { orbit: 100, speed: 11000, startAngle: 300, Icon: Radio },
];

const SLIDES = [
  { id: "1", tag: "01 / INTELLIGENCE", title: "CORTEX", desc: "Autonomous intelligence processing market fractals via neural pathways.", accent: SPECTRUM.violet, type: "neural" },
  { id: "2", tag: "02 / COORDINATION", title: "SWARM", desc: "Multi-agent consensus executing across fragmented liquidity surfaces.", accent: SPECTRUM.mint, type: "swarm" },
  { id: "3", tag: "03 / PERFORMANCE", title: "VELOCITY", desc: "Sub-second finality with direct-to-validator pathfinding for execution.", accent: SPECTRUM.gold, type: "velocity" },
  { id: "4", tag: "04 / AUTHENTICATION", title: "DEPLOY", desc: "Authorize neural uplink via Solana network to begin protocol session.", accent: SPECTRUM.azure, type: "deploy" },
];

// ─── VISUAL COMPONENTS ───────────────────────────────────────────────────────

const NeuralVisual = ({ accent }: { accent: string }) => {
  const glow = useSharedValue(0);
  const scan = useSharedValue(0);
  useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }), -1, true);
    scan.value = withRepeat(withTiming(1, { duration: 8000, easing: Easing.linear }), -1, false);
  }, []);
  const coreStyle = useAnimatedStyle(() => ({ opacity: interpolate(glow.value, [0, 1], [0.4, 1]), transform: [{ scale: interpolate(glow.value, [0, 1], [0.95, 1.05]) }] }));
  const scanStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${scan.value * 360}deg` }] }));
  return (
    <View style={styles.visualContainer}>
      <Animated.View style={[styles.scanLine, scanStyle]}><View style={[styles.scanHalfBright, { backgroundColor: accent }]} /><View style={styles.scanHalfDim} /></Animated.View>
      {HEX_SIDES.map((s, i) => (<View key={i} style={[styles.hexSide, { width: s.len, left: VC + s.cx - s.len / 2, top: VC + s.cy - 0.5, transform: [{ rotate: `${s.angle}deg` }] }]} />))}
      {NEURAL_NODES.map((n, i) => (<View key={i} style={[styles.branchLine, { width: NODE_R, left: VC + n.x / 2 - NODE_R / 2, top: VC + n.y / 2 - 0.5, transform: [{ rotate: `${n.deg}deg` }] }]} />))}
      <Animated.View style={[styles.coreGlow, { borderColor: accent }, coreStyle]} />
      <Animated.View style={[styles.coreSolid, coreStyle]} />
    </View>
  );
};

type SwarmAgent = typeof SWARM_AGENTS[0];

const AgentOrbit = ({ agent, accent }: { agent: SwarmAgent; accent: string }) => {
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(withTiming(1, { duration: agent.speed, easing: Easing.linear }), -1, false);
  }, []);
  const orbitStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${agent.startAngle + rot.value * 360}deg` }] }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${-agent.startAngle - rot.value * 360}deg` }] }));
  return (
    <Animated.View style={[styles.agentOrbit, { width: agent.orbit * 2, height: agent.orbit * 2, left: VC - agent.orbit, top: VC - agent.orbit }, orbitStyle]}>
      <Animated.View style={[styles.agentBox, { top: -13, left: agent.orbit - 13, borderColor: accent }, iconStyle]}>
        <agent.Icon size={12} color="#FFF" strokeWidth={1.5} />
      </Animated.View>
    </Animated.View>
  );
};

const SwarmVisual = ({ accent }: { accent: string }) => (
  <View style={styles.visualContainer}>
    {[60, 100].map((r) => (
      <View key={r} style={[styles.orbitRing, { width: r * 2, height: r * 2, borderRadius: r, left: VC - r, top: VC - r }]} />
    ))}
    {SWARM_AGENTS.map((agent, i) => (
      <AgentOrbit key={i} agent={agent} accent={accent} />
    ))}
    <View style={styles.coreSolidSmall} />
  </View>
);

const BAR_HEIGHTS = [0.3, 0.8, 0.5, 1.0, 0.4, 0.7, 0.55];

const VelocityBar = ({ h, i, accent }: { h: number; i: number; accent: string }) => {
  const anim = useSharedValue(0);
  useEffect(() => {
    anim.value = withRepeat(withTiming(1, { duration: 500 + i * 100 }), -1, true);
  }, []);
  const barStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: interpolate(anim.value, [0, 1], [0.4, 1.7]) }],
    backgroundColor: accent,
  }));
  return <Animated.View style={[styles.velocityBar, { height: 48 * h }, barStyle]} />;
};

const VelocityVisual = ({ accent }: { accent: string }) => (
  <View style={styles.visualContainer}>
    <View style={styles.velocityRow}>
      {BAR_HEIGHTS.map((h, i) => <VelocityBar key={i} h={h} i={i} accent={accent} />)}
    </View>
  </View>
);

const DeployVisual = ({ accent, connected }: { accent: string, connected: boolean }) => {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 15000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  const gateStyle = useAnimatedStyle(() => ({ opacity: interpolate(pulse.value, [0, 1], [0.3, 0.8]), transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.1]) }] }));
  return (
    <View style={styles.visualContainer}>
      <Animated.View style={[styles.authRing, { borderColor: connected ? SPECTRUM.mint : accent }, spinStyle]}>
        <View style={[styles.authNode, { backgroundColor: connected ? SPECTRUM.mint : accent, top: -4, left: '50%' }]} />
      </Animated.View>
      <Animated.View style={[styles.authGate, { borderColor: connected ? SPECTRUM.mint : accent }, gateStyle]} />
      <View style={[styles.glassCore, { backgroundColor: connected ? SPECTRUM.mint : accent, shadowColor: connected ? SPECTRUM.mint : accent }]}>
        {connected ? <Check size={32} color="#000" strokeWidth={3} /> : <Fingerprint size={32} color="#000" strokeWidth={2} />}
      </View>
    </View>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function Onboarding() {
  const router = useRouter();
  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { connected, connecting, connect, isRestoring } = useWallet();

  const scrollHandler = useAnimatedScrollHandler({ onScroll: (e) => { scrollX.value = e.contentOffset.x; } });

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Auto-redirect if session was restored from storage (skip onboarding)
  useEffect(() => {
    if (!isRestoring && connected) {
      router.replace("/(tabs)/home");
    }
  }, [isRestoring, connected]);

  // Also redirect after connecting on the last slide
  useEffect(() => {
    if (activeIndex === 3 && connected && !isRestoring) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const t = setTimeout(() => router.replace("/(tabs)/home"), 1200);
      return () => clearTimeout(t);
    }
  }, [connected, activeIndex, isRestoring, router]);

  const isLast = activeIndex === 3;
  const btnAccent = isLast && connected ? SPECTRUM.mint : SLIDES[activeIndex].accent;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      <View style={StyleSheet.absoluteFill}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: VOID.base }]} />
        <AtmosphericGlow scrollX={scrollX} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)', VOID.base]} style={styles.vignette} locations={[0, 0.4, 1]} />
      </View>
      <View style={styles.header}>
        <BrandHeader showProfile={false} showSettings={false} hideBorder transparent />
        <Pressable onPress={() => router.replace("/(tabs)/home")} style={styles.skipBtn}>
          <Text style={styles.skipText}>SKIP</Text>
        </Pressable>
      </View>
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler} scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item, index }) => (
          <Slide item={item} index={index} scrollX={scrollX} connected={connected} router={router} />
        )}
      />
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => <PaginationDot key={i} index={i} scrollX={scrollX} />)}
        </View>
        <Pressable
          onPress={isLast ? connect : handleNext}
          disabled={isLast && (connecting || connected)}
          style={({ pressed }) => [
            styles.pill,
            { borderColor: `${btnAccent}30` },
            pressed && { opacity: 0.72 },
          ]}
        >
          {isLast && connecting ? (
            <ActivityIndicator color={btnAccent} size="small" style={{ marginHorizontal: 6 }} />
          ) : (
            <>
              <Text style={[styles.pillLabel, { color: btnAccent }]}>
                {!isLast ? 'CONTINUE' : connected ? 'AUTHORIZED' : 'CONNECT'}
              </Text>
              <View style={[styles.pillDot, { backgroundColor: btnAccent }]}>
                {!isLast
                  ? <ChevronRight color="#000" size={13} strokeWidth={3} />
                  : connected
                    ? <Check color="#000" size={13} strokeWidth={3} />
                    : <Wallet color="#000" size={12} strokeWidth={2.5} />}
              </View>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

// ─── SLIDE COMPONENT ─────────────────────────────────────────────────────────

const Slide = ({ item, index, scrollX, connected, router }: any) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
  const visualStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP),
    transform: [
      { scale: interpolate(scrollX.value, inputRange, [0.7, 1, 0.7], Extrapolate.CLAMP) },
      { translateY: interpolate(scrollX.value, inputRange, [40, 0, -40], Extrapolate.CLAMP) },
    ],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP),
    transform: [{ translateX: interpolate(scrollX.value, inputRange, [width * 0.2, 0, -width * 0.2], Extrapolate.CLAMP) }],
  }));

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.visualArea, visualStyle]}>
        {item.type === "neural"   && <NeuralVisual accent={item.accent} />}
        {item.type === "swarm"    && <SwarmVisual accent={item.accent} />}
        {item.type === "velocity" && <VelocityVisual accent={item.accent} />}
        {item.type === "deploy"   && <DeployVisual accent={item.accent} connected={connected} />}
      </Animated.View>
      <Animated.View style={[styles.textArea, textStyle]}>
        <Text style={[styles.tag, { color: item.accent }]}>{item.tag}</Text>
        <Text style={[styles.title, index === 0 && { fontSize: 72, lineHeight: 68 }]}>{item.title}</Text>
        <Text style={styles.desc}>{item.desc}</Text>
        {index === 3 && (
          <Pressable
            onPress={() => router.replace("/(tabs)/home")}
            style={({ pressed }) => [styles.guestLink, pressed && { opacity: 0.5 }]}
          >
            <Text style={styles.guestLinkText}>continue without wallet</Text>
            <ArrowRight size={14} color="rgba(255,255,255,0.8)" strokeWidth={2} />
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
};

const AtmosphericGlow = ({ scrollX }: { scrollX: SharedValue<number> }) => {
  const style = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(scrollX.value, SLIDES.map((_, i) => i * width), SLIDES.map(s => s.accent)), opacity: 0.1 }));
  return <Animated.View style={[styles.bgGlow, style]} />;
};

const PaginationDot = ({ index, scrollX }: any) => {
  const style = useAnimatedStyle(() => {
    const active = interpolate(scrollX.value, [(index - 1) * width, index * width, (index + 1) * width], [0, 1, 0], Extrapolate.CLAMP);
    return { width: interpolate(active, [0, 1], [6, 24]), opacity: interpolate(active, [0, 1], [0.2, 1]), backgroundColor: INK.primary };
  });
  return <Animated.View style={[styles.dot, style]} />;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: VOID.base },
  bgGlow: { position: 'absolute', top: -height * 0.25, left: -width * 0.25, width: width * 1.5, height: width * 1.5, borderRadius: width },
  vignette: { position: 'absolute', inset: 0 },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skipBtn: { marginTop: 60, marginRight: 24, padding: 8 },
  skipText: { color: INK.phantom, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  slide: { width, flex: 1 },
  visualArea: { flex: 0.5, justifyContent: 'center', alignItems: 'center' },
  textArea: { flex: 0.5, paddingHorizontal: 40, justifyContent: 'flex-start', paddingTop: 20 },
  visualContainer: { width: 300, height: 300, justifyContent: 'center', alignItems: 'center' },
  scanLine: { position: "absolute", width: 256, height: 1, left: VC - 128, top: VC - 0.5 },
  scanHalfBright: { position: "absolute", right: 0, width: 128, height: 1 },
  scanHalfDim: { position: "absolute", left: 0, width: 128, height: 1, backgroundColor: "rgba(255,255,255,0.05)" },
  hexSide: { position: "absolute", height: 1, backgroundColor: "rgba(255,255,255,0.15)" },
  branchLine: { position: "absolute", height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  coreGlow: { position: "absolute", width: 60, height: 60, borderRadius: 30, borderWidth: 1 },
  coreSolid: { position: "absolute", width: 24, height: 24, borderRadius: 12, backgroundColor: "#FFF" },
  orbitRing: { position: "absolute", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  agentOrbit: { position: "absolute" },
  agentBox: { position: "absolute", width: 26, height: 26, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, justifyContent: "center", alignItems: "center" },
  coreSolidSmall: { position: "absolute", width: 16, height: 16, borderRadius: 8, backgroundColor: "#FFF" },
  velocityRow: { flexDirection: "row", alignItems: "flex-end", gap: 10, height: 80 },
  velocityBar: { width: 8, borderRadius: 4 },
  authRing: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderStyle: 'dashed' },
  authNode: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
  authGate: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 1, borderStyle: 'dashed' },
  glassCore: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.5, shadowRadius: 20 },
  tag: { fontSize: 11, fontWeight: '900', letterSpacing: 4, marginBottom: 16, textTransform: 'uppercase' },
  title: { fontSize: 60, fontWeight: '800', color: INK.primary, lineHeight: 56, marginBottom: 20, letterSpacing: -3 },
  desc: { fontSize: 15, color: INK.secondary, lineHeight: 22, fontWeight: '500', marginBottom: 20 },
  // ── guest link (slide 4 textArea) ─────────────────────────────────────────
  guestLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingVertical: 16, paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: RADIUS.md, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 8 },
  guestLinkText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '700', letterSpacing: 0.3 },
  // ── footer ────────────────────────────────────────────────────────────────
  footer: { position: 'absolute', bottom: 60, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pagination: { flexDirection: 'row', gap: 8 },
  dot: { height: 4, borderRadius: 2 },
  // ── unified pill (all CTAs) ───────────────────────────────────────────────
  pill: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingLeft: 18, paddingRight: 10, borderRadius: RADIUS.pill, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  pillLabel: { fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  pillDot: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' }
});
