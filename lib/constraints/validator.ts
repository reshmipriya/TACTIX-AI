import { EnvCell } from "../environment/types";
import { ConstraintResult, OperationalConstraints, Violation } from "./types";

/**
 * Checks if a coordinate [lon, lat] is inside a polygon using ray casting.
 */
function isPointInPolygon(point: [number, number], vs: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) &&
        (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Validates a Course of Action path and metrics against operational scenario constraints.
 */
export function validateConstraints(
  coaData: {
    pathCells: EnvCell[];
    estimatedDuration: number;
    resourceConsumption: number; // 0 - 1.0 (e.g. 0.52 for 52%)
    maxEnvCost?: number;
  },
  constraints: OperationalConstraints
): ConstraintResult {
  const violations: Violation[] = [];
  const warnings: Violation[] = [];

  // 1. Time Limit Constraint
  if (coaData.estimatedDuration > constraints.time_limit) {
    violations.push({
      rule: "time_limit",
      detail: `Estimated duration ${coaData.estimatedDuration.toFixed(1)}h exceeds scenario limit ${constraints.time_limit}h`,
      severity: "critical"
    });
  } else if (coaData.estimatedDuration > constraints.time_limit * 0.9) {
    warnings.push({
      rule: "time_limit_near",
      detail: `Duration ${coaData.estimatedDuration.toFixed(1)}h is near upper limit (${constraints.time_limit}h)`,
      severity: "warning"
    });
  }

  // 2. Resource Limit Constraint
  if (coaData.resourceConsumption > constraints.resource_limit) {
    violations.push({
      rule: "resource_limit",
      detail: `Resource burn ${(coaData.resourceConsumption * 100).toFixed(0)}% exceeds available capacity ${(constraints.resource_limit * 100).toFixed(0)}%`,
      severity: "critical"
    });
  } else if (coaData.resourceConsumption > constraints.resource_limit * 0.88) {
    warnings.push({
      rule: "resource_limit_near",
      detail: `Resource burn ${(coaData.resourceConsumption * 100).toFixed(0)}% is close to threshold ${(constraints.resource_limit * 100).toFixed(0)}%`,
      severity: "warning"
    });
  }

  // 3. Restricted Zone Intersections
  if (constraints.restricted_zones && constraints.restricted_zones.length > 0) {
    for (const zone of constraints.restricted_zones) {
      const intersected = coaData.pathCells.some((cell) =>
        isPointInPolygon([cell.longitude, cell.latitude], zone.coordinates)
      );
      if (intersected) {
        violations.push({
          rule: "restricted_zone",
          detail: `Route intersects restricted corridor: ${zone.name} (${zone.reason})`,
          severity: "critical"
        });
      }
    }
  }

  // 4. Study Area Boundary
  const latMin = 12.945, latMax = 13.015, lonMin = 80.125, lonMax = 80.205;
  const outOfBounds = coaData.pathCells.some(
    (cell) => cell.latitude < latMin || cell.latitude > latMax || cell.longitude < lonMin || cell.longitude > lonMax
  );
  if (outOfBounds) {
    violations.push({
      rule: "scenario_boundary",
      detail: "Route points step outside authorized simulation AOI polygon",
      severity: "critical"
    });
  }

  const status = violations.length > 0 ? "INVALID" : warnings.length > 0 ? "WARNING" : "VALID";
  return { status, violations, warnings };
}
