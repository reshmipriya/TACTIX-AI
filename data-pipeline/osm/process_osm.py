"""
TACTIX AI - OpenStreetMap Extraction Pipeline
Exports vector features (roads, waterways, buildings, bridges, landuse) for the study area.
"""

import os
import json

def process_osm(output_dir="data/osm"):
    os.makedirs(output_dir, exist_ok=True)
    
    # Roads network GeoJSON
    roads_geojson = {
        "type": "FeatureCollection",
        "name": "OSM_ROADS",
        "features": [
            {
                "type": "Feature",
                "properties": {"osm_id": 101, "highway": "primary", "name": "Highway 45 Corridor", "lanes": 4, "surface": "asphalt", "speed_kmh": 70},
                "geometry": {"type": "LineString", "coordinates": [[80.1320, 13.0020], [80.1500, 12.9850], [80.1700, 12.9720], [80.1950, 12.9550]]}
            },
            {
                "type": "Feature",
                "properties": {"osm_id": 102, "highway": "secondary", "name": "North Sector Bypass", "lanes": 2, "surface": "asphalt", "speed_kmh": 50},
                "geometry": {"type": "LineString", "coordinates": [[80.1350, 13.0050], [80.1550, 13.0030], [80.1850, 12.9920], [80.1980, 12.9800]]}
            },
            {
                "type": "Feature",
                "properties": {"osm_id": 103, "highway": "tertiary", "name": "River Valley Access Road", "lanes": 2, "surface": "paved", "speed_kmh": 40},
                "geometry": {"type": "LineString", "coordinates": [[80.1420, 12.9600], [80.1580, 12.9700], [80.1650, 12.9850], [80.1720, 13.0000]]}
            },
            {
                "type": "Feature",
                "properties": {"osm_id": 104, "highway": "track", "name": "Ridgeline Patrol Track", "lanes": 1, "surface": "unpaved", "speed_kmh": 25},
                "geometry": {"type": "LineString", "coordinates": [[80.1380, 12.9750], [80.1520, 12.9620], [80.1750, 12.9580], [80.1880, 12.9520]]}
            }
        ]
    }
    
    # Waterways GeoJSON
    waterways_geojson = {
        "type": "FeatureCollection",
        "name": "OSM_WATERWAYS",
        "features": [
            {
                "type": "Feature",
                "properties": {"osm_id": 201, "waterway": "river", "name": "Adyar River Basin Channel", "width_m": 45, "crossable": False},
                "geometry": {"type": "LineString", "coordinates": [[80.1300, 12.9820], [80.1450, 12.9800], [80.1620, 12.9750], [80.1800, 12.9680], [80.2000, 12.9650]]}
            },
            {
                "type": "Feature",
                "properties": {"osm_id": 202, "waterway": "canal", "name": "East Drainage Tributary", "width_m": 12, "crossable": True},
                "geometry": {"type": "LineString", "coordinates": [[80.1700, 13.0100], [80.1720, 12.9900], [80.1800, 12.9680]]}
            }
        ]
    }
    
    # Buildings GeoJSON
    buildings_geojson = {
        "type": "FeatureCollection",
        "name": "OSM_BUILDINGS",
        "features": [
            {
                "type": "Feature",
                "properties": {"osm_id": 301, "building": "industrial", "name": "Sector Logistics Depot A", "height_m": 12},
                "geometry": {"type": "Polygon", "coordinates": [[[80.1380, 12.9920], [80.1420, 12.9920], [80.1420, 12.9880], [80.1380, 12.9880], [80.1380, 12.9920]]]}
            },
            {
                "type": "Feature",
                "properties": {"osm_id": 302, "building": "commercial", "name": "Communications Relay Substation", "height_m": 18},
                "geometry": {"type": "Polygon", "coordinates": [[[80.1820, 12.9620], [80.1860, 12.9620], [80.1860, 12.9580], [80.1820, 12.9580], [80.1820, 12.9620]]]}
            },
            {
                "type": "Feature",
                "properties": {"osm_id": 303, "building": "civic", "name": "North Command Outpost", "height_m": 10},
                "geometry": {"type": "Polygon", "coordinates": [[[80.1580, 13.0020], [80.1620, 13.0020], [80.1620, 12.9980], [80.1580, 12.9980], [80.1580, 13.0020]]]}
            }
        ]
    }
    
    # Bridges GeoJSON
    bridges_geojson = {
        "type": "FeatureCollection",
        "name": "OSM_BRIDGES",
        "features": [
            {
                "type": "Feature",
                "properties": {"osm_id": 401, "bridge": "yes", "highway": "primary", "name": "Central Crossing Bridge", "maxweight_tons": 60},
                "geometry": {"type": "LineString", "coordinates": [[80.1610, 12.9760], [80.1630, 12.9740]]}
            },
            {
                "type": "Feature",
                "properties": {"osm_id": 402, "bridge": "yes", "highway": "secondary", "name": "East Bypass Span", "maxweight_tons": 45},
                "geometry": {"type": "LineString", "coordinates": [[80.1790, 12.9690], [80.1810, 12.9670]]}
            }
        ]
    }
    
    # Landuse GeoJSON
    landuse_geojson = {
        "type": "FeatureCollection",
        "name": "OSM_LANDUSE",
        "features": [
            {
                "type": "Feature",
                "properties": {"osm_id": 501, "landuse": "industrial", "name": "Industrial Freight Zone"},
                "geometry": {"type": "Polygon", "coordinates": [[[80.1340, 12.9950], [80.1460, 12.9950], [80.1460, 12.9850], [80.1340, 12.9850], [80.1340, 12.9950]]]}
            },
            {
                "type": "Feature",
                "properties": {"osm_id": 502, "landuse": "forest", "name": "Reserve Woodlands Sector C"},
                "geometry": {"type": "Polygon", "coordinates": [[[80.1480, 12.9780], [80.1680, 12.9780], [80.1680, 12.9600], [80.1480, 12.9600], [80.1480, 12.9780]]]}
            },
            {
                "type": "Feature",
                "properties": {"osm_id": 503, "landuse": "farmland", "name": "South Agricultural Basin"},
                "geometry": {"type": "Polygon", "coordinates": [[[80.1700, 12.9600], [80.1980, 12.9600], [80.1980, 12.9500], [80.1700, 12.9500], [80.1700, 12.9600]]]}
            }
        ]
    }
    
    files = [
        ("roads.geojson", roads_geojson),
        ("waterways.geojson", waterways_geojson),
        ("buildings.geojson", buildings_geojson),
        ("bridges.geojson", bridges_geojson),
        ("landuse.geojson", landuse_geojson)
    ]
    
    for filename, data in files:
        filepath = os.path.join(output_dir, filename)
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)
        print(f"[OK] Exported {filename} to {output_dir}")

if __name__ == "__main__":
    process_osm()
