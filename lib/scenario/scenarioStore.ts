import { DEFAULT_GRID, DEFAULT_WEATHER_LIST, buildEnvironmentGrid } from "../environment/buildGrid";
import { WeatherCondition, WeatherScenario } from "../environment/types";
import { OperationalConstraints } from "../constraints/types";
import { generateCOAs } from "../simulation/coaGenerator";
import { COA, IntelReport, LogisticsProfile, MissionScenario } from "../simulation/types";
import { interpretMissionLocally, analyzeCOAsLocally } from "../ai/client";
import { AIAnalysisResponse, AnalysisMode, MissionParams } from "../ai/types";

import scenariosJson from "@/data/scenarios/scenarios.json";
import logisticsJson from "@/data/logistics/logistics.json";
import intelJson from "@/data/intelligence/intelligence.json";
import constraintsJson from "@/data/scenarios/constraints.json";

export interface SimulationRunResult {
  runId: string;
  timestamp: string;
  scenario: MissionScenario;
  weather: WeatherScenario;
  logistics: LogisticsProfile;
  intelReports: IntelReport[];
  constraints: OperationalConstraints;
  coas: COA[];
  preferredCOA: COA;
  aiAnalysis?: AIAnalysisResponse;
}

export interface ScenarioDelta {
  coaName: "Alpha" | "Bravo" | "Charlie";
  baseRisk: number;
  whatIfRisk: number;
  riskDelta: number;
  baseDuration: number;
  whatIfDuration: number;
  durationDelta: number;
  baseResources: number;
  whatIfResources: number;
  resourcesDelta: number;
  baseStatus: string;
  whatIfStatus: string;
}

// Master Static Datasets
export const SCENARIOS: MissionScenario[] = scenariosJson as unknown as MissionScenario[];
export const LOGISTICS_PROFILES: LogisticsProfile[] = logisticsJson as unknown as LogisticsProfile[];
export const INTEL_REPORTS: IntelReport[] = intelJson as unknown as IntelReport[];
export const DEFAULT_CONSTRAINTS: OperationalConstraints = constraintsJson[0] as unknown as OperationalConstraints;

/**
 * Executes a full deterministic simulation pipeline.
 */
export function runSimulation(
  scenario: MissionScenario,
  weatherOverride?: WeatherCondition,
  resourceOverride?: number,
  timeOverride?: number,
  intelConfidenceOverride?: number,
  constraintsOverride?: OperationalConstraints
): SimulationRunResult {
  const activeWeatherCond = weatherOverride ?? scenario.weather_condition;
  const activeWeather = DEFAULT_WEATHER_LIST.find((w) => w.condition === activeWeatherCond) ?? DEFAULT_WEATHER_LIST[0];

  const activeLogistics: LogisticsProfile = {
    ...LOGISTICS_PROFILES[0],
    scenario_id: scenario.scenario_id,
    resource_level: resourceOverride ?? scenario.resource_level,
    time_limit: timeOverride ?? scenario.time_limit,
  };

  const activeScenario: MissionScenario = {
    ...scenario,
    weather_condition: activeWeatherCond,
    resource_level: activeLogistics.resource_level,
    time_limit: activeLogistics.time_limit,
    intelligence_confidence: intelConfidenceOverride ?? scenario.intelligence_confidence,
  };

  const activeConstraints: OperationalConstraints = constraintsOverride ?? {
    ...DEFAULT_CONSTRAINTS,
    time_limit: activeScenario.time_limit,
    resource_limit: activeScenario.resource_level,
  };

  // Build grid with active weather
  const grid = buildEnvironmentGrid(DEFAULT_GRID, activeWeather);

  // Generate COAs with A*, constraints, and risk
  const coas = generateCOAs(
    grid,
    activeScenario,
    activeWeather,
    activeLogistics,
    INTEL_REPORTS,
    activeConstraints
  );

  const preferredCOA = coas.find((c) => c.isPreferred) ?? coas[0];
  const aiAnalysis = analyzeCOAsLocally(activeScenario, coas, "compare");

  return {
    runId: `RUN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    scenario: activeScenario,
    weather: activeWeather,
    logistics: activeLogistics,
    intelReports: INTEL_REPORTS,
    constraints: activeConstraints,
    coas,
    preferredCOA,
    aiAnalysis,
  };
}

/**
 * Computes comparative deltas between baseline simulation run and what-if simulation run.
 */
export function computeScenarioDeltas(
  baseRun: SimulationRunResult,
  whatIfRun: SimulationRunResult
): ScenarioDelta[] {
  return (["Alpha", "Bravo", "Charlie"] as const).map((name) => {
    const baseCoa = baseRun.coas.find((c) => c.name === name)!;
    const whatIfCoa = whatIfRun.coas.find((c) => c.name === name)!;

    return {
      coaName: name,
      baseRisk: baseCoa.risk.overall,
      whatIfRisk: whatIfCoa.risk.overall,
      riskDelta: whatIfCoa.risk.overall - baseCoa.risk.overall,
      baseDuration: baseCoa.metrics.estimated_duration_hours,
      whatIfDuration: whatIfCoa.metrics.estimated_duration_hours,
      durationDelta: Number((whatIfCoa.metrics.estimated_duration_hours - baseCoa.metrics.estimated_duration_hours).toFixed(2)),
      baseResources: Math.round(baseCoa.metrics.resource_consumption * 100),
      whatIfResources: Math.round(whatIfCoa.metrics.resource_consumption * 100),
      resourcesDelta: Math.round(whatIfCoa.metrics.resource_consumption * 100) - Math.round(baseCoa.metrics.resource_consumption * 100),
      baseStatus: baseCoa.constraints.status,
      whatIfStatus: whatIfCoa.constraints.status,
    };
  });
}
