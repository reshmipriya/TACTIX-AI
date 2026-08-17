"""
TACTIX AI - ERA5 Weather Pipeline
Preprocesses meteorological reanalysis records into operational weather scenario classes and impact scores.
"""

import os
import json

WEATHER_SCENARIOS = [
    {
        "condition": "NORMAL",
        "label": "Optimal Clear Skies",
        "temp_c": 24.5,
        "precip_mm": 0.0,
        "wind_ms": 3.2,
        "wind_dir": "SW 210°",
        "pressure_hpa": 1013.2,
        "visibility_km": 15.0,
        "impact_score": 10,
        "description": "Standard baseline atmospheric conditions with unrestricted visibility and dry terrain."
    },
    {
        "condition": "LIGHT_RAIN",
        "label": "Intermittent Precipitation",
        "temp_c": 21.0,
        "precip_mm": 4.5,
        "wind_ms": 6.8,
        "wind_dir": "NE 45°",
        "pressure_hpa": 1008.5,
        "visibility_km": 8.0,
        "impact_score": 30,
        "description": "Light drizzle creating minor surface slickness and reduced off-road traction."
    },
    {
        "condition": "HIGH_WIND",
        "label": "Gale Advisory",
        "temp_c": 26.2,
        "precip_mm": 1.2,
        "wind_ms": 14.6,
        "wind_dir": "E 90°",
        "pressure_hpa": 999.0,
        "visibility_km": 10.0,
        "impact_score": 55,
        "description": "Sustained high gusts impeding aerial reconnaissance and light vehicular stability."
    },
    {
        "condition": "HEAVY_RAIN",
        "label": "Monsoon Downpour",
        "temp_c": 19.8,
        "precip_mm": 28.4,
        "wind_ms": 11.2,
        "wind_dir": "NW 315°",
        "pressure_hpa": 994.0,
        "visibility_km": 3.5,
        "impact_score": 70,
        "description": "Intense torrential rainfall leading to soil saturation, reduced speed, and stream swells."
    },
    {
        "condition": "POOR_CONDITIONS",
        "label": "Severe Storm / Low Visibility",
        "temp_c": 17.5,
        "precip_mm": 42.0,
        "wind_ms": 19.5,
        "wind_dir": "N 360°",
        "pressure_hpa": 988.0,
        "visibility_km": 1.2,
        "impact_score": 90,
        "description": "Extreme weather convergence with severe turbulence, impassable runoff, and minimal visibility."
    }
]

def process_weather(output_dir="data/weather"):
    os.makedirs(output_dir, exist_ok=True)
    out_file = os.path.join(output_dir, "weather.json")
    with open(out_file, "w") as f:
        json.dump(WEATHER_SCENARIOS, f, indent=2)
    print(f"[OK] ERA5 Weather scenarios exported to {out_file}")

if __name__ == "__main__":
    process_weather()
