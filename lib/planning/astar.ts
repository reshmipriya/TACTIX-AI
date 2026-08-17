import { EnvCell, EnvGrid, WeatherScenario } from "../environment/types";
import { environmentCost, haversineDistance } from "../environment/cost";
import { MinHeap } from "./heap";
import { CellId, Objective, PathResult } from "./types";

export class NoValidPathError extends Error {
  constructor(start: string, goal: string) {
    super(`No valid path could be found between start (${start}) and goal (${goal})`);
    this.name = "NoValidPathError";
  }
}

/**
 * Returns valid 8-way adjacent neighboring cells in the grid.
 */
function getNeighbors(grid: EnvGrid, cell: EnvCell): EnvCell[] {
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1], // Cardinal
    [-1, -1], [-1, 1], [1, -1], [1, 1]  // Diagonal
  ];
  
  const neighbors: EnvCell[] = [];
  for (const [dr, dc] of directions) {
    const neighborId = `r${String(cell.row + dr).padStart(2, "0")}_c${String(cell.col + dc).padStart(2, "0")}`;
    const neighbor = grid[neighborId];
    if (neighbor) {
      // Exclude impassable open water bodies unless bridged
      if (neighbor.land_cover === "water" && neighbor.road_accessibility < 0.3) {
        continue;
      }
      neighbors.push(neighbor);
    }
  }
  return neighbors;
}

/**
 * Great-circle heuristic distance (in km) to goal.
 */
function heuristic(a: EnvCell, b: EnvCell): number {
  return haversineDistance(a.latitude, a.longitude, b.latitude, b.longitude);
}

/**
 * Resource burn calculation along an edge (combining distance, slope uphill penalty, and road roughness).
 */
export function resourceBurnEdge(fromCell: EnvCell, toCell: EnvCell): number {
  const dist = haversineDistance(fromCell.latitude, fromCell.longitude, toCell.latitude, toCell.longitude);
  const slopeDelta = Math.max(0, toCell.elevation - fromCell.elevation);
  const elevationFactor = 1.0 + (slopeDelta / 20.0);
  const roadBonus = 1.0 - (toCell.road_accessibility * 0.4); // Roads burn 40% less fuel
  return dist * elevationFactor * roadBonus;
}

/**
 * A* Pathfinding implementation.
 */
export function aStar(
  grid: EnvGrid,
  startId: CellId,
  goalId: CellId,
  objective: Objective,
  weather: WeatherScenario
): PathResult {
  const startCell = grid[startId];
  const goalCell = grid[goalId];

  if (!startCell || !goalCell) {
    throw new NoValidPathError(startId, goalId);
  }

  const open = new MinHeap<CellId>();
  const gScore = new Map<CellId, number>([[startId, 0]]);
  const cameFrom = new Map<CellId, CellId>();
  
  open.push(startId, heuristic(startCell, goalCell));

  while (!open.isEmpty()) {
    const currentId = open.pop()!;
    if (currentId === goalId) {
      // Reconstruct path
      const pathIds: CellId[] = [goalId];
      let curr = goalId;
      while (cameFrom.has(curr)) {
        curr = cameFrom.get(curr)!;
        pathIds.unshift(curr);
      }
      const cells = pathIds.map((id) => grid[id]);
      const totalCost = gScore.get(goalId) ?? 0;
      return { cellIds: pathIds, cells, totalCost };
    }

    const currentCell = grid[currentId];
    if (!currentCell) continue;

    for (const neighbor of getNeighbors(grid, currentCell)) {
      const neighborId = neighbor.cell_id;
      const stepCost = objective.edgeCost(grid, currentCell, neighbor, weather);
      const tentative = (gScore.get(currentId) ?? 0) + stepCost;

      if (tentative < (gScore.get(neighborId) ?? Infinity)) {
        cameFrom.set(neighborId, currentId);
        gScore.set(neighborId, tentative);
        open.push(neighborId, tentative + heuristic(neighbor, goalCell));
      }
    }
  }

  throw new NoValidPathError(startId, goalId);
}
