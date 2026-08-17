import { EnvCell } from "../environment/types";
import { ConstraintResult } from "../constraints/types";
import { RiskResult } from "../risk/types";

export interface COAMetrics {
  distance_km: number;
  estimated_duration_hours: number;
  resource_consumption: number; // 0 to 1.0 scale (e.g., 0.52 for 52%)
  terrain_exposure: number;     // 0 to 100
  weather_exposure: number;     // 0 to 100
  land_cover_exposure: number;  // 0 to 100
  intel_uncertainty: number;    // 0 to 1.0
  max_environment_cost: number;
  average_speed_kmh: number;
}

export interface COA {
  id: "COA-Alpha" | "COA-Bravo" | "COA-Charlie";
  name: "Alpha" | "Bravo" | "Charlie";
  title: string;
  tagline: string;
  color: string;
  pathCellIds: string[];
  pathCells: EnvCell[];
  metrics: COAMetrics;
  constraints: ConstraintResult;
  risk: RiskResult;
  isPreferred?: boolean;
}

export interface IntelReport {
  report_id: string;
  timestamp: string;
  zone: string;
  zone_id?: string;
  latitude: number;
  longitude: number;
  observation_type: string;
  confidence: number;
  reliability: number;
  age_minutes: number;
  uncertainty: number;
  source_type: string;
  badge?: string;
}

export interface LogisticsProfile {
  scenario_id: string;
  name?: string;
  personnel_available: number;
  resource_level: number;
  equipment_readiness: number;
  supply_level: number;
  time_limit: number;
  mobility_factor: number;
}

export interface MissionScenario {
  scenario_id: string;
  name: string;
  description: string;
  weather_condition: "NORMAL" | "LIGHT_RAIN" | "HIGH_WIND" | "HEAVY_RAIN" | "POOR_CONDITIONS";
  resource_level: number;
  personnel: number;
  time_limit: number;
  intelligence_confidence: number;
  terrain_preference: "ANY" | "AVOID_DIFFICULT" | "AVOID_WATER";
  start: { row: number; col: number; lat: number; lon: number; label: string };
  goal: { row: number; col: number; lat: number; lon: number; label: string };
}
