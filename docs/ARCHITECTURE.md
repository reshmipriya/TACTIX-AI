# TACTIX AI - System Architecture

TACTIX AI implements a clean 4-layer architecture engineered to ensure that presentation, AI interpretation, deterministic simulation, and offline data processing remain strictly decoupled and testable in isolation.

---

## 1. Architectural Layers

| Layer | Primary Responsibilities | Failure Mode & Fallback |
| :--- | :--- | :--- |
| **Presentation** (`app/`, `components/`) | Renders mission command dashboards, interactive MapLibre map, telemetry panels, COA cards, and charts. | Component error boundaries; UI degrades gracefully without blanking. |
| **AI Layer** (`lib/ai/`, `/api/interpret`, `/api/analyze`) | Converts natural language to structured parameters; explains trade-offs and deltas in plain language. | Strict 10-12s timeout; falls back instantly to deterministic local interpreter & analyst. |
| **Simulation Core** (`lib/environment`, `lib/planning`, `lib/simulation`, `lib/constraints`, `lib/risk`) | Pure TypeScript functions: environment cost calculation, multi-objective A* pathfinding, constraint validation, weighted-sum risk scoring. | Pure functions over static data — zero network dependency, 100% deterministic reproducibility. |
| **Data Assets** (`data/`, `data-pipeline/`, `ml/`) | Preprocessed GeoJSON, JSON, and Parquet files generated offline by Python GIS pipelines. | Missing files trigger explicit "dataset unavailable" UI alerts instead of silent errors. |

---

## 2. Dependency Direction Rules

```
app/ (Presentation)
  │
  ├──► lib/ai/* (Next.js API routes call AI helpers)
  └──► lib/planning/* (Pages execute simulation core directly)
        │
        └──► lib/environment/*, lib/constraints/*, lib/risk/*
              │
              └──► data/* (Preprocessed static JSON/GeoJSON files)
```

> [!IMPORTANT]
> **Strict Isolation Rule:** The Simulation Core (`lib/simulation/*`, `lib/planning/*`, `lib/risk/*`) NEVER imports from the AI Layer (`lib/ai/*`). The simulation and risk calculations remain completely authoritative, deterministic, and functional even if the AI service is disabled.

---

## 3. End-to-End Execution Flow

1. **Mission Input:** User submits natural-language orders or selects a scenario preset.
2. **AI Interpreter:** `/api/interpret` extracts structured parameters: `{ weather, resource_level, time_limit, terrain_preference }`, validated with Zod.
3. **Environment Model:** Terrain (SRTM), Land Cover (Copernicus), OSM road proximity, and active ERA5 weather merge into indexed cells (`EnvGrid`).
4. **COA Generator:** Evaluates 3 distinct optimization objectives using A* pathfinding:
   - **COA Alpha:** Minimizes duration (Speed priority).
   - **COA Bravo:** Minimizes fuel/resource burn.
   - **COA Charlie:** Minimizes environmental difficulty/hazards.
5. **Constraint Engine:** Validates each route against duration cutoffs, resource envelopes, restricted zones, and perimeter boundaries. Classifies COAs into `VALID`, `WARNING`, or `INVALID`.
6. **Risk Engine:** Computes an explainable 0–100 risk score and exact 6-factor attribution breakdown.
7. **AI Decision Analyst:** `/api/analyze` synthesizes metrics, trade-offs, and delta comparisons grounded strictly in the calculated numbers.
8. **Human Decision:** Results are presented to the operator on the interactive dashboard or explored in the What-If Scenario Lab.
