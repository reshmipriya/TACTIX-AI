import { EnvCell, WeatherScenario } from "../environment/types";
import { environmentCost, haversineDistance } from "../environment/cost";
import { COAMetrics, IntelReport, LogisticsProfile, MissionScenario } from "./types";

/**
 * Computes simulation metrics for a generated route path.
 */
export function computeCOAMetrics(
  pathCells: EnvCell[],
  scenario: MissionScenario,
  logistics: LogisticsProfile,
  weather: WeatherScenario,
  intelReports: IntelReport[]
): COAMetrics {
  if (!pathCells || pathCells.length === 0) {
    return {
      distance_km: 0,
      estimated_duration_hours: 0,
      resource_consumption: 0,
      terrain_exposure: 0,
      weather_exposure: 0,
      land_cover_exposure: 0,
      intel_uncertainty: 0,
      max_environment_cost: 0,
      average_speed_kmh: 0,
    };
  }

  // 1. Distance (km)
  let totalDistanceKm = 0;
  for (let i = 0; i < pathCells.length - 1; i++) {
    const a = pathCells[i];
    const b = pathCells[i + 1];
    totalDistanceKm += haversineDistance(a.latitude, a.longitude, b.latitude, b.longitude);
  }
  // If only 1 cell or distance is very small, minimum step distance
  if (totalDistanceKm === 0 && pathCells.length > 1) {
    totalDistanceKm = (pathCells.length - 1) * 0.45;
  }

  // 2. Average environmental attributes along path
  const totalCells = pathCells.length;
  let sumTerrainScore = 0;
  let sumLandCoverFactor = 0;
  let maxEnvCost = 0;

  for (const cell of pathCells) {
    sumTerrainScore += cell.terrain_score;
    sumLandCoverFactor += cell.land_cover_factor;
    const cost = environmentCost(cell, weather);
    if (cost > maxEnvCost) maxEnvCost = cost;
  }

  const avgTerrainScore = sumTerrainScore / totalCells;
  const avgLandCoverFactor = sumLandCoverFactor / totalCells;
  const weatherExposure = weather.impact_score;

  // 3. Estimated Duration (hours)
  // formula: distance / (base_speed * mobility_factor * terrain_penalty)
  const baseSpeedKmh = 25.0; // base off-road vehicle transit speed
  const mobilityFactor = Math.max(0.3, logistics.mobility_factor);
  const terrainPenalty = Math.max(0.35, 1.0 - (avgTerrainScore / 200.0) - (weatherExposure / 400.0));
  const effectiveSpeedKmh = baseSpeedKmh * mobilityFactor * terrainPenalty;
  const estimatedDurationHours = Number((totalDistanceKm / effectiveSpeedKmh).toFixed(2));

  // 4. Resource Consumption (normalized 0 to 1.0)
  // formula: base_burn_rate * duration * (1 + 0.5 * avg(environmentCost)/100)
  const baseBurnRatePerHour = 0.09; // 9% fuel/supplies per hour
  const avgEnvCost = (0.35 * avgTerrainScore) + (0.25 * avgLandCoverFactor * 100) + (0.25 * weatherExposure) + 5;
  const rawResourceConsumption = baseBurnRatePerHour * estimatedDurationHours * (1.0 + (0.5 * avgEnvCost) / 100.0);
  const resourceConsumption = Number(Math.min(1.0, Math.max(0.05, rawResourceConsumption)).toFixed(2));

  // 5. Intelligence Uncertainty
  // Average uncertainty of intelligence reports near this route (< 2.5 km)
  let matchingReportsCount = 0;
  let sumUncertainty = 0;
  
  for (const rep of intelReports) {
    const isNearPath = pathCells.some((cell) => {
      const dist = haversineDistance(cell.latitude, cell.longitude, rep.latitude, rep.longitude);
      return dist <= 2.2;
    });
    if (isNearPath) {
      sumUncertainty += rep.uncertainty;
      matchingReportsCount++;
    }
  }

  // Scale by scenario intelligence confidence
  const rawIntelUncertainty = matchingReportsCount > 0 
    ? sumUncertainty / matchingReportsCount 
    : (1.0 - scenario.intelligence_confidence * 0.8);
    
  const intelUncertainty = Number(
    Math.min(1.0, Math.max(0.08, rawIntelUncertainty * (1.1 - scenario.intelligence_confidence * 0.3))).toFixed(2)
  );

  return {
    distance_km: Number(totalDistanceKm.toFixed(2)),
    estimated_duration_hours: estimatedDurationHours,
    resource_consumption: resourceConsumption,
    terrain_exposure: Math.round(avgTerrainScore),
    weather_exposure: Math.round(weatherExposure),
    land_cover_exposure: Math.round(avgLandCoverFactor * 100),
    intel_uncertainty: intelUncertainty,
    max_environment_cost: Math.round(maxEnvCost),
    average_speed_kmh: Number(effectiveSpeedKmh.toFixed(1)),
  };
}
