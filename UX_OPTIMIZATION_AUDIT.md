# TACTIX AI — UX Optimization & Architecture Audit

**Document Version:** 2.0  
**Project:** TACTIX AI (Decision-Support Prototype)  
**Target:** Local Prototype (`tactix-ai`)  
**Audit Purpose:** Comprehensive mapping of existing codebase against the Final Product Optimization & Implementation Plan.

---

## 1. Executive Summary & Principles
The optimization goal is: **"TACTIX AI must become easier to use without becoming less capable."**
- All ground-truth engines (Environment Engine, A* Pathfinding, Constraint Engine, Simulation Engine, Risk Engine) remain authoritative and untouched for mathematical logic.
- The Simple/Advanced toggle is removed in favor of a single unified experience with **Progressive Disclosure** (`[ View Details ]`, `[ Why? ]`, map layer controls, cell inspector, and Help).

---

## 2. Component & File Mapping

| Plan Element | Real File Path in Codebase | Decision / Action |
| :--- | :--- | :--- |
| **Simple/Advanced Toggle** | `lib/context/ViewModeContext.tsx`, `components/Layout/Navbar.tsx` | **Remove toggle entirely**; standardize progressive disclosure across all views. |
| **Unified Navigation** | `components/Layout/Navbar.tsx` | Top-level items: `Mission`, `Compare`, `What-If`, `Analytics`, `Help`. |
| **Header Block & Mission Input** | `components/Mission/MissionInput.tsx` | Update header to exact copy ("TACTIX AI / AI-Assisted Simulation & Risk Platform / Controlled Simulation Environment"), dominant input, 3 example chips, inline editable scenario review card. |
| **6-Step Guided Tour** | `components/Modals/GuidedTourModal.tsx` | Update to exact 6-step copy ("Describe Your Scenario", "Review the Scenario", "Understand the Simulated Environment", "Compare Simulated Options", "Understand Why Results Differ", "Change Conditions and Re-run", Final "You're Ready"). |
| **Tactical Map & Layers** | `components/Map/TacticalMap.tsx` | Default visible: Alpha/Bravo/Charlie, Roads, Water. Categorized Map Layers drawer for other layers. Friendly cell inspector popup. |
| **Simulated Option Cards** | `components/COA/COACard.tsx`, `components/COA/COAComparison.tsx` | Friendly descriptors ("Faster simulated option", "Resource-efficient simulated option", "Lower environmental difficulty"), `[ Why? ]`, `[ View Details ]`, accessible status symbols (`✓ VALID`, `■ WARNING`, `✗ INVALID`). |
| **Risk Presentation** | `components/Risk/RiskBreakdown.tsx` | Headline score `46 / 100 MEDIUM`, labelled bars (Weather, Terrain, Resource, Information, Time, Constraint), `[ Understand Risk ]` expansion. |
| **AI Analyst** | `components/AI/AIAnalysisPanel.tsx` | Quick action buttons, concise 1-2 sentence lead + `[ View Detailed Explanation ]`. |
| **TACTIX Copilot** | `components/AI/AICopilot.tsx` | Persistent dismissible floating panel with quick prompt chips. |
| **What-If Scenario Lab** | `app/scenario/page.tsx` | Real-time simulation, side-by-side Baseline vs What-If, "WHAT CHANGED?" diff, "WHY DID IT CHANGE?" AI explanation. |
| **Compare Page** | `app/coa/page.tsx` | Reordered hierarchy: Summary row, key metrics, visual radar comparison, risk bar chart, technical metrics. |
| **Analytics Dashboard** | `app/analytics/page.tsx` | Above-the-fold KPIs (Total simulations, average risk, compliance rate, average duration, option distribution, risk factor contribution), labeled offline ML experiment ($R^2 = 0.9989$). |
| **Help & Data Provenance** | `components/Modals/HelpModal.tsx` | Single central destination with Replay Tour, How TACTIX Works, Understanding Options, Understanding Risk, Understanding What-If, and Data Provenance. |

---

## 3. Label Rewrites Matrix

| Technical Label | Required User-Facing Label | Implemented Across App |
| :--- | :--- | :--- |
| `AOI` | **Study Area** | ✅ Applied |
| `COA` | **Simulated Option** | ✅ Applied |
| `Terrain Exposure` | **Terrain Difficulty** | ✅ Applied |
| `Weather Exposure` | **Weather Impact** | ✅ Applied |
| `Logistics Capacity` | **Resource Availability** | ✅ Applied |
| `Intel Uncertainty` | **Information Uncertainty** | ✅ Applied |
| `Constraint Pressure` | **Constraint Impact** | ✅ Applied |
| `Environment Cost` | **Environmental Difficulty** | ✅ Applied |
| `Land Cover` | **Land Type** | ✅ Applied |
| `Synthetic Intelligence` | **Simulated Information** | ✅ Applied |
| `Constraint Validator` | **Rule Check** | ✅ Applied |

---

## 4. Phase Verification Status

- [x] Phase 1: Codebase and architecture audit completed
- [x] Phase 2: UX information architecture structured
- [x] Phase 3: Simple/Advanced mode removed from UI
- [x] Phase 4: Unified navigation implemented
- [x] Phase 5: 6-step guided tour updated
- [x] Phase 6: Mission input redesigned with chips & review card
- [x] Phase 7: Scenario interpretation & review workflow verified
- [x] Phase 8: Simulation loading experience polished
- [x] Phase 9: Tactical map & categorized layer manager optimized
- [x] Phase 10: Option Alpha/Bravo/Charlie cards refined
- [x] Phase 11: Risk breakdown & "Understand Risk" drawer updated
- [x] Phase 12: Contextual `[ Why? ]` modal pattern unified
- [x] Phase 13: AI Analyst quick actions refined
- [x] Phase 14: Copilot persistent drawer verified
- [x] Phase 15: What-If Scenario Lab side-by-side comparison verified
- [x] Phase 16: Compare page hierarchy streamlined
- [x] Phase 17: Analytics dashboard KPIs verified
- [x] Phase 18: Help & Data Provenance unified
- [x] Phase 19: Responsive design verified
- [x] Phase 20: Accessibility pass (symbols + contrast + semantic elements)
- [x] Phase 21: Performance optimization verified
- [x] Phase 22: Codebase cleanup & dead code elimination
- [x] Phase 23: Security audit (server-side only keys, Zod validation)
- [x] Phase 24: Regression testing (`npm test` 4/4 passing)
- [x] Phase 25: Production build verified (`npm run build` succeeds)
