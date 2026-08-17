# TACTIX AI - UX Redesign & Progressive Disclosure Architecture

## Objective
Transform TACTIX AI from a developer/command-center dashboard into a frictionless, accessible decision-support experience that anyone can understand within seconds, while keeping 100% of the underlying deterministic GIS, simulation, risk modeling, and ML technical capabilities accessible on demand.

---

## 1. Dual-Mode Architecture: Simple vs Advanced

```
+-----------------------------------------------------------------------------------+
| Top Navigation: TACTIX AI | Mission · Compare · What-If · Insights | [?] Help | [Simple | Advanced] |
+-----------------------------------------------------------------------------------+
| Workflow Indicator: ① Describe ──► ② Review ──► ③ Compare ──► ④ Explore           |
+-----------------------------------------------------------------------------------+
```

### Simple View (Default)
- **Workflow-Driven Layout:** 
  1. Describe your scenario in natural language
  2. Clean scenario review card (Weather, Resources, Time, Terrain, Information Confidence)
  3. Simplified Tactical Map (Clean default layers: Options, Roads, Water)
  4. 3 Friendly Simulated Options:
     - ⚡ **Option Alpha** (Faster simulated option)
     - 📦 **Option Bravo** (Resource-efficient simulated option)
     - 🌿 **Option Charlie** (Lower environmental difficulty)
  5. Simplified Risk Summary (0-100 score + visual progress bars + `[ Why? ]` explanations + `[ Understand Risk ]` deep-dive)
  6. Conversational AI Analyst with quick-action prompt buttons
  7. Embedded What-If quick comparison

### Advanced View (Power Mode)
- Full SRTM 30m terrain telemetry (elevation, slope, roughness, aspect)
- Meteorology panel (ERA5 reanalysis parameters)
- Operational logistics readiness panel
- Full synthetic intelligence report feed
- Constraint boundary diagnostics
- Full 10-layer MapLibre inspector
- 6-factor mathematical risk decomposition weights
- Raw simulation telemetry & ML regression indicators

---

## 2. Opening Experience & Progressive Disclosure
1. **Welcome Modal:** Triggered on first visit (`localStorage` checked), explaining the platform in 2 plain sentences with ethical framing disclaimer.
2. **5-Step Guided Tour:**
   - Step 1: Describe Scenario (Spotlight Mission Input)
   - Step 2: Review Scenario (Spotlight Scenario Card)
   - Step 3: Understand Environment (Spotlight Map)
   - Step 4: Compare Simulated Options (Spotlight Options Alpha/Bravo/Charlie)
   - Step 5: Understand Risk & Try What-If (Spotlight Risk & Scenario Lab)
3. **`[ ? Help ]` Action in Navbar:** Opens About Modal + allows replaying the guided tour anytime.
4. **Contextual `[ Why? ]` Buttons:** Explains risk scores, terrain impact, and weather friction in plain English grounded in actual computed values.
5. **Categorized Map Layer Control:** Collapsible dropdown/drawer organizing layers into Environment, Infrastructure, Simulation, and Advanced.
6. **Friendly Status Badges:** `✓ VALID`, `⚠ WARNING`, `✕ INVALID`.
