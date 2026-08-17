export type ConstraintStatus = "VALID" | "WARNING" | "INVALID";

export interface Violation {
  rule: string;
  detail: string;
  severity: "critical" | "warning";
}

export interface ConstraintResult {
  status: ConstraintStatus;
  violations: Violation[];
  warnings: Violation[];
}

export interface RestrictedZone {
  zone_id: string;
  name: string;
  coordinates: [number, number][]; // [lon, lat] pairs
  reason: string;
}

export interface OperationalConstraints {
  time_limit: number;            // hours
  resource_limit: number;        // max percentage (0 - 1.0)
  environmental_limit: number;   // max environmental cost threshold (0 - 100)
  simulation_boundary?: string;
  restricted_zones: RestrictedZone[];
}
