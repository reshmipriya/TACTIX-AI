import { EnvCell, EnvGrid, WeatherScenario } from "./types";
import gridJson from "@/data/terrain/grid.json";
import weatherJson from "@/data/weather/weather.json";

export const DEFAULT_WEATHER_LIST = weatherJson as WeatherScenario[];
export const DEFAULT_GRID = gridJson as unknown as EnvGrid;

/**
 * Builds or clones an environment grid dynamically updated with a specific active weather scenario.
 */
export function buildEnvironmentGrid(
  baseGrid: EnvGrid = DEFAULT_GRID,
  activeWeather: WeatherScenario = DEFAULT_WEATHER_LIST[0]
): EnvGrid {
  const updatedGrid: EnvGrid = {};
  for (const [cellId, cell] of Object.entries(baseGrid)) {
    updatedGrid[cellId] = {
      ...cell,
      weather: {
        condition: activeWeather.condition,
        impact_score: activeWeather.impact_score,
      },
    };
  }
  return updatedGrid;
}

/**
 * Finds the nearest cell ID for given latitude and longitude.
 */
export function findNearestCell(
  grid: EnvGrid, 
  lat: number, 
  lon: number
): EnvCell | null {
  let bestCell: EnvCell | null = null;
  let minDistance = Infinity;

  for (const cell of Object.values(grid)) {
    const d = Math.hypot(cell.latitude - lat, cell.longitude - lon);
    if (d < minDistance) {
      minDistance = d;
      bestCell = cell;
    }
  }

  return bestCell;
}
