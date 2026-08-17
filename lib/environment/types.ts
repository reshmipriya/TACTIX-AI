export type WeatherCondition = 
  | "NORMAL" 
  | "LIGHT_RAIN" 
  | "HIGH_WIND" 
  | "HEAVY_RAIN" 
  | "POOR_CONDITIONS";

export interface WeatherScenario {
  condition: WeatherCondition;
  label: string;
  temp_c: number;
  precip_mm: number;
  wind_ms: number;
  wind_dir: string;
  pressure_hpa: number;
  visibility_km: number;
  impact_score: number;
  description: string;
}

export type LandCoverType = 
  | "urban" 
  | "forest" 
  | "grassland" 
  | "cropland" 
  | "water" 
  | "wetland" 
  | "bare";

export interface EnvCell {
  cell_id: string;
  row: number;
  col: number;
  latitude: number;
  longitude: number;
  elevation: number;
  slope: number;
  aspect: number;
  roughness: number;
  terrain_score: number;
  land_cover: LandCoverType;
  land_cover_factor: number;
  weather: {
    condition: WeatherCondition;
    impact_score: number;
  };
  road_accessibility: number; // 0 to 1, higher is closer/easier access
  water_proximity: number;    // 0 to 1, higher is closer to water
}

export type EnvGrid = Record<string, EnvCell>;
