"""
TACTIX AI - Synthetic Scenario & Operational Data Generator
Generates synthetic logistics, intelligence reports, operational constraints,
and training dataset for the ML risk experiment.
"""

import os
import json
import random
from datetime import datetime, timedelta

def iso_now_minus(minutes_ago):
    # Simulated reference time: 2026-08-17T09:12:00Z
    base_time = datetime(2026, 8, 17, 9, 12, 0)
    report_time = base_time - timedelta(minutes=minutes_ago)
    return report_time.strftime("%Y-%m-%dT%H:%M:%SZ")

def generate_logistics(n=12, seed=42):
    rng = random.Random(seed)
    out = []
    for i in range(1, n + 1):
        out.append({
            "scenario_id": f"S{i:03d}",
            "name": f"Operational Readiness Profile {i:02d}",
            "personnel_available": rng.randint(40, 120),
            "resource_level": round(rng.uniform(0.40, 0.95), 2),
            "equipment_readiness": round(rng.uniform(0.60, 0.98), 2),
            "supply_level": round(rng.uniform(0.45, 0.92), 2),
            "time_limit": rng.choice([4, 5, 6, 8, 10, 12]),
            "mobility_factor": round(rng.uniform(0.65, 0.95), 2),
        })
    return out

def generate_intelligence(n=16, seed=7):
    rng = random.Random(seed)
    zones = [
        {"id": "ZONE_A", "name": "Sector A (North Corridor)", "lat": 13.0010, "lon": 80.1450},
        {"id": "ZONE_B", "name": "Sector B (River Basin)", "lat": 12.9820, "lon": 80.1650},
        {"id": "ZONE_C", "name": "Sector C (Central Forest)", "lat": 12.9710, "lon": 80.1580},
        {"id": "ZONE_D", "name": "Sector D (South Basin)", "lat": 12.9550, "lon": 80.1850}
    ]
    
    observations = [
        "Simulated civilian logistics convoy moving westbound",
        "Acoustic sensor hit: localized anomalous machinery noise",
        "Overhead imagery: temporary culvert degradation along bridge access",
        "Radio frequency intercept: simulated unit status synchronization",
        "Telemetry sensor ping: off-road route mud accumulation",
        "Simulated unmanned patrol perimeter sweep active"
    ]
    
    out = []
    for i in range(1, n + 1):
        confidence = round(rng.uniform(0.45, 0.95), 2)
        reliability = round(rng.uniform(0.50, 0.95), 2)
        age = rng.randint(5, 240)
        zone_obj = rng.choice(zones)
        uncertainty = round(1.0 - (confidence * reliability), 2)
        
        out.append({
            "report_id": f"INT-{i:03d}",
            "timestamp": iso_now_minus(age),
            "zone": zone_obj["name"],
            "zone_id": zone_obj["id"],
            "latitude": zone_obj["lat"] + rng.uniform(-0.005, 0.005),
            "longitude": zone_obj["lon"] + rng.uniform(-0.005, 0.005),
            "observation_type": rng.choice(observations),
            "confidence": confidence,
            "reliability": reliability,
            "age_minutes": age,
            "uncertainty": uncertainty,
            "source_type": rng.choice(["SIGINT (Synthetic)", "HUMINT (Synthetic)", "IMINT (Synthetic)", "SENSOR (Synthetic)"]),
            "badge": "Simulation Only"
        })
    return out

def generate_constraints():
    return [
        {
            "scenario_id": "S001",
            "time_limit": 6,
            "resource_limit": 0.50,
            "environmental_limit": 0.75,
            "simulation_boundary": "AOI-CHENNAI-SECTOR-01",
            "restricted_zones": [
                {
                    "zone_id": "RESTRICTED_ZONE_1",
                    "name": "Ecological Wetland Sanctuary",
                    "coordinates": [[80.1450, 12.9750], [80.1550, 12.9750], [80.1550, 12.9680], [80.1450, 12.9680], [80.1450, 12.9750]],
                    "reason": "Impassable marsh sanctuary - prohibited entry"
                },
                {
                    "zone_id": "RESTRICTED_ZONE_2",
                    "name": "High Voltage Grid Substation",
                    "coordinates": [[80.1780, 12.9650], [80.1860, 12.9650], [80.1860, 12.9580], [80.1780, 12.9580], [80.1780, 12.9650]],
                    "reason": "Infrastructure safety exclusion zone"
                }
            ]
        }
    ]

def generate_ml_features(n_samples=3000, seed=99):
    rng = random.Random(seed)
    features = []
    
    for _ in range(n_samples):
        terrain_score = round(rng.uniform(5.0, 95.0), 2)
        weather_score = round(rng.choice([10, 30, 55, 70, 90]) + rng.uniform(-4, 4), 2)
        logistics_score = round(rng.uniform(10.0, 85.0), 2)
        intel_uncertainty = round(rng.uniform(5.0, 80.0), 2)
        time_pressure = round(rng.uniform(0.0, 90.0), 2)
        constraint_pressure = round(rng.choice([0, 15, 30, 45, 60, 80]) + rng.uniform(0, 10), 2)
        
        # Deterministic Risk Model Formula
        risk = (
            0.22 * terrain_score +
            0.22 * weather_score +
            0.20 * logistics_score +
            0.18 * intel_uncertainty +
            0.10 * time_pressure +
            0.08 * constraint_pressure
        )
        # Small non-linear interaction effect for realistic ML training
        non_linear_boost = 0.05 * (weather_score * terrain_score) / 100.0
        simulated_risk = round(min(100.0, max(0.0, risk + non_linear_boost)), 2)
        
        features.append({
            "terrain_score": terrain_score,
            "weather_score": weather_score,
            "logistics_score": logistics_score,
            "intelligence_uncertainty": intel_uncertainty,
            "time_pressure": time_pressure,
            "constraint_pressure": constraint_pressure,
            "risk": simulated_risk
        })
    return features

def main():
    os.makedirs("data/logistics", exist_ok=True)
    os.makedirs("data/intelligence", exist_ok=True)
    os.makedirs("data/scenarios", exist_ok=True)
    os.makedirs("ml", exist_ok=True)
    
    logistics = generate_logistics()
    with open("data/logistics/logistics.json", "w") as f:
        json.dump(logistics, f, indent=2)
    print(f"[OK] Generated {len(logistics)} synthetic logistics profiles")
    
    intel = generate_intelligence()
    with open("data/intelligence/intelligence.json", "w") as f:
        json.dump(intel, f, indent=2)
    print(f"[OK] Generated {len(intel)} synthetic intelligence reports")
    
    constraints = generate_constraints()
    with open("data/scenarios/constraints.json", "w") as f:
        json.dump(constraints, f, indent=2)
    print(f"[OK] Generated operational constraints")
    
    # Preset scenarios for instant demonstration
    scenarios = [
        {
            "scenario_id": "SIM-0001",
            "name": "Alpha-Prime Monsoon Transit",
            "description": "Rapid logistics transit through northern corridor during heavy precipitation and strict 5-hour cutoff.",
            "weather_condition": "HEAVY_RAIN",
            "resource_level": 0.55,
            "personnel": 80,
            "time_limit": 5,
            "intelligence_confidence": 0.62,
            "terrain_preference": "AVOID_WATER",
            "start": {"row": 2, "col": 2, "lat": 13.006, "lon": 80.134, "label": "Point Echo (Northwest Depot)"},
            "goal": {"row": 27, "col": 32, "lat": 12.954, "lon": 80.194, "label": "Point Sierra (Southeast Staging Area)"}
        },
        {
            "scenario_id": "SIM-0002",
            "name": "Bravo Resource Conservation Patrol",
            "description": "Standard reconnaissance with tight resource limitations requiring optimal fuel efficiency and low roughness exposure.",
            "weather_condition": "LIGHT_RAIN",
            "resource_level": 0.40,
            "personnel": 60,
            "time_limit": 8,
            "intelligence_confidence": 0.85,
            "terrain_preference": "AVOID_DIFFICULT",
            "start": {"row": 4, "col": 5, "lat": 13.002, "lon": 80.140, "label": "Point Echo (Northwest Depot)"},
            "goal": {"row": 26, "col": 30, "lat": 12.956, "lon": 80.190, "label": "Point Sierra (Southeast Staging Area)"}
        },
        {
            "scenario_id": "SIM-0003",
            "name": "Charlie High Wind Emergency Sweep",
            "description": "High wind gale with elevated intelligence uncertainty and restrictive corridor bounds.",
            "weather_condition": "HIGH_WIND",
            "resource_level": 0.75,
            "personnel": 100,
            "time_limit": 6,
            "intelligence_confidence": 0.48,
            "terrain_preference": "ANY",
            "start": {"row": 3, "col": 3, "lat": 13.004, "lon": 80.136, "label": "Point Echo (Northwest Depot)"},
            "goal": {"row": 28, "col": 31, "lat": 12.952, "lon": 80.192, "label": "Point Sierra (Southeast Staging Area)"}
        }
    ]
    with open("data/scenarios/scenarios.json", "w") as f:
        json.dump(scenarios, f, indent=2)
    print(f"[OK] Generated {len(scenarios)} baseline scenarios")
    
    ml_features = generate_ml_features(3000)
    with open("ml/scenario_features.json", "w") as f:
        json.dump(ml_features, f, indent=2)
    print(f"[OK] Generated {len(ml_features)} ML feature rows in ml/scenario_features.json")

if __name__ == "__main__":
    main()
