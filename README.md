# TACTIX AI — AI-Assisted Mission Planning

TACTIX AI is a production-grade, explainable decision-support simulation platform built with Next.js 15, TypeScript, MapLibre GL, Recharts, and OpenAI. It combines real public geospatial and meteorological datasets (SRTM DEM, OpenStreetMap, Copernicus Land Cover, ERA5 Weather) with synthetic logistics and intelligence modeling to generate, simulate, and score candidate Courses of Action (COAs).

---

## Key Capabilities

1. **Deterministic Environmental Grid:** Merges SRTM 30m terrain (slope, roughness, aspect), Copernicus land-cover friction, OSM road proximity, and active ERA5 weather scenarios into a unified indexed cell model.
2. **Multi-Objective COA Generator:** Runs A* pathfinding to generate 3 distinct operational alternatives:
   - **COA Alpha:** Speed Priority (Min Duration)
   - **COA Bravo:** Resource Conservation (Min Fuel & Wear)
   - **COA Charlie:** Environmental Hazard Avoidance (Min Risk Exposure)
3. **Deterministic Constraint Validator:** Evaluates route compliance against mission time horizons, fuel capacities, restricted environmental corridors, and simulation bounds (`VALID`, `WARNING`, `INVALID`).
4. **Explainable 0–100 Risk Engine:** Calculates weighted operational risk across 6 transparent factors (Terrain 22%, Weather 22%, Logistics 20%, Intel 18%, Time 10%, Constraints 8%) with full auditable attribution.
5. **AI Mission Understanding & Analyst:** Natural-language mission interpretation (`/api/interpret`) and grounded trade-off synthesis (`/api/analyze`) with zero runtime failure dependency (automatic deterministic fallback).
6. **Scenario Lab & What-If Engine:** Live slider perturbations (weather, resources, time limit, intel confidence) with instant re-simulation and before/after delta calculation.
7. **Tactical Ops Command UI:** Dark command-center theme with 10 toggleable map layers, click-to-inspect cell telemetry, risk gauges, radar capability profiles, and a persistent AI Copilot.

---

## Technology Stack

- **Frontend & App Shell:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Interactive Geospatial Visualizations:** MapLibre GL JS, HTML5 Canvas, Recharts, Lucide Icons
- **AI & Natural Language Layer:** OpenAI API (GPT-4.1-mini) with Zod validation & deterministic fallback engine
- **GIS Preprocessing & Data Pipelines:** Python, NumPy, Rasterio, GeoPandas, Shapely
- **ML Experiment Layer:** Python, Scikit-learn (Random Forest Regressor, $R^2 = 0.9989$)

---

## Quick Start & Local Development

### 1. Prerequisites
- Node.js >= 20.x, npm >= 10.x
- Python >= 3.10 (for offline data pipelines)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/example/tactix-ai.git
cd tactix-ai

# Install frontend dependencies
npm install

# Run the Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the Mission Command Dashboard.

### 3. Environment Variables (Optional)
Create `.env.local` in the project root:
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
```
*(Note: If `OPENAI_API_KEY` is not provided, the platform operates seamlessly using the built-in deterministic AI interpreter and analyst engine).*

---

## Repository Documentation

- [docs/DATASETS.md](docs/DATASETS.md): Provenance, resolutions, CRS, licensing, and schema for SRTM, OSM, Copernicus, ERA5, and synthetic operational datasets.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): Layered system design, dependency rules, and failure modes.
- [docs/METHODOLOGY.md](docs/METHODOLOGY.md): Environment cost formulas, multi-objective A* formulation, and simulation metrics.
- [docs/RISK_MODEL.md](docs/RISK_MODEL.md): Factor weights, normalization, risk bands, and ML experiment evaluation.

---

## Verification & Testing

Run the automated simulation and risk engine test suite:
```bash
npm test
```
Or execute a production build:
```bash
npm run build
```

---

## Ethical & Framing Disclaimer

> **Framing Notice:** TACTIX AI is a simulated decision-support prototype designed exclusively for fictional training scenarios. It estimates risk within a controlled virtual environment using physical environmental layers and synthetic parameters. The platform presents trade-offs to support human judgment and does not predict real-world operational outcomes or command autonomous actions.
