import { ConstraintResult } from "../constraints/types";
import { COAMetrics, LogisticsProfile, MissionScenario } from "../simulation/types";
import { RiskContributions, RiskResult } from "./types";

export const RISK_WEIGHTS = {
  terrain: 0.22,
  weather: 0.22,
  logistics: 0.20,
  intelUncertainty: 0.18,
  timePressure: 0.10,
  constraintPressure: 0.08,
} as const;

function clamp01(val: number): number {
  return Math.max(0, Math.min(1, val));
}

/**
 * Deterministic Explainable Weighted Risk Model per Section 21.
 * Calculates overall 0-100 risk score and exact component contributions.
 */
export function computeRisk(
  metrics: COAMetrics,
  constraints: ConstraintResult,
  scenario: MissionScenario,
  logistics: LogisticsProfile
): RiskResult {
  const terrainVal = metrics.terrain_exposure;
  const weatherVal = metrics.weather_exposure;
  
  // Logistics factor: lower readiness/supplies = higher logistics risk (0 - 100)
  const logisticsVal = 100 - (logistics.resource_level * logistics.equipment_readiness * 100);
  
  // Intelligence uncertainty factor (0 - 100)
  const intelVal = metrics.intel_uncertainty * 100;
  
  // Time pressure: ratio of duration to scenario time limit (0 - 100)
  const timeRatio = metrics.estimated_duration_hours / scenario.time_limit;
  const timeVal = clamp01(timeRatio - 0.4) * (100 / 0.6);
  
  // Constraint pressure: warning adds 15, violation adds 40, capped at 100
  const constraintVal = Math.min(100, constraints.warnings.length * 18 + constraints.violations.length * 45);

  const contributions: RiskContributions = {
    terrain: Math.round(terrainVal * RISK_WEIGHTS.terrain * 10) / 10,
    weather: Math.round(weatherVal * RISK_WEIGHTS.weather * 10) / 10,
    logistics: Math.round(logisticsVal * RISK_WEIGHTS.logistics * 10) / 10,
    intelligence: Math.round(intelVal * RISK_WEIGHTS.intelUncertainty * 10) / 10,
    time: Math.round(timeVal * RISK_WEIGHTS.timePressure * 10) / 10,
    constraints: Math.round(constraintVal * RISK_WEIGHTS.constraintPressure * 10) / 10,
  };

  const rawOverall = Object.values(contributions).reduce((sum, val) => sum + val, 0);
  const overall = Math.round(Math.min(100, Math.max(0, rawOverall)));

  let riskBand: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  let riskColor = "#00D9A3"; // Tactical Green

  if (overall >= 67 || constraints.status === "INVALID") {
    riskBand = "HIGH";
    riskColor = "#FF3B5C"; // Tactical Red
  } else if (overall >= 34 || constraints.status === "WARNING") {
    riskBand = "MEDIUM";
    riskColor = "#FFB020"; // Tactical Amber
  }

  return {
    overall,
    contributions,
    riskBand,
    riskColor,
  };
}
