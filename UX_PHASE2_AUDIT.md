# TACTIX AI — Phase 2 Deep UX, Visual & Interaction Optimization Audit

**Audit Date:** Phase 2 Implementation  
**Status:** In Progress  
**Objective:** Transform TACTIX AI from an engineering dashboard into an intuitive, workflow-driven AI-assisted simulation platform.

---

## 1. Problem Identification: Why the Previous UI Still Looked Like a Dashboard
1. **Card Walls & Heavy Boxing:** Almost every metric, panel, and label was wrapped in dark `#131A24` bordered rectangular cards, creating visual clutter and "box fatigue".
2. **Stacked Layout on Home Screen:** Map, options, telemetry, and analytics were stacked vertically rather than arranged into a unified **Spatial + Decision Workspace** (Map on Left/Main, Options on Right).
3. **Monospace & All-Caps Overload:** Overuse of uppercase monospace fonts gave the UI a dense "terminal" look rather than a modern, calm product experience.
4. **Heavy Telemetry in Main View:** Five distinct sensor panels (Terrain, Weather, Logistics, Intel, Constraints) competed for attention.

---

## 2. Proposed Phase 2 Structural & Visual Transformations

| Area | Previous Pattern | Phase 2 Redesign |
| :--- | :--- | :--- |
| **Mission Input & Header** | Boxed panel with internal forms | Clean **Mission Command Bar** with prominent natural-language prompt, quick chips, and a slim horizontal **Scenario Confirmation Bar**. |
| **Scenario Review / Edit** | Inline nested form in review card | Slim confirmation strip with a dedicated **Compact Scenario Edit Drawer/Modal**. |
| **Workspace Layout** | Vertical stack of separate boxes | **Side-by-Side Command Workspace:** Large central interactive map on the left/center (70% width) with vertical scannable Simulated Options on the right (30% width). |
| **Option Presentation** | Generic card triplet | Distinct decision cards with **Trade-Off Summary strip** (*Alpha: Speed \| Bravo: Fuel \| Charlie: Hazard Bypass*). |
| **Map Controls & Popups** | Boxed headers and raw telemetry popup | Modern floating map toolbar (`[ Layers ]`, `[ Legend ]`, `[ Reset ]`) + plain-language inspection popups. |
| **Risk Summary** | Heavy bordered container | Calm visual ranked breakdown with prominent score and `[ Understand Risk ]` calculation drawer. |
| **AI Analyst** | Large full-width box | Concise 1-2 sentence lead narrative with quick prompt pills and expandable deep analysis. |
| **TACTIX Copilot** | Large bottom-right widget | Minimalist `[ TACTIX AI ]` floating badge with non-obstructive docking. |
| **What-If Lab (`/scenario`)** | Dense control panel | Laboratory workspace with real-time Before $\rightarrow$ After comparison and AI-explained change diffs. |
| **Compare Page (`/coa`)** | Collection of charts | Question-oriented comparison workspace (*"Which is faster?", "Which burns less fuel?"*). |
| **Analytics Page (`/analytics`)**| Monolithic telemetry page | Above-the-fold executive session overview + clearly labeled offline ML validation experiment. |
| **Design System & Spacing** | Harsh border outlines and heavy uppercase | Refined typography (Inter for UI, JetBrains Mono only for numbers/coords), generous whitespace, calm contrast, and subtle dividers. |

---

## 3. Preserved Ground-Truth Technical Brain
- ✅ `lib/environment/cost.ts` (Environment Cost: 35% Terrain, 25% Land Cover, 25% Weather, 15% Road Access)
- ✅ `lib/planning/astar.ts` (A* multi-objective pathfinding with MinHeap priority queue)
- ✅ `lib/simulation/coaGenerator.ts` (Alpha Express Corridor, Bravo Fuel Conservation, Charlie Hazard Bypass)
- ✅ `lib/constraints/validator.ts` (Rule validation: VALID, WARNING, INVALID)
- ✅ `lib/risk/riskEngine.ts` (6-factor weighted risk engine: 22% Terrain, 22% Weather, 20% Logistics, 18% Intel, 10% Time, 8% Constraints)
- ✅ `lib/ai/` (`/api/interpret` and `/api/analyze` with deterministic fallbacks)
- ✅ Machine Learning experiment: Random Forest Regressor ($R^2 = 0.9989$, MAE = 0.296, RMSE = 0.388)
