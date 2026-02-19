// ─── CORTEX DESIGN SYSTEM v3 ─────────────────────────────────────────────────
// Void Interface — OLED black canvas, floating components, precision typography

// ── Void Backgrounds ──────────────────────────────────────────────────────────
export const VOID = {
  base:  "#000000",   // OLED pure black
  rise1: "#0E0E10",   // first elevation (subtle card)
  rise2: "#151517",   // card surface
  rise3: "#1D1D1F",   // elevated card
  rise4: "#242426",   // highest elevation
} as const;

// ── Glass Surfaces ────────────────────────────────────────────────────────────
export const GLASS = {
  g0: "rgba(255,255,255,0.03)",
  g1: "rgba(255,255,255,0.05)",
  g2: "rgba(255,255,255,0.08)",
  g3: "rgba(255,255,255,0.13)",
  g4: "rgba(255,255,255,0.20)",
} as const;

// ── Borders ───────────────────────────────────────────────────────────────────
export const BORDER = {
  faint:  "rgba(255,255,255,0.06)",
  subtle: "rgba(255,255,255,0.10)",
  mid:    "rgba(255,255,255,0.16)",
  strong: "rgba(255,255,255,0.24)",
} as const;

// ── Ink (Typography) ──────────────────────────────────────────────────────────
export const INK = {
  primary:   "#FAFAFA",
  secondary: "rgba(250,250,250,0.65)",
  tertiary:  "rgba(250,250,250,0.38)",
  ghost:     "rgba(250,250,250,0.20)",
  phantom:   "rgba(250,250,250,0.10)",
} as const;

// ── Brand Spectrum ────────────────────────────────────────────────────────────
export const SPECTRUM = {
  violet:  "#A78BFA",   // brand primary — vibrant lilac
  indigo:  "#818CF8",   // secondary accent
  cyan:    "#22D3EE",   // highlight
  mint:    "#34D399",   // success / positive
  coral:   "#F87171",   // danger / negative
  gold:    "#FBBF24",   // warning / thinking
  azure:   "#60A5FA",   // info / blue
  rose:    "#FB7185",   // alternate danger
  teal:    "#2DD4BF",   // teal variant
} as const;

// ── Radius Scale ──────────────────────────────────────────────────────────────
export const RADIUS = {
  xs:   6,
  sm:   10,
  md:   16,
  lg:   22,
  xl:   28,
  xxl:  36,
  pill: 999,
} as const;

// ── Spacing (8pt grid) ────────────────────────────────────────────────────────
export const SPACE = {
  xs:      4,
  sm:      8,
  md:      16,
  lg:      24,
  xl:      32,
  xxl:     48,
  screen:  24,
  card:    18,
  section: 32,
  bottom:  120,
} as const;

// ── Glow Gradients ────────────────────────────────────────────────────────────
export const GLOW = {
  violet:  ["rgba(167,139,250,0.24)", "rgba(129,140,248,0.08)", "transparent"] as const,
  mint:    ["rgba(52,211,153,0.20)",  "rgba(52,211,153,0.05)",  "transparent"] as const,
  coral:   ["rgba(248,113,113,0.20)", "rgba(248,113,113,0.05)", "transparent"] as const,
  gold:    ["rgba(251,191,36,0.20)",  "rgba(251,191,36,0.05)",  "transparent"] as const,
  azure:   ["rgba(96,165,250,0.20)",  "rgba(96,165,250,0.05)",  "transparent"] as const,
  cosmic:  ["rgba(167,139,250,0.28)", "rgba(129,140,248,0.10)", "rgba(34,211,238,0.04)", "transparent"] as const,
  indigo:  ["rgba(129,140,248,0.22)", "rgba(129,140,248,0.06)", "transparent"] as const,
} as const;

// ── Semantic Gradient Fills ───────────────────────────────────────────────────
export const FILL = {
  violet:  ["#A78BFA", "#818CF8"] as const,
  mint:    ["#059669", "#34D399"] as const,
  coral:   ["#EF4444", "#F87171"] as const,
  gold:    ["#D97706", "#FBBF24"] as const,
  azure:   ["#2563EB", "#60A5FA"] as const,
  cosmic:  ["#A78BFA", "#818CF8", "#22D3EE"] as const,
} as const;

// ── Legacy THEME alias (backward compatibility) ────────────────────────────────
export const THEME = {
  bg:             VOID.base,
  bgDeep:         VOID.base,
  bgCard:         VOID.rise1,
  bgRaise:        VOID.rise2,
  glass1:         GLASS.g0,
  glass2:         GLASS.g1,
  glass3:         GLASS.g2,
  glass4:         GLASS.g3,
  text:           INK.primary,
  textSub:        INK.secondary,
  textMuted:      INK.tertiary,
  textFaint:      INK.ghost,
  textPrimary:    INK.primary,
  textSecondary:  INK.secondary,
  textTertiary:   INK.tertiary,
  border:         BORDER.faint,
  separator:      BORDER.faint,
  separatorStrong:BORDER.subtle,
  borderMid:      BORDER.subtle,
  borderHi:       BORDER.mid,
  green:   SPECTRUM.mint,
  blue:    SPECTRUM.azure,
  violet:  SPECTRUM.violet,
  purple:  SPECTRUM.indigo,
  amber:   SPECTRUM.gold,
  rose:    SPECTRUM.coral,
  cyan:    SPECTRUM.cyan,
  indigo:  SPECTRUM.indigo,
  teal:    SPECTRUM.teal,
  orange:  SPECTRUM.gold,
  red:     SPECTRUM.coral,
  statusActive:   SPECTRUM.mint,
  statusVoting:   SPECTRUM.indigo,
  statusThinking: SPECTRUM.gold,
  statusIdle:     "rgba(255,255,255,0.12)",
  voteYes:     SPECTRUM.mint,
  voteNo:      SPECTRUM.coral,
  voteAbstain: "rgba(255,255,255,0.18)",
  screenPad: SPACE.screen,
  cardRadius: RADIUS.lg,
  chipRadius: RADIUS.sm,
} as const;

// ── Legacy GRADIENTS alias ────────────────────────────────────────────────────
export const GRADIENTS = {
  violet:       FILL.violet,
  cosmicViolet: FILL.cosmic,
  emerald:      FILL.mint,
  rose:         FILL.coral,
  blue:         FILL.azure,
  amber:        FILL.gold,
  cyan:         ["#0891B2", SPECTRUM.cyan] as const,
  glowViolet:   GLOW.violet,
  glowBlue:     GLOW.azure,
  glowEmerald:  GLOW.mint,
  glowAmber:    GLOW.gold,
  glowCosmic:   GLOW.cosmic,
  glowCard:     [GLASS.g2, GLASS.g0] as const,
  darkCard:     ["rgba(17,17,20,0.95)", "rgba(10,10,12,0.95)"] as const,
  bgViolet:     GLOW.violet,
  bgBlue:       GLOW.azure,
  bgEmerald:    GLOW.mint,
} as const;

// ── Shared C alias (screens can import to avoid redefining) ───────────────────
export const C = {
  bg:        VOID.base,
  violet:    SPECTRUM.violet,
  purple:    SPECTRUM.indigo,
  emerald:   SPECTRUM.mint,
  rose:      SPECTRUM.coral,
  amber:     SPECTRUM.gold,
  blue:      SPECTRUM.azure,
  indigo:    SPECTRUM.indigo,
  teal:      SPECTRUM.teal,
  t1:        INK.primary,
  t2:        INK.secondary,
  t3:        INK.tertiary,
  t4:        INK.ghost,
  border:    BORDER.faint,
  borderMid: BORDER.subtle,
  glass1:    GLASS.g0,
  glass2:    GLASS.g1,
  glass3:    GLASS.g2,
} as const;

// ── Agent Data ────────────────────────────────────────────────────────────────
export type AgentStatus = "ACTIVE" | "IDLE" | "VOTING" | "THINKING";
export type VoteChoice  = "YES" | "NO" | "ABSTAIN";

export type AgentData = {
  id:      string;
  name:    string;
  label:   string;
  role:    string;
  status:  AgentStatus;
  vote?:   VoteChoice;
  metric?: string;
  task:    string;
};

export const STATUS_COLOR: Record<AgentStatus, string> = {
  ACTIVE:   SPECTRUM.mint,
  IDLE:     "rgba(255,255,255,0.14)",
  VOTING:   SPECTRUM.indigo,
  THINKING: SPECTRUM.gold,
};

export const VOTE_COLOR: Record<VoteChoice, string> = {
  YES:     SPECTRUM.mint,
  NO:      SPECTRUM.coral,
  ABSTAIN: "rgba(255,255,255,0.20)",
};

export const AGENTS: AgentData[] = [
  { id: "yield",     name: "Yield",     label: "YLD", role: "Yield Optimizer",   status: "VOTING",   vote: "YES",     metric: "14.2% APY",  task: "Comparing Orca vs Marinade yield curves"   },
  { id: "risk",      name: "Risk",      label: "RSK", role: "Risk Manager",      status: "VOTING",   vote: "NO",      metric: "41.8% exp",  task: "SOL exposure exceeds threshold by 1.8%"    },
  { id: "airdrop",   name: "Airdrop",   label: "AIR", role: "Airdrop Hunter",    status: "VOTING",   vote: "YES",     metric: "+12% rate",  task: "JUP epoch accumulation rate favorable"     },
  { id: "stratgst",  name: "Stratgst",  label: "STR", role: "Strategist",        status: "VOTING",   vote: "YES",     metric: "PROPOSED",   task: "Initiated deploy 200 SOL to Orca LP"       },
  { id: "liquidity", name: "Liquidity", label: "LQD", role: "Liquidity Analyst", status: "THINKING", vote: undefined, metric: "$2.4M depth", task: "Analyzing pool depth within ±0.5% band"   },
  { id: "trend",     name: "Trend",     label: "TRD", role: "Trend Watcher",     status: "VOTING",   vote: "YES",     metric: "+0.82σ",     task: "SOL momentum above 7-day mean — bullish"   },
  { id: "sentiment", name: "Sentiment", label: "SNT", role: "Sentiment Engine",  status: "VOTING",   vote: "ABSTAIN", metric: "52% bull",   task: "CT sentiment mixed — insufficient signal"  },
  { id: "rebalance", name: "Rebalance", label: "RBL", role: "Rebalancer",        status: "VOTING",   vote: "YES",     metric: "9% delta",   task: "SOL weight 84% vs 75% target confirmed"    },
  { id: "whale",     name: "WHL",       label: "WHL", role: "Whale Tracker",     status: "ACTIVE",   vote: "YES",     metric: "3 wallets",  task: "3 whale wallets accumulating Orca LP"      },
  { id: "gas",       name: "GAS",       label: "GAS", role: "Gas Optimizer",     status: "IDLE",     vote: undefined, metric: "1000 μL",    task: "Priority fee stable — monitoring mempool"  },
];

export const SPARKLINE_DATA = [62, 58, 65, 72, 68, 75, 80, 76, 82, 79, 88, 84, 91, 95];

export type ThoughtEntry = {
  id:      string;
  agentId: string;
  text:    string;
  elapsed: number;
};

export const INITIAL_THOUGHTS: Omit<ThoughtEntry, "id">[] = [
  { agentId: "stratgst",  text: "Initiating democratic vote: DEPLOY 200 SOL to Orca SOL/USDC",  elapsed: 14 },
  { agentId: "risk",      text: "Counter-proposal: 200 SOL exceeds safe exposure by 1.8%",        elapsed: 11 },
  { agentId: "whale",     text: "On-chain: 3 whale wallets accumulating Orca LP positions",       elapsed: 8  },
  { agentId: "yield",     text: "Orca SOL/USDC APY confirmed at 14.2% — 3-day high",             elapsed: 6  },
  { agentId: "trend",     text: "SOL momentum +0.82σ above 7-day mean — bullish signal",         elapsed: 4  },
  { agentId: "liquidity", text: "Depth analysis: $2.4M liquidity within ±0.5% of price",         elapsed: 2  },
];

export const LIVE_POOL: Omit<ThoughtEntry, "id" | "elapsed">[] = [
  { agentId: "sentiment", text: "CT sentiment: 52% bullish, 48% bearish — mixed signals"           },
  { agentId: "airdrop",   text: "JUP epoch accumulation rate +12% — favorable entry window"        },
  { agentId: "rebalance", text: "SOL weight 84% vs 75% target — rebalance delta confirmed"         },
  { agentId: "gas",       text: "Priority fee stable at 1000 microlamports — optimal TX window"    },
  { agentId: "whale",     text: "Wallet 7xKt... added 12,000 USDC to Orca LP — bullish confluence" },
  { agentId: "yield",     text: "Marinade staking APY dropped to 8.1% — Orca remains best yield"  },
  { agentId: "risk",      text: "If approved: SOL exposure hits 41.8% — flagging for monitoring"   },
  { agentId: "stratgst",  text: "Growth coalition confirmed: 5 votes aligned, consensus building" },
  { agentId: "trend",     text: "Volume spike: 340% above 24h moving average — momentum strong"   },
  { agentId: "liquidity", text: "Pool can absorb 200 SOL entry with <0.1% slippage confirmed"     },
];

export const VOTE_COUNTS = { yes: 7, no: 2, abstain: 1, total: 10 };

// ── Typography export ─────────────────────────────────────────────────────────
export const TYPOGRAPHY = {
  display:  { fontSize: 72, fontWeight: "100" as const, letterSpacing: -4,   lineHeight: 80 },
  heroNum:  { fontSize: 56, fontWeight: "200" as const, letterSpacing: -3,   lineHeight: 62 },
  hero:     { fontSize: 36, fontWeight: "200" as const, letterSpacing: -1.8  },
  title1:   { fontSize: 34, fontWeight: "700" as const, letterSpacing: -1    },
  title2:   { fontSize: 26, fontWeight: "600" as const, letterSpacing: -0.8  },
  title3:   { fontSize: 20, fontWeight: "600" as const, letterSpacing: -0.4  },
  headline: { fontSize: 17, fontWeight: "600" as const },
  body:     { fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
  callout:  { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  subhead:  { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  footnote: { fontSize: 13, fontWeight: "400" as const, lineHeight: 18 },
  caption1: { fontSize: 12, fontWeight: "500" as const },
  caption2: { fontSize: 11, fontWeight: "500" as const, letterSpacing: 0.4 },
  overline: { fontSize: 10, fontWeight: "700" as const, letterSpacing: 2,    textTransform: "uppercase" as const },
  micro:    { fontSize: 9,  fontWeight: "800" as const, letterSpacing: 2.5,  textTransform: "uppercase" as const },
} as const;

export const SPACING = SPACE;