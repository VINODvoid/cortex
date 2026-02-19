# CORTEX — Full Apple Design Redesign Plan

## Design Philosophy

Apply Apple Human Interface Guidelines to the existing dark-mode crypto app:
- OLED dark backgrounds (#080808 / #000000) as the foundation
- SF Pro-inspired typography hierarchy (Large Titles → body → captions)
- iOS 17+ InsetGrouped card aesthetics (glass surfaces, consistent 16pt margins)
- 44pt minimum touch targets
- 8pt vertical spacing grid
- Reduce information density — every element earns its place

---

## Files to Change

### 1. `mobile/constants/theme.ts` (extend)
- Add `TYPOGRAPHY` export with Apple type scale
- Add `SPACING` export (grid: 8, sm: 12, md: 16, lg: 24, xl: 32)
- Consolidate the duplicated `C` color objects across screens

### 2. `mobile/app/(tabs)/home.tsx` (~full rewrite)
### 3. `mobile/app/(tabs)/portfolio.tsx` (~full rewrite)
### 4. `mobile/app/(tabs)/agents.tsx` (~full rewrite)
### 5. `mobile/app/(tabs)/activity.tsx` (~full rewrite)
### 6. `mobile/app/(tabs)/_layout.tsx` (minor refinements)

---

## Screen-by-Screen Plan

### Dashboard (`home.tsx`)

**Header**
- Keep floating sticky header with BlurView
- CORTEX wordmark: 11pt → 12pt, tighter letterSpacing
- Avatar button: 32×32 → 36×36 (glass3, more refined border)
- Live dot stays

**Hero Section**
- PORTFOLIO VALUE label: 8pt → 10pt, opacity 18% → 30%
- Hero value: $142,890 stays at large display weight (fontWeight: "100")
- Badge row: more horizontal spacing, pill borders refined
- Add a tiny 7-point mini sparkline (3 bars) next to the value for context

**Stats Row**
- 3 stat cards: increase padding (14 → 18), gap (10 → 12)
- Card border radius: 20 → 22
- Value font: 19pt → 20pt, slightly more readable
- Label font: 8pt → 10pt

**Swarm Status Banner**
- Keep but refine: borderRadius 18 → 22, inner padding increase

**Active Vote Card**
- Proposal card: increase padding, cleaner typography
- Track bar: height 5 → 6, more rounded ends
- EXECUTE button: cleaner gradient, slightly larger

**Agent Signals**
- Signal rows: increase lineHeight for body text (19 → 22)
- Agent chips: slightly larger (padding increase)

**Last Action**
- Minimal change, clean up spacing

---

### Portfolio (`portfolio.tsx`)

**Header**
- Add SafeAreaView-aware large title "Portfolio" (34pt, fontWeight: "300")
- Subtitle shows selected period delta

**Hero**
- Total value: 58pt → 64pt display
- Label: 8pt → 10pt
- Improved badge row spacing

**Stats Row** (3-column)
- Cleaner icon backgrounds
- Better font sizing (17pt → 19pt values)

**Period Selector**
- Current: pill with gradient — redesign as **iOS segmented control** style
- Background: glass2, pills with proper active state
- Font: 13pt → 13pt but improve weight contrast

**Chart → Redesign to gradient bar chart with premium treatment**
- Keep bar chart approach (no SVG dependency)
- Make last bar a bright accent (emerald gradient)
- Add subtle horizontal grid lines (opacity 0.04)
- Chart height: 110 → 130
- Add value labels on Y-axis (subtle, 9pt)
- Smooth color gradient per bar (darker at bottom, lighter at top)

**Positions List**
- Increase card padding
- Position rows: 16 → 20 paddingVertical
- Icon wrap: 46×46 → 50×50, borderRadius 15 → 16
- APY badge: more refined
- Change pill: text size bump

---

### Agents (`agents.tsx`)

**Header**
- Large Title "Swarm" (36pt fontWeight: "200" → 36pt fontWeight: "300")
- Subtitle: cleaner with live badge aligned right

**Agent Orb Grid**
- Orb size: 40×40 → **52×52** (more presence, easier to tap = 44pt+ target)
- Cell: "20%" per cell (5 columns, 10 agents = 2 rows) — keep
- Glow animation: keep but adjust opacity range
- Badge: increase to 18×18
- Name label: 7.5pt → 9pt, slightly more readable

**Status Strip**
- Increase cell paddingVertical: 14 → 16
- Count font: 20pt stays
- Label: 6.5pt → 8pt

**Vote Breakdown**
- Card background: glass2 → slightly darker (glass3)
- Progress bar: 5px height → 7px
- Progress bar: animate with smoother spring

**Agent Signals**
- Increase body text: 13pt stays
- Role text: 9pt → 10pt
- Time: 9pt stays
- More vertical gap between signals

---

### Activity (`activity.tsx`)

**Header**
- Large title "Activity" (36pt fontWeight: "200" → keep style)
- Live badge: refine positioning

**Summary Chips**
- Chips: more padding, larger touch area
- Font: 11pt stays

**Event Groups (TODAY / YESTERDAY)**
- Group header: cleaner, use separator lines approach
- Card: borderRadius 22 stays

**Event Rows**
- Row paddingVertical: 13 → 16 (more breathing room)
- Icon: 36×36 → 40×40
- Title: 13pt → 14pt (more readable)
- Detail: 11pt → 12pt
- Time: 9.5pt stays
- Timeline dot: 7px → 8px
- Timeline line: 1px stays
- Vote chip: 17×17 → 20×20

---

### Tab Bar (`_layout.tsx`)

- Tab bar: increase inner paddingVertical: 10 → 12
- Tab button minHeight: 46 → 50
- Active pill: 52×36 → 56×38
- Tab label: 9pt → 10pt

---

## Token Additions to `theme.ts`

```typescript
export const TYPOGRAPHY = {
  display:  { fontSize: 64, fontWeight: "100" as const, letterSpacing: -3.5 },
  hero:     { fontSize: 34, fontWeight: "300" as const, letterSpacing: -1.5 },
  title:    { fontSize: 22, fontWeight: "600" as const, letterSpacing: -0.5 },
  headline: { fontSize: 17, fontWeight: "600" as const },
  body:     { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  callout:  { fontSize: 14, fontWeight: "400" as const },
  footnote: { fontSize: 13, fontWeight: "400" as const },
  caption1: { fontSize: 12, fontWeight: "500" as const },
  caption2: { fontSize: 10, fontWeight: "600" as const, letterSpacing: 0.5 },
  micro:    { fontSize: 9,  fontWeight: "700" as const, letterSpacing: 1.5, textTransform: "uppercase" as const },
} as const;

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
  screenPad: 20,
} as const;
```

---

## Consistency Rules Applied Across All Screens

1. **No more local `C = {...}` objects** — import `THEME, TYPOGRAPHY, SPACING` from `../../constants/theme`
2. **Section labels**: 10pt, fontWeight: "600", letterSpacing: 2, uppercase, color: textMuted
3. **Card base style**: borderRadius 22, borderWidth 1, borderColor `rgba(255,255,255,0.08)`, bg `rgba(255,255,255,0.04)`
4. **Screen padding**: `SPACING.screenPad` (20pt) horizontal
5. **Section gaps**: 28pt between major sections
6. **Touch targets**: min 44pt height for all interactive elements
7. **Bottom spacer**: 120pt (tab bar clearance)
