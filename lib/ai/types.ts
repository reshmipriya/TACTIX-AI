import { z } from "zod";
import { WeatherCondition } from "../environment/types";

export const MissionParamsSchema = z.object({
  weather: z.enum(["NORMAL", "LIGHT_RAIN", "HIGH_WIND", "HEAVY_RAIN", "POOR_CONDITIONS"]),
  resource_level: z.number().min(0.1).max(1.0),
  time_limit: z.number().int().min(1).max(48),
  terrain_preference: z.enum(["ANY", "AVOID_DIFFICULT", "AVOID_WATER"]),
  extracted_summary: z.string().optional(),
});

export type MissionParams = z.infer<typeof MissionParamsSchema>;

export const DEFAULT_MISSION_PARAMS: MissionParams = {
  weather: "HEAVY_RAIN",
  resource_level: 0.55,
  time_limit: 5,
  terrain_preference: "AVOID_WATER",
  extracted_summary: "Simulated heavy precipitation corridor transit under 5h limit with 55% resources.",
};

export type AnalysisMode = 
  | "compare" 
  | "explain_risk" 
  | "explain_uncertainty" 
  | "what_changed" 
  | "summarize";

export interface Citation {
  coa?: "Alpha" | "Bravo" | "Charlie";
  factor?: "terrain" | "weather" | "logistics" | "intelligence" | "time" | "constraints";
  value?: string | number;
  highlightText: string;
}

export interface AIAnalysisResponse {
  text: string;
  citations: Citation[];
  mode: AnalysisMode;
  isFallback?: boolean;
}

export interface AIRouteError {
  error: "invalid_ai_output" | "upstream_timeout" | "upstream_error";
  fallback: unknown;
}
