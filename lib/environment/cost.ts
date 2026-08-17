import { EnvCell, WeatherScenario } from "./types";

export const ENV_WEIGHTS = {
  terrain: 0.35,
  landcover: 0.25,
  weather: 0.25,
  accessibility: 0.15,
} as const;

/**
 * Computes single-cell environment cost (0 - 100) combining
 * terrain difficulty, land cover friction, active weather impact, and road accessibility.
 */
export function environmentCost(
  cell: EnvCell, 
  weather: WeatherScenario | { impact_score: number; condition?: string }
): number {
  const terrain = cell.terrain_score;
  const landcover = cell.land_cover_factor * 100;
  const w = weather.impact_score;
  const access = (1 - cell.road_accessibility) * 100;
  
  return (
    ENV_WEIGHTS.terrain * terrain +
    ENV_WEIGHTS.landcover * landcover +
    ENV_WEIGHTS.weather * w +
    ENV_WEIGHTS.accessibility * access
  );
}

/**
 * Calculates Great-Circle distance in kilometers between two lat/lon coordinates.
 */
export function haversineDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371.0; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
