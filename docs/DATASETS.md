# TACTIX AI - Datasets & Data Sources

This document details all real geospatial/environmental datasets and synthetic operational datasets utilized within the TACTIX AI platform.

---

## 1. Real Environmental Datasets

### A. Terrain: USGS/NASA SRTM 1 Arc-Second Global DEM
- **Provider:** USGS / NASA Earth Data
- **Spatial Resolution:** ~30 meters (1 arc-second)
- **Coverage:** Global (Clipped to Area of Interest: 12.95°N to 13.01°N, 80.13°E to 80.20°E)
- **License:** Public Domain / Open Access
- **Variables Extracted:**
  - Elevation ($z$ in meters)
  - Slope (degrees derived via gradient $\arctan\sqrt{dz/dx^2 + dz/dy^2}$)
  - Aspect (degrees azimuth)
  - Terrain Roughness ($3\times3$ standard deviation of elevation window)
- **Output Files:** `data/terrain/terrain.geojson`, `data/terrain/grid.json`

### B. Geographic Features: OpenStreetMap (OSM)
- **Provider:** OpenStreetMap Contributors
- **Coverage:** Study Area Corridor
- **License:** Open Database License (ODbL)
- **Features Extracted:**
  - `roads.geojson`: Primary highways, secondary bypasses, tertiary corridors, unpaved tracks.
  - `waterways.geojson`: River channels, drainage canals.
  - `buildings.geojson`: Logistics depots, substations, administrative structures.
  - `bridges.geojson`: River crossing points with weight constraints.
  - `landuse.geojson`: Industrial zones, reserve woodlands, agricultural basins.
- **Output Directory:** `data/osm/`

### C. Land Cover: Copernicus Global Land Service
- **Provider:** Copernicus Land Monitoring Service / European Commission
- **Spatial Resolution:** 100m raster reprojected to 30m grid
- **License:** Free and Open Data Policy
- **Simulation Friction Multipliers:**
  | Class | Classification | Movement Friction Factor |
  | :--- | :--- | :--- |
  | `urban` | Built-up / Impervious | 0.50 |
  | `forest` | Dense Canopy Woodland | 0.70 |
  | `grassland` | Open Scrub / Field | 0.30 |
  | `cropland` | Cultivated Basin | 0.40 |
  | `water` | Open Waterway | 1.00 (Impassable unless bridged) |
  | `wetland` | Marsh / Saturated Bog | 0.80 |
  | `bare` | Compacted Soil / Clay | 0.35 |
- **Output File:** `data/landcover/landcover.geojson`

### D. Weather: ECMWF ERA5 Meteorological Reanalysis
- **Provider:** ECMWF / Copernicus Climate Change Service (C3S)
- **License:** Creative Commons CC-BY 4.0
- **Variables Utilized:** Temperature (°C), Precipitation (mm/hr), Wind Speed (m/s), Wind Direction, Surface Pressure (hPa), Visibility (km).
- **Classified Weather Scenario Spectrum:**
  | Condition | Description | Weather Impact Score |
  | :--- | :--- | :--- |
  | `NORMAL` | Clear skies, dry ground, minimal wind | 10 / 100 |
  | `LIGHT_RAIN` | Light drizzle, minor slickness | 30 / 100 |
  | `HIGH_WIND` | Sustained gale gusts (>14 m/s) | 55 / 100 |
  | `HEAVY_RAIN` | Torrential monsoon downpour | 70 / 100 |
  | `POOR_CONDITIONS` | Severe storm, low visibility | 90 / 100 |
- **Output File:** `data/weather/weather.json`

---

## 2. Synthetic Operational Datasets

All operational and intelligence data are purely synthetic and generated in-house for simulation testing only.

### A. Synthetic Logistics (`data/logistics/logistics.json`)
- `scenario_id`: Scenario unique identifier
- `personnel_available`: Available staff capacity
- `resource_level`: Available fuel/supply index (0.0 to 1.0)
- `equipment_readiness`: Operational availability factor (0.0 to 1.0)
- `supply_level`: Supply inventory factor (0.0 to 1.0)
- `time_limit`: Mission deadline cutoff in hours
- `mobility_factor`: Vehicular performance coefficient (0.50 to 0.95)

### B. Synthetic Intelligence (`data/intelligence/intelligence.json`)
- `report_id`: Unique tracking tag (e.g. `INT-001`)
- `zone`: Observation sector name
- `confidence`: Sensor confidence coefficient (0.0 to 1.0)
- `reliability`: Source reliability metric (0.0 to 1.0)
- `uncertainty`: Calculated as $1 - (\text{confidence} \times \text{reliability})$
- `badge`: Always explicitly rendered with `Simulation Only`.

### C. Operational Constraints (`data/scenarios/constraints.json`)
- `time_limit`: Maximum allowable mission transit duration
- `resource_limit`: Maximum allowable resource expenditure
- `environmental_limit`: Hard ceiling for single-cell environmental friction
- `restricted_zones`: Polygon coordinates for impassable or restricted corridors.
