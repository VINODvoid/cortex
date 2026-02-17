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
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Cpu, Zap, Target, Shield, Activity, Radio } from "lucide-react-native";

const { width } = Dimensions.get("window");

const THEME = {
  bgStart: "#080808",
  bgEnd: "#000000",
  text: "#FFFFFF",
  subtext: "#888888",
};

const SLIDES = [
  { id: "1", tag: "01 / INTELLIGENCE", title: "CORTEX", desc: "Autonomous agents analyzing market fractals.", type: "neural" },
  { id: "2", tag: "02 / COORDINATION", title: "SWARM", desc: "Liquidity scouts executing in perfect unison.", type: "swarm" },
  { id: "3", tag: "03 / VELOCITY", title: "VELOCITY", desc: "Sub-second finality. Zero latency execution.", type: "velocity" },
  { id: "4", tag: "04 / EXECUTION", title: "DEPLOY", desc: "System ready. Initiate protocol sequence.", type: "deploy" },
];

// ─── MODULE-LEVEL CONSTANTS ──────────────────────────────────────────────────
// Visual container is 300×300, center at (150, 150)
const VC = 150; // visual center

const NODE_R = 108; // radius of the 6 primary nodes

// 6 primary nodes on a regular hexagon, starting at the top
const NEURAL_NODES = Array.from({ length: 6 }, (_, i) => {
  const a = ((i * 60 - 90) * Math.PI) / 180;
  return { x: Math.cos(a) * NODE_R, y: Math.sin(a) * NODE_R, deg: i * 60 - 90 };
});

// Hex ring segments connecting adjacent nodes
const HEX_SIDES = NEURAL_NODES.map((n, i) => {
  const n2 = NEURAL_NODES[(i + 1) % 6];
  const cx = (n.x + n2.x) / 2;
  const cy = (n.y + n2.y) / 2;
  const len = Math.sqrt((n2.x - n.x) ** 2 + (n2.y - n.y) ** 2);
  const angle = (Math.atan2(n2.y - n.y, n2.x - n.x) * 180) / Math.PI;
  return { cx, cy, len, angle };
});

// Swarm agent definitions (orbit, speed, startAngle, Icon)
type AgentDef = {
  orbit: number;
  speed: number;
  startAngle: number;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
};

const SWARM_AGENTS: AgentDef[] = [
  // Inner ring r=65 — 3 agents
  { orbit: 65, speed: 6500, startAngle: 0, Icon: Cpu },
  { orbit: 65, speed: 6500, startAngle: 120, Icon: Zap },
  { orbit: 65, speed: 6500, startAngle: 240, Icon: Target },
  // Outer ring r=112 — 3 agents (opposite phase)
  { orbit: 112, speed: 11000, startAngle: 60, Icon: Shield },
  { orbit: 112, speed: 11000, startAngle: 180, Icon: Activity },
  { orbit: 112, speed: 11000, startAngle: 300, Icon: Radio },
];

// ─── 01 NEURAL / CORTEX ──────────────────────────────────────────────────────

const NeuralVisual = () => {
  const coreGlow   = useRef(new Animated.Value(0)).current;
  const scanRot    = useRef(new Animated.Value(0)).current;
  const nodeAnims  = useRef(NEURAL_NODES.map(() => new Animated.Value(0.12))).current;
  const sigX       = useRef(NEURAL_NODES.map(() => new Animated.Value(0))).current;
  const sigY       = useRef(NEURAL_NODES.map(() => new Animated.Value(0))).current;
  const sigOp      = useRef(NEURAL_NODES.map(() => new Animated.Value(0))).current;

  const TRAVEL = 520;
  const GAP    = 300;
  const CYCLE  = NEURAL_NODES.length * (TRAVEL + GAP) + 1200;

  useEffect(() => {
    // Core breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(coreGlow, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(coreGlow, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();

    // Scan rotation
    Animated.loop(
      Animated.timing(scanRot, { toValue: 1, duration: 5000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Signal burst: fires each branch in sequence
    const fireSignals = () => {
      NEURAL_NODES.forEach((node, i) => {
        const delay = i * (TRAVEL + GAP);
        setTimeout(() => {
          // Reset and fire
          sigX[i].setValue(0);
          sigY[i].setValue(0);
          sigOp[i].setValue(0);

          Animated.sequence([
            Animated.timing(sigOp[i], { toValue: 1, duration: 60, useNativeDriver: true }),
            Animated.parallel([
              Animated.timing(sigX[i], {
                toValue: node.x,
                duration: TRAVEL,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(sigY[i], {
                toValue: node.y,
                duration: TRAVEL,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(sigOp[i], { toValue: 0, duration: 120, useNativeDriver: true }),
          ]).start();

          // Node flash when signal arrives
          setTimeout(() => {
            Animated.sequence([
              Animated.timing(nodeAnims[i], { toValue: 1, duration: 160, useNativeDriver: true }),
              Animated.timing(nodeAnims[i], { toValue: 0.12, duration: 900, useNativeDriver: true }),
            ]).start();
          }, TRAVEL);
        }, delay);
      });
    };

    fireSignals();
    const id = setInterval(fireSignals, CYCLE);
    return () => clearInterval(id);
  }, []);

  const scanDeg = scanRot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={styles.visualContainer}>
      {/* Outer faint guide circle */}
      <View
        style={{
          position: "absolute",
          width: 256,
          height: 256,
          borderRadius: 128,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.07)",
        }}
      />

      {/* Rotating scan line — bright half + dim half */}
      <Animated.View
        style={{
          position: "absolute",
          width: 256,
          height: 1,
          left: VC - 128,
          top: VC - 0.5,
          transform: [{ rotate: scanDeg }],
        }}
      >
        <View
          style={{
            position: "absolute",
            right: 0,
            width: 128,
            height: 1,
            backgroundColor: "rgba(255,255,255,0.35)",
          }}
        />
        <View
          style={{
            position: "absolute",
            left: 0,
            width: 128,
            height: 1,
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        />
      </Animated.View>

      {/* Hex ring — 6 segments connecting adjacent nodes */}
      {HEX_SIDES.map((s, i) => (
        <View
          key={`hs${i}`}
          style={{
            position: "absolute",
            width: s.len,
            height: 1,
            backgroundColor: "rgba(255,255,255,0.22)",
            left: VC + s.cx - s.len / 2,
            top: VC + s.cy - 0.5,
            transform: [{ rotate: `${s.angle}deg` }],
          }}
        />
      ))}

      {/* Branch lines — center to each node */}
      {NEURAL_NODES.map((n, i) => (
        <View
          key={`bl${i}`}
          style={{
            position: "absolute",
            width: NODE_R,
            height: 1,
            backgroundColor: "rgba(255,255,255,0.18)",
            left: VC + n.x / 2 - NODE_R / 2,
            top: VC + n.y / 2 - 0.5,
            transform: [{ rotate: `${n.deg}deg` }],
          }}
        />
      ))}

      {/* Signal dots traveling along branches */}
      {NEURAL_NODES.map((_, i) => (
        <Animated.View
          key={`sig${i}`}
          style={{
            position: "absolute",
            width: 7,
            height: 7,
            borderRadius: 3.5,
            backgroundColor: "#FFF",
            left: VC - 3.5,
            top: VC - 3.5,
            opacity: sigOp[i],
            transform: [{ translateX: sigX[i] }, { translateY: sigY[i] }],
            shadowColor: "#FFF",
            shadowOpacity: 1,
            shadowRadius: 10,
            elevation: 10,
          }}
        />
      ))}

      {/* Primary nodes */}
      {NEURAL_NODES.map((n, i) => (
        <Animated.View
          key={`nd${i}`}
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: "#FFF",
            left: VC + n.x - 6,
            top: VC + n.y - 6,
            opacity: nodeAnims[i],
            shadowColor: "#FFF",
            shadowOpacity: 1,
            shadowRadius: 12,
            elevation: 10,
          }}
        />
      ))}

      {/* Core glow ring */}
      <Animated.View
        style={{
          position: "absolute",
          width: 68,
          height: 68,
          borderRadius: 34,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.5)",
          opacity: coreGlow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] }),
          transform: [{ scale: coreGlow.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] }) }],
        }}
      />

      {/* Core solid orb */}
      <Animated.View
        style={{
          position: "absolute",
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: "#FFF",
          shadowColor: "#FFF",
          shadowOpacity: 1,
          shadowRadius: coreGlow.interpolate({ inputRange: [0, 1], outputRange: [12, 28] }),
          elevation: 15,
          transform: [{ scale: coreGlow.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.05] }) }],
        }}
      />
    </View>
  );
};

// ─── 02 SWARM ────────────────────────────────────────────────────────────────

const SwarmAgent = ({ orbit, speed, startAngle, Icon }: AgentDef) => {
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rot, { toValue: 1, duration: speed, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const spin    = rot.interpolate({ inputRange: [0, 1], outputRange: [`${startAngle}deg`, `${startAngle + 360}deg`] });
  const counter = rot.interpolate({ inputRange: [0, 1], outputRange: [`${-startAngle}deg`, `${-startAngle - 360}deg`] });

  const D = orbit * 2;
  const S = 26; // agent box size

  return (
    // CRITICAL: center the orbit container in the 300×300 visual container
    <Animated.View
      style={{
        position: "absolute",
        width: D,
        height: D,
        left: VC - orbit,
        top: VC - orbit,
        transform: [{ rotate: spin }],
      }}
    >
      {/* Agent icon box at top of orbit ring (12 o'clock position) */}
      <Animated.View
        style={{
          position: "absolute",
          top: -S / 2,
          left: orbit - S / 2,
          width: S,
          height: S,
          borderRadius: 6,
          backgroundColor: "#0a0a0a",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.5)",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#FFF",
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          transform: [{ rotate: counter }],
        }}
      >
        <Icon size={12} color="#FFF" strokeWidth={1.5} />
      </Animated.View>
    </Animated.View>
  );
};

const SwarmVisual = () => {
  const corePulse = useRef(new Animated.Value(0)).current;
  const ring1Anim = useRef(new Animated.Value(0)).current;
  const ring2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(corePulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(corePulse, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ring1Anim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(ring1Anim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(ring2Anim, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(ring2Anim, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.visualContainer}>
      {/* Orbit guide rings */}
      {[65, 112].map((r) => (
        <View
          key={r}
          style={{
            position: "absolute",
            width: r * 2,
            height: r * 2,
            borderRadius: r,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
            left: VC - r,
            top: VC - r,
          }}
        />
      ))}

      {/* Orbiting agents */}
      {SWARM_AGENTS.map((agent, i) => (
        <SwarmAgent key={i} {...agent} />
      ))}

      {/* Core pulse aura */}
      <Animated.View
        style={{
          position: "absolute",
          width: 60,
          height: 60,
          borderRadius: 30,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.6)",
          left: VC - 30,
          top: VC - 30,
          opacity: corePulse.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.7] }),
          transform: [{ scale: corePulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.3] }) }],
        }}
      />

      {/* Core dot */}
      <View
        style={{
          position: "absolute",
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: "#FFF",
          left: VC - 10,
          top: VC - 10,
          shadowColor: "#FFF",
          shadowOpacity: 1,
          shadowRadius: 16,
          elevation: 12,
        }}
      />
    </View>
  );
};

// ─── 03 VELOCITY ─────────────────────────────────────────────────────────────

const VelocityVisual = () => {
  const BARS = [0.3, 0.8, 0.5, 1.0, 0.4, 0.7, 0.55];
  const anims = useRef(BARS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    anims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 480 + i * 80, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 480 + i * 80, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.visualContainer}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 9, height: 80 }}>
        {BARS.map((h, i) => (
          <Animated.View
            key={i}
            style={{
              width: 9,
              height: 48 * h,
              borderRadius: 4,
              backgroundColor: "#FFF",
              shadowColor: "#FFF",
              shadowOpacity: 0.7,
              shadowRadius: 8,
              transform: [{ scaleY: anims[i].interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.7] }) }],
            }}
          />
        ))}
      </View>
    </View>
  );
};

// ─── 04 DEPLOY ───────────────────────────────────────────────────────────────

const DeployVisual = () => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.visualContainer}>
      <Animated.View
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: 110,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.12)",
          transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1.12] }) }],
        }}
      />
      <Animated.View
        style={{
          position: "absolute",
          width: 150,
          height: 150,
          borderRadius: 75,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.2)",
          transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1.1, 0.9] }) }],
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 90,
          height: 90,
          borderRadius: 45,
          backgroundColor: "#FFF",
          shadowColor: "#FFF",
          shadowOpacity: 0.45,
          shadowRadius: 30,
          elevation: 15,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Launch arrow */}
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 13,
            borderRightWidth: 13,
            borderBottomWidth: 22,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: "#000",
            marginBottom: 2,
          }}
        />
      </View>
    </View>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function Onboarding() {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastIndex = SLIDES.length - 1;

  const btnInputRange = [(lastIndex - 1) * width, lastIndex * width];
  const btnWidth  = scrollX.interpolate({ inputRange: btnInputRange, outputRange: [72, width - 48], extrapolate: "clamp" });
  const btnRadius = scrollX.interpolate({ inputRange: btnInputRange, outputRange: [36, 16], extrapolate: "clamp" });
  const iconOpacity = scrollX.interpolate({ inputRange: [(lastIndex - 0.5) * width, lastIndex * width], outputRange: [1, 0], extrapolate: "clamp" });
  const textOpacity = scrollX.interpolate({ inputRange: [(lastIndex - 0.5) * width, lastIndex * width], outputRange: [0, 1], extrapolate: "clamp" });
  const skipOpacity = scrollX.interpolate({ inputRange: [(lastIndex - 1) * width, lastIndex * width], outputRange: [1, 0], extrapolate: "clamp" });

  const handleNext = () => {
    if (currentIndex < lastIndex) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.replace("/(tabs)/home");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={[THEME.bgStart, THEME.bgEnd]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.header, { opacity: skipOpacity }]}>
          <Pressable onPress={() => router.replace("/(tabs)/home")} hitSlop={20} style={styles.skipBtn}>
            <Text style={styles.skipText}>SKIP INTRO</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onViewableItemsChanged={useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
          if (viewableItems[0]?.index !== null && viewableItems[0]?.index !== undefined)
            setCurrentIndex(viewableItems[0].index);
        }).current}
        renderItem={({ item, index }) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0, 1, 0] });
          const translateX = scrollX.interpolate({ inputRange, outputRange: [40, 0, -40] });

          return (
            <View style={styles.slide}>
              <View style={styles.visualSection}>
                {item.type === "neural" && <NeuralVisual />}
                {item.type === "swarm" && <SwarmVisual />}
                {item.type === "velocity" && <VelocityVisual />}
                {item.type === "deploy" && <DeployVisual />}
              </View>
              <Animated.View style={[styles.textSection, { opacity, transform: [{ translateX }] }]}>
                <Text style={styles.tag}>{item.tag}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.desc}>{item.desc}</Text>
              </Animated.View>
            </View>
          );
        }}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {/* Pagination dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => {
            const ir = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({ inputRange: ir, outputRange: [5, 28, 5], extrapolate: "clamp" });
            const dotOpacity = scrollX.interpolate({ inputRange: ir, outputRange: [0.3, 1, 0.3], extrapolate: "clamp" });
            const glowOp = scrollX.interpolate({ inputRange: ir, outputRange: [0, 0.6, 0], extrapolate: "clamp" });

            return (
              <View key={i} style={{ alignItems: "center", justifyContent: "center" }}>
                {/* Glow halo */}
                <Animated.View
                  style={{
                    position: "absolute",
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    width: dotWidth,
                    opacity: glowOp,
                  }}
                />
                {/* Dot */}
                <Animated.View
                  style={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "#FFF",
                    width: dotWidth,
                    opacity: dotOpacity,
                    shadowColor: "#FFF",
                    shadowOpacity: 0.8,
                    shadowRadius: 4,
                  }}
                />
              </View>
            );
          })}
        </View>

        {/* Slide counter */}
        <Text style={styles.counter}>
          {String(currentIndex + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </Text>

        {/* Morphing CTA button */}
        <Pressable onPress={handleNext}>
          <Animated.View style={[styles.button, { width: btnWidth, borderRadius: btnRadius }]}>
            <Animated.View style={[styles.layer, { opacity: iconOpacity }]}>
              <View style={styles.arrow} />
            </Animated.View>
            <Animated.View style={[styles.layer, { opacity: textOpacity }]}>
              <Text style={styles.btnText}>DEPLOY PROTOCOL</Text>
            </Animated.View>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bgEnd },
  safeArea: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 40 : 10,
  },
  skipBtn: { padding: 10 },
  skipText: { color: "#555", fontSize: 11, fontWeight: "700", letterSpacing: 1.5 },
  slide: { width, flex: 1 },
  visualSection: { flex: 0.55, justifyContent: "center", alignItems: "center" },
  visualContainer: { width: 300, height: 300, justifyContent: "center", alignItems: "center" },
  textSection: { flex: 0.45, paddingHorizontal: 32, justifyContent: "flex-start", paddingTop: 10 },
  tag: { color: THEME.subtext, fontSize: 11, fontWeight: "700", letterSpacing: 2.5, marginBottom: 14 },
  title: {
    color: THEME.text,
    fontSize: 50,
    fontWeight: "300",
    letterSpacing: -2,
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "Helvetica Neue" : "sans-serif-light",
  },
  desc: { color: THEME.subtext, fontSize: 15, lineHeight: 24, maxWidth: "90%", letterSpacing: 0.2 },
  footer: { position: "absolute", bottom: 48, left: 0, right: 0, alignItems: "center", gap: 14 },
  pagination: { flexDirection: "row", alignItems: "center", height: 16, gap: 8 },
  counter: { color: "rgba(255,255,255,0.18)", fontSize: 10, fontWeight: "600", letterSpacing: 2 },
  button: {
    height: 72,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  layer: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center" },
  btnText: { color: "#000", fontSize: 13, fontWeight: "800", letterSpacing: 1.5 },
  arrow: { width: 14, height: 14, borderTopWidth: 2, borderRightWidth: 2, borderColor: "#000", transform: [{ rotate: "45deg" }] },
});
