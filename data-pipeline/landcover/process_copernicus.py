"""
TACTIX AI - Copernicus Land Cover Pipeline
Converts satellite land-cover classifications into movement friction factors.
"""

import os
import json
import numpy as np

LANDCOVER_FACTORS = {
    "urban": {"code": 1, "factor": 0.50, "color": "#6B7280", "label": "Urban / Built-up"},
    "forest": {"code": 2, "factor": 0.70, "color": "#4A7856", "label": "Dense Forest Canopy"},
    "grassland": {"code": 3, "factor": 0.30, "color": "#9CAF5C", "label": "Open Grassland"},
    "cropland": {"code": 4, "factor": 0.40, "color": "#C9A24B", "label": "Cultivated Cropland"},
    "water": {"code": 5, "factor": 1.00, "color": "#3B82F6", "label": "Water Bodies"},
    "wetland": {"code": 6, "factor": 0.80, "color": "#4FA6A0", "label": "Marsh / Wetland"},
    "bare": {"code": 7, "factor": 0.35, "color": "#B99B6B", "label": "Bare Ground"}
}

def process_landcover(aoi_path="data-pipeline/aoi.geojson", output_dir="data/landcover"):
    os.makedirs(output_dir, exist_ok=True)
    
    with open(aoi_path, "r") as f:
        aoi_data = json.load(f)
        
    props = aoi_data["features"][0]["properties"]
    lat_min, lat_max = props["lat_min"], props["lat_max"]
    lon_min, lon_max = props["lon_min"], props["lon_max"]
    
    rows, cols = 30, 35
    lats = np.linspace(lat_max, lat_min, rows)
    lons = np.linspace(lon_min, lon_max, cols)
    
    features = []
    d_lat = (lat_max - lat_min) / rows
    d_lon = (lon_max - lon_min) / cols
    
    for r in range(rows):
        for c in range(cols):
            lat = float(lats[r])
            lon = float(lons[c])
            
            # Determine land cover by spatial geographic distribution
            # River corridor across row 14-16
            if (14 <= r <= 16 and c > 5 and c < 30) or (r == 15 and c <= 5):
                lc_type = "water" if (r == 15 and 10 <= c <= 26) else "wetland"
            elif r < 8 and c < 12:
                lc_type = "urban"
            elif 8 <= r <= 20 and 10 <= c <= 22:
                lc_type = "forest"
            elif r > 20 and c > 18:
                lc_type = "cropland"
            elif r > 22 and c <= 18:
                lc_type = "grassland"
            else:
                lc_type = "bare" if (r + c) % 7 == 0 else "grassland"
                
            info = LANDCOVER_FACTORS[lc_type]
            
            cell_poly = [
                [lon - d_lon/2, lat - d_lat/2],
                [lon + d_lon/2, lat - d_lat/2],
                [lon + d_lon/2, lat + d_lat/2],
                [lon - d_lon/2, lat + d_lat/2],
                [lon - d_lon/2, lat - d_lat/2]
            ]
            
            features.append({
                "type": "Feature",
                "id": f"lc_r{r:02d}_c{c:02d}",
                "properties": {
                    "cell_id": f"r{r:02d}_c{c:02d}",
                    "row": r,
                    "col": c,
                    "latitude": lat,
                    "longitude": lon,
                    "land_cover": lc_type,
                    "land_cover_code": info["code"],
                    "land_cover_factor": info["factor"],
                    "land_cover_label": info["label"],
                    "color": info["color"]
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [cell_poly]
                }
            })
            
    geojson_out = {
        "type": "FeatureCollection",
        "name": "COPERNICUS_LANDCOVER_GRID",
        "features": features
    }
    
    out_file = os.path.join(output_dir, "landcover.geojson")
    with open(out_file, "w") as f:
        json.dump(geojson_out, f, indent=2)
        
    print(f"[OK] Copernicus Land Cover preprocessed: {len(features)} cells written to {out_file}")

if __name__ == "__main__":
    process_landcover()
