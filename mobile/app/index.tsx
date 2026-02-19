import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Platform,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Cpu, Zap, Target, Shield, Activity, Radio, ChevronRight } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

const COLORS = {
  BLACK: '#000000',
  PRIMARY_TEXT: '#FFFFFF',
  SECONDARY_TEXT: 'rgba(235, 235, 245, 0.6)',
  ACCENT: '#5E5CE6',
};

const SLIDES = [
  { id: "1", tag: "01 / INTELLIGENCE", title: "CORTEX", desc: "Autonomous agents analyzing market fractals.", type: "neural",    accent: "#6E8EFF", accent2: "#B06EFF" },
  { id: "2", tag: "02 / COORDINATION", title: "SWARM", desc: "Liquidity scouts executing in perfect unison.", type: "swarm",     accent: "#36E8B8", accent2: "#36B8E8" },
  { id: "3", tag: "03 / VELOCITY", title: "VELOCITY", desc: "Sub-second finality. Zero latency execution.", type: "velocity",   accent: "#FFB236", accent2: "#FF6B36" },
  { id: "4", tag: "04 / EXECUTION", title: "DEPLOY", desc: "System ready. Initiate protocol sequence.", type: "deploy",         accent: "#FF4EFF", accent2: "#FF4E9E" },
];

const VC = 150; 
const NODE_R = 108; 
const NEURAL_NODES = Array.from({ length: 6 }, (_, i) => {
  const a = ((i * 60 - 90) * Math.PI) / 180;
  return { x: Math.cos(a) * NODE_R, y: Math.sin(a) * NODE_R, deg: i * 60 - 90 };
});

const HEX_SIDES = NEURAL_NODES.map((n, i) => {
  const n2 = NEURAL_NODES[(i + 1) % 6];
  return { cx: (n.x + n2.x) / 2, cy: (n.y + n2.y) / 2, len: Math.sqrt((n2.x - n.x) ** 2 + (n2.y - n.y) ** 2), angle: (Math.atan2(n2.y - n.y, n2.x - n.x) * 180) / Math.PI };
});

const SWARM_AGENTS = [
  { orbit: 65, speed: 6500, startAngle: 0, Icon: Cpu },
  { orbit: 65, speed: 6500, startAngle: 120, Icon: Zap },
  { orbit: 65, speed: 6500, startAngle: 240, Icon: Target },
  { orbit: 112, speed: 11000, startAngle: 60, Icon: Shield },
  { orbit: 112, speed: 11000, startAngle: 180, Icon: Activity },
  { orbit: 112, speed: 11000, startAngle: 300, Icon: Radio },
];

// ─── VISUAL COMPONENTS ───────────────────────────────────────────────────────

const NeuralVisual = () => {
  const coreGlow = useRef(new Animated.Value(0)).current;
  const scanRot = useRef(new Animated.Value(0)).current;
  const nodeAnims = useRef(NEURAL_NODES.map(() => new Animated.Value(0.12))).current;
  const sigX = useRef(NEURAL_NODES.map(() => new Animated.Value(0))).current;
  const sigY = useRef(NEURAL_NODES.map(() => new Animated.Value(0))).current;
  const sigOp = useRef(NEURAL_NODES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([Animated.timing(coreGlow, { toValue: 1, duration: 1800, useNativeDriver: true }), Animated.timing(coreGlow, { toValue: 0, duration: 1800, useNativeDriver: true })])).start();
    Animated.loop(Animated.timing(scanRot, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true })).start();
    const fireSignals = () => {
      NEURAL_NODES.forEach((node, i) => {
        setTimeout(() => {
          sigX[i].setValue(0); sigY[i].setValue(0); sigOp[i].setValue(0);
          Animated.sequence([
            Animated.timing(sigOp[i], { toValue: 1, duration: 60, useNativeDriver: true }),
            Animated.parallel([
              Animated.timing(sigX[i], { toValue: node.x, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
              Animated.timing(sigY[i], { toValue: node.y, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            ]),
            Animated.timing(sigOp[i], { toValue: 0, duration: 120, useNativeDriver: true }),
          ]).start();
          setTimeout(() => { Animated.sequence([Animated.timing(nodeAnims[i], { toValue: 1, duration: 160, useNativeDriver: true }), Animated.timing(nodeAnims[i], { toValue: 0.12, duration: 900, useNativeDriver: true })]).start(); }, 800);
        }, i * 1200);
      });
    };
    fireSignals(); const id = setInterval(fireSignals, 8000); return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.visualContainer}>
      <Animated.View style={[styles.scanLine, { transform: [{ rotate: scanRot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }]}><View style={styles.scanHalfBright} /><View style={styles.scanHalfDim} /></Animated.View>
      {HEX_SIDES.map((s, i) => (<View key={i} style={[styles.hexSide, { width: s.len, left: VC + s.cx - s.len / 2, top: VC + s.cy - 0.5, transform: [{ rotate: `${s.angle}deg` }] }]} />))}
      {NEURAL_NODES.map((n, i) => (<View key={i} style={[styles.branchLine, { width: NODE_R, left: VC + n.x / 2 - NODE_R / 2, top: VC + n.y / 2 - 0.5, transform: [{ rotate: `${n.deg}deg` }] }]} />))}
      {NEURAL_NODES.map((_, i) => (<Animated.View key={i} style={[styles.signalDot, { opacity: sigOp[i], transform: [{ translateX: sigX[i] }, { translateY: sigY[i] }] }]} />))}
      {NEURAL_NODES.map((n, i) => (<Animated.View key={i} style={[styles.node, { left: VC + n.x - 6, top: VC + n.y - 6, opacity: nodeAnims[i] }]} />))}
      <Animated.View style={[styles.coreGlow, { opacity: coreGlow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] }), transform: [{ scale: coreGlow.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.05] }) }] }]} />
      <Animated.View style={[styles.coreSolid, { transform: [{ scale: coreGlow.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.05] }) }] }]} />
    </View>
  );
};

const SwarmVisual = () => (
  <View style={styles.visualContainer}>
    {[65, 112].map((r) => (<View key={r} style={[styles.orbitRing, { width: r * 2, height: r * 2, borderRadius: r, left: VC - r, top: VC - r }]} />))}
    {SWARM_AGENTS.map((agent, i) => {
      const rot = useRef(new Animated.Value(0)).current;
      useEffect(() => { Animated.loop(Animated.timing(rot, { toValue: 1, duration: agent.speed, easing: Easing.linear, useNativeDriver: true })).start(); }, []);
      return (
        <Animated.View key={i} style={[styles.agentOrbit, { width: agent.orbit * 2, height: agent.orbit * 2, left: VC - agent.orbit, top: VC - agent.orbit, transform: [{ rotate: rot.interpolate({ inputRange: [0, 1], outputRange: [`${agent.startAngle}deg`, `${agent.startAngle + 360}deg`] }) }] }]}>
          <Animated.View style={[styles.agentBox, { top: -13, left: agent.orbit - 13, transform: [{ rotate: rot.interpolate({ inputRange: [0, 1], outputRange: [`${-agent.startAngle}deg`, `${-agent.startAngle - 360}deg`] }) }] }]}><agent.Icon size={12} color="#FFF" strokeWidth={1.5} /></Animated.View>
        </Animated.View>
      );
    })}
    <View style={styles.coreSolidSmall} />
  </View>
);

const VelocityVisual = () => {
  const BARS = [0.3, 0.8, 0.5, 1.0, 0.4, 0.7, 0.55];
  return (
    <View style={styles.visualContainer}>
      <View style={styles.velocityRow}>{BARS.map((h, i) => {
        const anim = useRef(new Animated.Value(0)).current;
        useEffect(() => { Animated.loop(Animated.sequence([Animated.timing(anim, { toValue: 1, duration: 480 + i * 80, useNativeDriver: true }), Animated.timing(anim, { toValue: 0, duration: 480 + i * 80, useNativeDriver: true })])).start(); }, []);
        return <Animated.View key={i} style={[styles.velocityBar, { height: 48 * h, transform: [{ scaleY: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.7] }) }] }]} />;
      })}</View>
    </View>
  );
};

const DeployVisual = () => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.loop(Animated.sequence([Animated.timing(anim, { toValue: 1, duration: 1500, useNativeDriver: true }), Animated.timing(anim, { toValue: 0, duration: 1500, useNativeDriver: true })])).start(); }, []);
  return (
    <View style={styles.visualContainer}>
      <Animated.View style={[styles.deployOuter, { transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1.12] }) }] }]} />
      <View style={styles.deployInner}><View style={styles.deployArrow} /></View>
    </View>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function Onboarding() {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/home");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* SEAMLESS ATMOSPHERIC BLOOMS */}
      <View style={StyleSheet.absoluteFill}>
        {SLIDES.map((slide, index) => {
          const opacity = scrollX.interpolate({ 
            inputRange: [(index - 1) * width, index * width, (index + 1) * width], 
            outputRange: [0, 1, 0], 
            extrapolate: 'clamp' 
          });
          return (
            <Animated.View key={slide.id} style={[StyleSheet.absoluteFill, { opacity }]}>
              {/* Top Source */}
              <LinearGradient 
                colors={[`${slide.accent}12`, 'transparent']} 
                style={styles.fullScreenBloom} 
                start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.6 }} 
              />
              {/* Bottom Subtle Source */}
              <LinearGradient 
                colors={['transparent', `${slide.accent2 || slide.accent}08`]} 
                style={styles.fullScreenBloom} 
                start={{ x: 0.5, y: 0.4 }} end={{ x: 0.5, y: 1 }} 
              />
            </Animated.View>
          );
        })}
      </View>

      {/* REFINED HEADER */}
      <SafeAreaView style={styles.header}>
        <Text style={styles.brandName}>CORTEX</Text>
      </SafeAreaView>

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(e) => setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item, index }) => {
          const opacity = scrollX.interpolate({ inputRange: [(index - 0.5) * width, index * width, (index + 0.5) * width], outputRange: [0, 1, 0] });
          const visualScale = scrollX.interpolate({ inputRange: [(index - 1) * width, index * width, (index + 1) * width], outputRange: [0.8, 1, 0.8] });

          return (
            <View style={styles.slide}>
              <Animated.View style={[styles.visualSection, { opacity, transform: [{ scale: visualScale }] }]}>
                {item.type === "neural" && <NeuralVisual />}
                {item.type === "swarm" && <SwarmVisual />}
                {item.type === "velocity" && <VelocityVisual />}
                {item.type === "deploy" && <DeployVisual />}
              </Animated.View>
              <Animated.View style={[styles.textSection, { opacity }]}>
                <Text style={[styles.tag, { color: item.accent }]}>{item.tag}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.desc}>{item.desc}</Text>
              </Animated.View>
            </View>
          );
        }}
      />

      {/* UNIFIED FOOTER AREA */}
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => {
            const dotWidth = scrollX.interpolate({ inputRange: [(i - 1) * width, i * width, (i + 1) * width], outputRange: [8, 24, 8], extrapolate: 'clamp' });
            const dotOpacity = scrollX.interpolate({ inputRange: [(i - 1) * width, i * width, (i + 1) * width], outputRange: [0.2, 1, 0.2], extrapolate: 'clamp' });
            return <Animated.View key={i} style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]} />;
          })}
        </View>
        <Pressable onPress={handleNext} style={({ pressed }) => [styles.button, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}>
          <Text style={styles.buttonText}>{currentIndex === SLIDES.length - 1 ? 'GET STARTED' : 'CONTINUE'}</Text>
          <ChevronRight size={18} color={COLORS.BLACK} strokeWidth={3} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BLACK },
  header: { position: 'absolute', top: 0, width, alignItems: 'center', zIndex: 10 },
  brandName: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '800', letterSpacing: 6, marginTop: 12 },
  fullScreenBloom: { ...StyleSheet.absoluteFillObject },
  slide: { width, flex: 1 },
  visualSection: { flex: 0.55, justifyContent: "center", alignItems: "center" },
  visualContainer: { width: 300, height: 300, justifyContent: "center", alignItems: "center" },
  textSection: { flex: 0.45, paddingHorizontal: 40, alignItems: 'center' }, // CHANGED: CENTER ALIGNED
  tag: { fontSize: 13, fontWeight: "700", letterSpacing: 2, marginBottom: 12, textAlign: 'center' },
  title: { color: COLORS.PRIMARY_TEXT, fontSize: 48, fontWeight: "800", letterSpacing: -1.5, marginBottom: 16, textAlign: 'center' },
  desc: { color: COLORS.SECONDARY_TEXT, fontSize: 18, lineHeight: 28, fontWeight: '400', textAlign: 'center' },
  footer: { position: "absolute", bottom: 60, width, paddingHorizontal: 40, gap: 40 },
  pagination: { flexDirection: "row", gap: 8, justifyContent: 'center' },
  dot: { height: 8, borderRadius: 4, backgroundColor: COLORS.PRIMARY_TEXT },
  button: { backgroundColor: COLORS.PRIMARY_TEXT, height: 64, borderRadius: 32, flexDirection: 'row', justifyContent: "center", alignItems: "center", gap: 10 },
  buttonText: { color: COLORS.BLACK, fontSize: 16, fontWeight: "800", letterSpacing: 1 },
  
  // Visual Internal Styles
  scanLine: { position: "absolute", width: 256, height: 1, left: VC - 128, top: VC - 0.5 },
  scanHalfBright: { position: "absolute", right: 0, width: 128, height: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  scanHalfDim: { position: "absolute", left: 0, width: 128, height: 1, backgroundColor: "rgba(255,255,255,0.05)" },
  hexSide: { position: "absolute", height: 1, backgroundColor: "rgba(255,255,255,0.15)" },
  branchLine: { position: "absolute", height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  signalDot: { position: "absolute", width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFF", left: VC-3, top: VC-3 },
  node: { position: "absolute", width: 12, height: 12, borderRadius: 6, backgroundColor: "#FFF" },
  coreGlow: { position: "absolute", width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  coreSolid: { position: "absolute", width: 24, height: 24, borderRadius: 12, backgroundColor: "#FFF" },
  orbitRing: { position: "absolute", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  agentOrbit: { position: "absolute" },
  agentBox: { position: "absolute", width: 26, height: 26, borderRadius: 6, backgroundColor: "#1C1C1E", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", justifyContent: "center", alignItems: "center" },
  coreSolidSmall: { position: "absolute", width: 16, height: 16, borderRadius: 8, backgroundColor: "#FFF" },
  velocityRow: { flexDirection: "row", alignItems: "flex-end", gap: 10, height: 80 },
  velocityBar: { width: 8, borderRadius: 4, backgroundColor: "#FFF" },
  deployOuter: { position: "absolute", width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  deployInner: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center" },
  deployArrow: { width: 0, height: 0, borderLeftWidth: 12, borderRightWidth: 12, borderBottomWidth: 20, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: "#000" },
});