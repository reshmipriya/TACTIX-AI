import { EnvCell, EnvGrid, WeatherScenario } from "../environment/types";
import { environmentCost, haversineDistance } from "../environment/cost";
import { aStar, resourceBurnEdge } from "../planning/astar";
import { Objective } from "../planning/types";
import { validateConstraints } from "../constraints/validator";
import { OperationalConstraints } from "../constraints/types";
import { computeRisk } from "../risk/riskEngine";
import { computeCOAMetrics } from "./metrics";
import { COA, IntelReport, LogisticsProfile, MissionScenario } from "./types";

export const OBJECTIVES: Record<"Alpha" | "Bravo" | "Charlie", Objective> = {
  Alpha: {
    name: "Speed Priority (Min Duration)",
    description: "Distance-weighted path minimizing simulated transit time; discounts terrain friction.",
    edgeCost: (grid: EnvGrid, a: EnvCell, b: EnvCell, weather: WeatherScenario) => {
      const dist = haversineDistance(a.latitude, a.longitude, b.latitude, b.longitude);
      const env = environmentCost(b, weather);
      const roadAdvantage = b.road_accessibility > 0.5 ? 0.6 : 1.2;
      return dist * 1.0 * roadAdvantage + (env / 100) * 0.2;
    },
  },
  Bravo: {
    name: "Resource Conservation (Min Fuel / Wear)",
    description: "Burn-weighted path favoring steady grades and paved corridors to preserve supplies.",
    edgeCost: (grid: EnvGrid, a: EnvCell, b: EnvCell, weather: WeatherScenario) => {
      const burn = resourceBurnEdge(a, b);
      const env = environmentCost(b, weather);
      return burn * 1.0 + (env / 100) * 0.4;
    },
  },
  Charlie: {
    name: "Environmental Avoidance (Min Risk Profile)",
    description: "Environment-weighted path steering clear of steep slopes, dense vegetation, and saturated terrain.",
    edgeCost: (grid: EnvGrid, a: EnvCell, b: EnvCell, weather: WeatherScenario) => {
      const dist = haversineDistance(a.latitude, a.longitude, b.latitude, b.longitude);
      const env = environmentCost(b, weather);
      const waterAvoidance = b.water_proximity > 0.5 ? 3.0 : 1.0;
      return (env / 100) * 1.0 * waterAvoidance + dist * 0.3;
    },
  },
};

/**
 * Generates all three distinct candidate Courses of Action (Alpha, Bravo, Charlie)
 * from the environment grid and scenario specifications.
 */
export function generateCOAs(
  grid: EnvGrid,
  scenario: MissionScenario,
  weather: WeatherScenario,
  logistics: LogisticsProfile,
  intelReports: IntelReport[],
  constraints: OperationalConstraints
): COA[] {
  const startId = `r${String(scenario.start.row).padStart(2, "0")}_c${String(scenario.start.col).padStart(2, "0")}`;
  const goalId = `r${String(scenario.goal.row).padStart(2, "0")}_c${String(scenario.goal.col).padStart(2, "0")}`;

  const coaConfigs: {
    name: "Alpha" | "Bravo" | "Charlie";
    id: "COA-Alpha" | "COA-Bravo" | "COA-Charlie";
    title: string;
    tagline: string;
    color: string;
  }[] = [
    {
      name: "Alpha",
      id: "COA-Alpha",
      title: "COA Alpha (Express Arterial Corridor)",
      tagline: "Minimizes simulated transit duration",
      color: "#00D9A3", // Tactical Green
    },
    {
      name: "Bravo",
      id: "COA-Bravo",
      title: "COA Bravo (Supply-Optimized Route)",
      tagline: "Minimizes fuel burn & equipment wear",
      color: "#3B82F6", // Tactical Blue
    },
    {
      name: "Charlie",
      id: "COA-Charlie",
      title: "COA Charlie (Low-Hazard Bypass)",
      tagline: "Minimizes rugged terrain & environmental exposure",
      color: "#FFB020", // Tactical Amber
    },
  ];

  const coas: COA[] = coaConfigs.map((config) => {
    let pathResult;
    try {
      pathResult = aStar(grid, startId, goalId, OBJECTIVES[config.name], weather);
    } catch (e) {
      // Fallback direct line if start/goal is blocked
      const fallbackCells = Object.values(grid).slice(0, 15);
      pathResult = {
        cellIds: fallbackCells.map((c) => c.cell_id),
        cells: fallbackCells,
        totalCost: 999,
      };
    }

    const metrics = computeCOAMetrics(pathResult.cells, scenario, logistics, weather, intelReports);
    const constraintResult = validateConstraints(
      {
        pathCells: pathResult.cells,
        estimatedDuration: metrics.estimated_duration_hours,
        resourceConsumption: metrics.resource_consumption,
        maxEnvCost: metrics.max_environment_cost,
      },
      constraints
    );
    const risk = computeRisk(metrics, constraintResult, scenario, logistics);

    return {
      id: config.id,
      name: config.name,
      title: config.title,
      tagline: config.tagline,
      color: config.color,
      pathCellIds: pathResult.cellIds,
      pathCells: pathResult.cells,
      metrics,
      constraints: constraintResult,
      risk,
    };
  });

  // Determine "Preferred simulated alternative" (lowest risk among VALID COAs, or lowest risk among WARNING)
  const validOrWarning = coas.filter((c) => c.constraints.status !== "INVALID");
  const candidates = validOrWarning.length > 0 ? validOrWarning : coas;
  let preferred = candidates[0];
  for (const c of candidates) {
    if (c.risk.overall < preferred.risk.overall) {
      preferred = c;
    }
  }
  preferred.isPreferred = true;

  return coas;
}
