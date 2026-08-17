export interface RiskContributions {
  terrain: number;
  weather: number;
  logistics: number;
  intelligence: number;
  time: number;
  constraints: number;
}

export interface RiskResult {
  overall: number; // 0 - 100
  contributions: RiskContributions;
  riskBand: "LOW" | "MEDIUM" | "HIGH";
  riskColor: string;
}

export interface MLPredictionResult {
  predicted_risk: number;
  deterministic_risk: number;
  variance: number;
  model: string;
}
