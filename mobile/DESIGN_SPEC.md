# Cortex Mobile – iOS Design Specification
**Role:** Senior UI Designer (Apple Standards)
**Platform:** iOS 18+ (SwiftUI / React Native equivalent)
**Version:** 1.0

---

## 1. User Research & Core Strategy

**Primary Persona:** "The Sovereign Strategist"
- **Profile:** Crypto-native, high-net-worth individual, 25-45 years old. Values efficiency, aesthetics, and total control. Used to Bloomberg Terminals but desires the fluidity of Robinhood.
- **Top 3 Goals:**
  1.  **Instant Clarity:** Know total net worth and "Swarm" health in < 3 seconds.
  2.  **Automated Execution:** Delegate complex DeFi tasks (yield farming, rebalancing) to agents.
  3.  **Risk Mitigation:** Immediate alerts on protocol risks or exposure imbalances.
- **Pain Points:** Cluttered "engineer-art" interfaces in DeFi, slow wallet connection flows, lack of mobile-first portfolio management.

---

## 2. Hierarchy & Layout Strategy

**Visual Hierarchy (Apple HIG):**
1.  **Focal Point (The "Hero"):** Every screen has *one* dominant number or status (e.g., Total Balance on Dashboard, "8 Active" on Swarm). This uses Apple's "Large Title" philosophy (SF Pro Display, Heavy, 40pt+).
2.  **Primary Action:** The "Liquid" action buttons (Send, Receive, Swap). High contrast, usually `CORTEX_INDIGO` (#5E5CE6) or `GLASS_SURFACE`.
3.  **Contextual Data:** Inset Grouped Lists (Apple Settings style) for detailed data. Secondary text color (`systemGray2` equivalent).

**Content Density:**
- **Breathing Room:** generous padding (XXL spacing) around focal points.
- **Information Density:** High density *inside* the Inset Groups (rows of data), but low density *outside* them.
- **Fluid Backgrounds:** "Atmospheric Blooms" (layered radial gradients) replace flat backgrounds to give depth without noise.

---

## 3. Platform-Specific Patterns

- **Navigation:**
  - **Tab Bar:** "Glass Material" floating bar. High blur (80+), slight transparency (94% opacity).
  - **Haptics:** `UIImpactFeedbackGenerator(style: .light)` on *every* tab switch and button press.
- **Gestures:**
  - **Pull-to-Refresh:** Standard iOS rubber-banding with a custom "Cortex Orbit" spinner.
  - **Swipe Actions:** Swipe left on Asset rows for "Quick Swap" or "Hide".
- **Modals:**
  - **Sheet Presentations:** Used for "Filter", "Settings", and "Transaction Details".
  - **Grabber Handle:** Always visible. Background dims/blurs behind the sheet.

---

## 4. Screen Designs (Key Screens)

### 1. Onboarding / Welcome
- **Structure:** Full-screen Paging View.
- **Components:**
  - **Background:** Dynamic "Atmospheric Bloom" that shifts colors (Indigo -> Orange -> Green) per slide.
  - **Typography:** Massive, centered SF Pro Display titles ("INTELLIGENCE", "PRECISION").
  - **Action:** A single, morphing "Pearl" button at the bottom.
- **Interaction:** Parallax effect on icons during swipe. Haptic "tick" on page change.

### 2. Dashboard (Home)
- **Structure:** ScrollView with Sticky Header (Brand Name).
- **Hierarchy:**
  1.  Total Balance (Animated Count-up).
  2.  Action Grid (Send/Receive/Swap).
  3.  Agent Activity (Inset List).
- **Micro-interaction:** Balance scales down slightly (0.95x) on scroll drag.

### 3. Swarm (Primary Task)
- **Structure:** Status Dashboard.
- **Focal Point:** "Swarm Status" (e.g., "8 Active").
- **Components:**
  - **Active Coordinator Card:** Large card with "Breathing" status dot (Animated opacity).
  - **Agent List:** Inset grouped list with status icons (Zap, Shield).
- **Empty State:** "No Agents Deployed" with a large, dashed-border placeholder card + "Deploy Agent" button.

### 4. Portfolio (Detail View)
- **Structure:** Asset Breakdown.
- **Components:**
  - **Chart:** Sparkline or Bar chart using `ACCENT` color. Hiding axis labels for cleanliness.
  - **Time Filter:** iOS Segmented Control style (pill shape).
  - **Holdings:** Inset list sorted by value.
- **Interaction:** Scrubbing the chart updates the main value text instantly.

### 5. Settings / Profile
- **Structure:** Standard iOS Inset Grouped List.
- **Items:**
  - **Account:** Wallet Address (Truncated), Security Level.
  - **Preferences:** Currency, Appearance (System/Dark), Haptics.
  - **Danger Zone:** Disconnect Wallet.
- **Transition:** Slides up as a sheet over the current context.

### 6. Search / Filter
- **Structure:** Modal Sheet.
- **Components:**
  - **Search Bar:** Standard `UISearchTextField` styling (Gray background, rounded corners).
  - **Filter Chips:** Horizontal scroll of toggleable pills (e.g., "Tokens", "NFTs", "History").
- **State:**
  - **Empty:** "No results found" with a magnifying glass icon.
  - **Loading:** Skeleton rows shimmering.

### 7. Checkout / Action (Swap)
- **Structure:** Floating Card or Modal.
- **Components:**
  - **Input:** Large tabular text field for amount.
  - **Selector:** Token pill with chevron.
  - **Slider:** "Slide to Confirm" action (prevent accidental taps).
- **Feedback:** Success triggers full-screen "Success Haptic" (3 distinct pulses) and a confetti/bloom burst.

### 8. Error / Empty State
- **Visual:** Minimalist Icon (e.g., Broken Robot or Empty Box) centered.
- **Typography:** "System Offline" (Title 3, Bold) + Description (Body, Gray).
- **Action:** "Retry" button (Secondary style).

---

## 5. Component Specifications

**Buttons:**
- **Primary:** `ACCENT` background, White text, 16px radius (continuous curve).
- **Secondary:** `SECONDARY_SURFACE` (#2C2C2E) background, White text.
- **Destructive:** `NEGATIVE` (Red) text, transparent background.

**Cards:**
- **Background:** `PRIMARY_SURFACE` (#1C1C1E).
- **Shadow:** None (Clean flat design) or extremely subtle glow (`shadowColor: ACCENT`, `shadowOpacity: 0.1`).
- **Radius:** 16pt (matches Apple's "Squircle").

**Typography (SF Pro):**
- **Display:** 52pt, Bold, Tight Tracking (-1.5).
- **Header:** 22pt, Semibold, Normal Tracking.
- **Body:** 17pt, Regular.
- **Caption:** 13pt, Medium, Uppercase, Wide Tracking (0.5).

---

## 6. Accessibility

- **Dynamic Type:** All text wraps `ScaledMetric` equivalent. Layouts expand vertically.
- **Contrast:** `ACCENT` color (#5E5CE6) checks out at 4.8:1 against #1C1C1E.
- **Reduced Motion:** If enabled, "Atmospheric Blooms" become static gradients; "Count-up" becomes instant.
- **VoiceOver:** "Total Balance, 128,000 dollars. Trending up 1.9%."

---

## 7. Responsive Behavior

- **Mobile (iPhone SE - Pro Max):** Stacked vertical layouts. Margins adjust (16pt to 24pt).
- **Foldable / Tablet:**
  - **Layout:** Two-column layout. Sidebar navigation replaces Tab Bar.
  - **Dashboard:** Balance/Chart on left (fixed), Activity Feed on right (scrollable).
- **Orientation:**
  - **Portrait:** Standard stack.
  - **Landscape:** Hide Tab Bar, Chart expands to full width.
