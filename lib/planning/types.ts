import { EnvCell, EnvGrid, WeatherScenario } from "../environment/types";

export type CellId = string;

export interface PathResult {
  cellIds: CellId[];
  cells: EnvCell[];
  totalCost: number;
}

export interface Objective {
  name: string;
  description: string;
  edgeCost: (
    grid: EnvGrid,
    fromCell: EnvCell,
    toCell: EnvCell,
    weather: WeatherScenario
  ) => number;
}

export type COAName = "Alpha" | "Bravo" | "Charlie";
