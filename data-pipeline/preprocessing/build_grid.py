"""
TACTIX AI - Unified Environment Model Grid Builder
Merges terrain, land cover, OSM features, and baseline weather into a single indexed grid record.
"""

import os
import json
import math

def distance_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def build_grid():
    # Load terrain
    with open("data/terrain/terrain.geojson", "r") as f:
        terrain_data = json.load(f)
    
    # Load landcover
    with open("data/landcover/landcover.geojson", "r") as f:
        landcover_data = json.load(f)
        
    # Load OSM roads and waterways
    with open("data/osm/roads.geojson", "r") as f:
        roads_data = json.load(f)
    with open("data/osm/waterways.geojson", "r") as f:
        water_data = json.load(f)
        
    # Load weather
    with open("data/weather/weather.json", "r") as f:
        weather_list = json.load(f)
    default_weather = weather_list[0]
    
    lc_map = {feat["properties"]["cell_id"]: feat["properties"] for feat in landcover_data["features"]}
    
    # Collect road and water coordinates for proximity calculations
    road_pts = []
    for f in roads_data["features"]:
        coords = f["geometry"]["coordinates"]
        for pt in coords:
            road_pts.append((pt[1], pt[0])) # lat, lon
            
    water_pts = []
    for f in water_data["features"]:
        coords = f["geometry"]["coordinates"]
        for pt in coords:
            water_pts.append((pt[1], pt[0])) # lat, lon
            
    grid = {}
    cells_list = []
    
    for feat in terrain_data["features"]:
        cid = feat["properties"]["cell_id"]
        t_props = feat["properties"]
        lat = t_props["latitude"]
        lon = t_props["longitude"]
        
        lc_props = lc_map.get(cid, {
            "land_cover": "grassland",
            "land_cover_factor": 0.30,
            "land_cover_code": 3
        })
        
        # Calculate road accessibility (0 - 1, closer = higher)
        min_road_dist = min([distance_km(lat, lon, rlat, rlon) for rlat, rlon in road_pts]) if road_pts else 1.0
        road_accessibility = round(max(0.0, min(1.0, math.exp(-min_road_dist / 0.8))), 3)
        
        # Calculate water proximity (0 - 1, closer = higher)
        min_water_dist = min([distance_km(lat, lon, wlat, wlon) for wlat, wlon in water_pts]) if water_pts else 1.0
        water_proximity = round(max(0.0, min(1.0, math.exp(-min_water_dist / 0.5))), 3)
        
        cell_rec = {
            "cell_id": cid,
            "row": t_props["row"],
            "col": t_props["col"],
            "latitude": lat,
            "longitude": lon,
            "elevation": t_props["elevation"],
            "slope": t_props["slope"],
            "aspect": t_props["aspect"],
            "roughness": t_props["roughness"],
            "terrain_score": t_props["terrain_score"],
            "land_cover": lc_props["land_cover"],
            "land_cover_factor": lc_props["land_cover_factor"],
            "weather": {
                "condition": default_weather["condition"],
                "impact_score": default_weather["impact_score"]
            },
            "road_accessibility": road_accessibility,
            "water_proximity": water_proximity
        }
        
        grid[cid] = cell_rec
        cells_list.append(cell_rec)
        
    out_dir = "data/terrain"
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "grid.json"), "w") as f:
        json.dump(grid, f, indent=2)
        
    print(f"[OK] Merged {len(cells_list)} environment grid records to data/terrain/grid.json")

if __name__ == "__main__":
    build_grid()
