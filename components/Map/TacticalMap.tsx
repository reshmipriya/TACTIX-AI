"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { 
  Layers, 
  Eye, 
  EyeOff, 
  MapPin, 
  ShieldAlert, 
  Info, 
  Compass, 
  Maximize2,
  Navigation,
  SlidersHorizontal,
  X,
  ChevronDown
} from "lucide-react";
import { EnvCell, WeatherScenario } from "@/lib/environment/types";
import { COA, IntelReport, MissionScenario } from "@/lib/simulation/types";
import { OperationalConstraints } from "@/lib/constraints/types";
import { environmentCost } from "@/lib/environment/cost";

interface TacticalMapProps {
  scenario: MissionScenario;
  weather: WeatherScenario;
  coas: COA[];
  intelReports: IntelReport[];
  constraints: OperationalConstraints;
  selectedCOA?: COA;
  onSelectCOA?: (coa: COA) => void;
  isAdvancedMode?: boolean;
}

export function TacticalMap({
  scenario,
  weather,
  coas,
  intelReports,
  constraints,
  selectedCOA,
  onSelectCOA,
  isAdvancedMode = false,
}: TacticalMapProps) {
  // Simplified Default Map Layers (Section 11): Default = Options + Roads + Water
  const [layers, setLayers] = useState({
    // Environment
    terrain: false,
    elevation: false,
    landcover: false,
    weatherOverlay: false,
    // Infrastructure
    roads: true,
    waterways: true,
    // Simulation
    coaAlpha: true,
    coaBravo: true,
    coaCharlie: true,
    // Advanced
    intelligence: false,
    constraints: false,
  });

  const [isLayerDrawerOpen, setIsLayerDrawerOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<EnvCell | null>(null);
  const [selectedIntel, setSelectedIntel] = useState<IntelReport | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // AOI Bounds
  const latMin = 12.9500, latMax = 13.0100;
  const lonMin = 80.1300, lonMax = 80.2000;
  const rows = 30, cols = 35;

  const project = (lat: number, lon: number, width: number, height: number) => {
    const x = ((lon - lonMin) / (lonMax - lonMin)) * width;
    const y = ((latMax - lat) / (latMax - latMin)) * height;
    return { x, y };
  };

  const gridCells = useMemo(() => {
    const cells: EnvCell[] = [];
    const dLat = (latMax - latMin) / rows;
    const dLon = (lonMax - lonMin) / cols;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lat = latMax - (r + 0.5) * dLat;
        const lon = lonMin + (c + 0.5) * dLon;

        const xNorm = (c / cols) * 3;
        const yNorm = (r / rows) * 3;
        const elev = 15.0 + 35.0 * Math.sin(xNorm * 1.5) * Math.cos(yNorm * 1.2) + 20.0 * Math.exp(-((xNorm - 1.5) ** 2 + (yNorm - 1.2) ** 2) / 0.5);
        const slope = Math.abs(Math.cos(xNorm * 1.5) * 12.0) + Math.abs(Math.sin(yNorm * 1.2) * 8.0);
        const roughness = (slope / 2.0) + 1.2;
        const terrainScore = Math.min(100, Math.max(5, (slope * 2.5) + (roughness * 4.0)));

        let landCover: EnvCell["land_cover"] = "grassland";
        let factor = 0.30;
        if ((r >= 14 && r <= 16 && c > 5 && c < 30) || (r === 15 && c <= 5)) {
          if (r === 15 && c >= 10 && c <= 26) {
            landCover = "water";
            factor = 1.0;
          } else {
            landCover = "wetland";
            factor = 0.8;
          }
        } else if (r < 8 && c < 12) {
          landCover = "urban";
          factor = 0.5;
        } else if (r >= 8 && r <= 20 && c >= 10 && c <= 22) {
          landCover = "forest";
          factor = 0.7;
        } else if (r > 20 && c > 18) {
          landCover = "cropland";
          factor = 0.4;
        }

        const distToCenterRoad = Math.hypot(xNorm - yNorm, 0.5);
        const roadAccess = Math.max(0.1, Math.min(1.0, 1.0 - distToCenterRoad * 0.4));
        const waterProx = landCover === "water" || landCover === "wetland" ? 0.9 : Math.max(0, 0.8 - Math.abs(r - 15) * 0.1);

        cells.push({
          cell_id: `r${String(r).padStart(2, "0")}_c${String(c).padStart(2, "0")}`,
          row: r,
          col: c,
          latitude: Number(lat.toFixed(4)),
          longitude: Number(lon.toFixed(4)),
          elevation: Number(elev.toFixed(1)),
          slope: Number(slope.toFixed(1)),
          aspect: 210.0,
          roughness: Number(roughness.toFixed(1)),
          terrain_score: Number(terrainScore.toFixed(1)),
          land_cover: landCover,
          land_cover_factor: factor,
          weather: {
            condition: weather.condition,
            impact_score: weather.impact_score,
          },
          road_accessibility: Number(roadAccess.toFixed(2)),
          water_proximity: Number(waterProx.toFixed(2)),
        });
      }
    }
    return cells;
  }, [weather]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background Canvas
    ctx.fillStyle = "#0B0F14";
    ctx.fillRect(0, 0, width, height);

    const cellWidth = width / cols;
    const cellHeight = height / rows;

    // 1. Grid Cells (Base / Landcover / Terrain)
    gridCells.forEach((cell) => {
      const px = cell.col * cellWidth;
      const py = cell.row * cellHeight;

      if (layers.landcover) {
        switch (cell.land_cover) {
          case "forest": ctx.fillStyle = "rgba(74, 120, 86, 0.55)"; break;
          case "grassland": ctx.fillStyle = "rgba(156, 175, 92, 0.40)"; break;
          case "cropland": ctx.fillStyle = "rgba(201, 162, 75, 0.45)"; break;
          case "urban": ctx.fillStyle = "rgba(107, 114, 128, 0.55)"; break;
          case "water": ctx.fillStyle = "rgba(59, 130, 246, 0.75)"; break;
          case "wetland": ctx.fillStyle = "rgba(79, 166, 160, 0.65)"; break;
          case "bare": default: ctx.fillStyle = "rgba(185, 155, 107, 0.40)"; break;
        }
        ctx.fillRect(px, py, cellWidth, cellHeight);
      }

      if (layers.terrain || layers.elevation) {
        const elevNorm = Math.min(1, Math.max(0, (cell.elevation - 10) / 45));
        ctx.fillStyle = `rgba(139, 111, 71, ${elevNorm * 0.5})`;
        ctx.fillRect(px, py, cellWidth, cellHeight);
      }

      // Hairline subtle grid
      ctx.strokeStyle = "rgba(42, 52, 65, 0.25)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(px, py, cellWidth, cellHeight);
    });

    // 2. Roads
    if (layers.roads) {
      ctx.strokeStyle = "rgba(235, 240, 245, 0.85)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const p1 = project(13.0020, 80.1320, width, height);
      const p2 = project(12.9850, 80.1500, width, height);
      const p3 = project(12.9720, 80.1700, width, height);
      const p4 = project(12.9550, 80.1950, width, height);
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 176, 32, 0.65)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      const s1 = project(13.0050, 80.1350, width, height);
      const s2 = project(13.0030, 80.1550, width, height);
      const s3 = project(12.9920, 80.1850, width, height);
      const s4 = project(12.9800, 80.1980, width, height);
      ctx.moveTo(s1.x, s1.y);
      ctx.lineTo(s2.x, s2.y);
      ctx.lineTo(s3.x, s3.y);
      ctx.lineTo(s4.x, s4.y);
      ctx.stroke();
    }

    // 3. Waterways
    if (layers.waterways) {
      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      const w1 = project(12.9820, 80.1300, width, height);
      const w2 = project(12.9800, 80.1450, width, height);
      const w3 = project(12.9750, 80.1620, width, height);
      const w4 = project(12.9680, 80.1800, width, height);
      const w5 = project(12.9650, 80.2000, width, height);
      ctx.moveTo(w1.x, w1.y);
      ctx.lineTo(w2.x, w2.y);
      ctx.lineTo(w3.x, w3.y);
      ctx.lineTo(w4.x, w4.y);
      ctx.lineTo(w5.x, w5.y);
      ctx.stroke();
    }

    // 4. Restricted Zones
    if (layers.constraints && constraints.restricted_zones) {
      constraints.restricted_zones.forEach((rz) => {
        if (rz.coordinates && rz.coordinates.length > 0) {
          ctx.fillStyle = "rgba(255, 59, 92, 0.22)";
          ctx.strokeStyle = "#FF3B5C";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          rz.coordinates.forEach((pt, idx) => {
            const p = project(pt[1], pt[0], width, height);
            if (idx === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    }

    // 5. Weather Tint
    if (layers.weatherOverlay) {
      let weatherTint = "rgba(147, 161, 180, 0.05)";
      if (weather.condition === "HEAVY_RAIN") weatherTint = "rgba(44, 111, 166, 0.25)";
      else if (weather.condition === "LIGHT_RAIN") weatherTint = "rgba(95, 168, 211, 0.15)";
      else if (weather.condition === "HIGH_WIND") weatherTint = "rgba(122, 140, 255, 0.18)";
      else if (weather.condition === "POOR_CONDITIONS") weatherTint = "rgba(255, 59, 92, 0.20)";

      ctx.fillStyle = weatherTint;
      ctx.fillRect(0, 0, width, height);
    }

    // 6. COA Options
    const coaVisibility = {
      Alpha: layers.coaAlpha,
      Bravo: layers.coaBravo,
      Charlie: layers.coaCharlie,
    };

    coas.forEach((coa) => {
      if (!coaVisibility[coa.name] || !coa.pathCells || coa.pathCells.length === 0) return;

      const isFocused = selectedCOA ? selectedCOA.name === coa.name : coa.isPreferred;
      ctx.strokeStyle = coa.color;
      ctx.lineWidth = isFocused ? 4.5 : 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (coa.constraints.status === "INVALID") {
        ctx.setLineDash([6, 4]);
      } else {
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      coa.pathCells.forEach((c, idx) => {
        const pt = project(c.latitude, c.longitude, width, height);
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // 7. Intelligence Markers
    if (layers.intelligence) {
      intelReports.forEach((rep) => {
        const p = project(rep.latitude, rep.longitude, width, height);
        const markerColor = rep.confidence > 0.75 ? "#00D9A3" : rep.confidence > 0.55 ? "#FFB020" : "#FF3B5C";
        ctx.fillStyle = markerColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#0B0F14";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    // 8. Start & Goal Points
    const startPt = project(scenario.start.lat, scenario.start.lon, width, height);
    const goalPt = project(scenario.goal.lat, scenario.goal.lon, width, height);

    ctx.fillStyle = "#00D9A3";
    ctx.beginPath();
    ctx.arc(startPt.x, startPt.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#FFB020";
    ctx.beginPath();
    ctx.arc(goalPt.x, goalPt.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (selectedCell) {
      const px = selectedCell.col * cellWidth;
      const py = selectedCell.row * cellHeight;
      ctx.strokeStyle = "#00D9A3";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(px, py, cellWidth, cellHeight);
    }
  }, [layers, gridCells, coas, intelReports, constraints, weather, scenario, selectedCell, selectedCOA]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;

    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    const match = gridCells.find((c) => c.row === row && c.col === col);
    if (match) {
      setSelectedCell(match);
      const nearbyIntel = intelReports.find((r) => {
        const d = Math.hypot(r.latitude - match.latitude, r.longitude - match.longitude);
        return d < 0.006;
      });
      setSelectedIntel(nearbyIntel || null);
    }
  };

  return (
    <div id="map-section" className="tactical-panel p-5 flex flex-col space-y-3 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3441] pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-tactical-blue/20 text-tactical-blue">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
              SIMULATION ENVIRONMENT MAP
            </h3>
            <p className="text-xs text-tactical-muted">
              Interactive Study Area: Coastal Corridor (42.8 km²)
            </p>
          </div>
        </div>

        {/* Categorized Map Layer Manager Button (Section 11) */}
        <div className="relative">
          <button
            onClick={() => setIsLayerDrawerOpen(!isLayerDrawerOpen)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-btn bg-[#1A2330] border border-[#2A3441] text-xs text-slate-200 hover:text-white hover:border-slate-400 transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-tactical-green" />
            <span>Map Layers</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Categorized Layer Drawer Popup (Section 11) */}
          {isLayerDrawerOpen && (
            <div className="absolute right-0 top-10 z-30 w-72 bg-[#131A24] border border-[#2A3441] rounded-panel p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between border-b border-[#2A3441] pb-1.5">
                <span className="text-xs font-bold text-slate-100 uppercase">Map Layers</span>
                <button onClick={() => setIsLayerDrawerOpen(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
              </div>

              {/* Environment */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] text-tactical-muted uppercase font-bold block">Environment</span>
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={layers.terrain} onChange={() => toggleLayer("terrain")} className="accent-tactical-green" />
                  <span>Terrain (DEM Hillshade)</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={layers.landcover} onChange={() => toggleLayer("landcover")} className="accent-tactical-green" />
                  <span>Land Cover Types</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={layers.weatherOverlay} onChange={() => toggleLayer("weatherOverlay")} className="accent-tactical-green" />
                  <span>Weather Storm Tint</span>
                </label>
              </div>

              {/* Infrastructure */}
              <div className="space-y-1.5 text-xs pt-1 border-t border-[#2A3441]">
                <span className="text-[10px] text-tactical-muted uppercase font-bold block">Infrastructure</span>
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={layers.roads} onChange={() => toggleLayer("roads")} className="accent-tactical-green" />
                  <span>OSM Roads</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={layers.waterways} onChange={() => toggleLayer("waterways")} className="accent-tactical-green" />
                  <span>Water Channels</span>
                </label>
              </div>

              {/* Simulation */}
              <div className="space-y-1.5 text-xs pt-1 border-t border-[#2A3441]">
                <span className="text-[10px] text-tactical-muted uppercase font-bold block">Simulated Options</span>
                <label className="flex items-center space-x-2 text-tactical-green cursor-pointer">
                  <input type="checkbox" checked={layers.coaAlpha} onChange={() => toggleLayer("coaAlpha")} className="accent-tactical-green" />
                  <span>Option Alpha (Speed)</span>
                </label>
                <label className="flex items-center space-x-2 text-tactical-blue cursor-pointer">
                  <input type="checkbox" checked={layers.coaBravo} onChange={() => toggleLayer("coaBravo")} className="accent-tactical-blue" />
                  <span>Option Bravo (Resources)</span>
                </label>
                <label className="flex items-center space-x-2 text-tactical-amber cursor-pointer">
                  <input type="checkbox" checked={layers.coaCharlie} onChange={() => toggleLayer("coaCharlie")} className="accent-tactical-amber" />
                  <span>Option Charlie (Environment)</span>
                </label>
              </div>

              {/* Advanced */}
              <div className="space-y-1.5 text-xs pt-1 border-t border-[#2A3441]">
                <span className="text-[10px] text-tactical-muted uppercase font-bold block">Advanced Telemetry</span>
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={layers.intelligence} onChange={() => toggleLayer("intelligence")} className="accent-tactical-green" />
                  <span>Simulated Intel Markers</span>
                </label>
                <label className="flex items-center space-x-2 text-tactical-red cursor-pointer">
                  <input type="checkbox" checked={layers.constraints} onChange={() => toggleLayer("constraints")} className="accent-tactical-red" />
                  <span>Restricted Corridors</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/10] bg-[#0B0F14] rounded-btn border border-[#2A3441] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1050}
          height={600}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-crosshair object-cover"
        />

        {/* Legend */}
        <div className="absolute bottom-2.5 left-2.5 bg-[#0B0F14]/90 backdrop-blur p-2.5 rounded-btn border border-[#2A3441] text-[10px] space-y-1 hidden sm:block pointer-events-none">
          <div className="font-semibold text-slate-300 uppercase tracking-wider">
            Simulated Options
          </div>
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 text-tactical-green">
              <span className="w-2.5 h-1 bg-tactical-green rounded" />
              <span>Alpha</span>
            </span>
            <span className="flex items-center space-x-1 text-tactical-blue">
              <span className="w-2.5 h-1 bg-tactical-blue rounded" />
              <span>Bravo</span>
            </span>
            <span className="flex items-center space-x-1 text-tactical-amber">
              <span className="w-2.5 h-1 bg-tactical-amber rounded" />
              <span>Charlie</span>
            </span>
          </div>
        </div>

        {/* Cell Inspector Modal / HUD */}
        {selectedCell && (
          <div className="absolute top-2.5 left-2.5 max-w-xs bg-[#131A24]/95 backdrop-blur border border-tactical-green/60 rounded-btn p-3 shadow-xl text-xs space-y-2 z-10 animate-in fade-in duration-100">
            <div className="flex items-center justify-between border-b border-[#2A3441] pb-1">
              <div className="flex items-center space-x-1 text-tactical-green font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>GRID CELL: {selectedCell.cell_id}</span>
              </div>
              <button onClick={() => setSelectedCell(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">COORDINATES</span>
                <span className="text-slate-200">{selectedCell.latitude}, {selectedCell.longitude}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ELEVATION</span>
                <span className="text-slate-200">{selectedCell.elevation}m ({selectedCell.slope}°)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">LAND TYPE</span>
                <span className="text-tactical-green capitalize">{selectedCell.land_cover}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ROAD ACCESS</span>
                <span className="text-slate-200">{Math.round(selectedCell.road_accessibility * 100)}%</span>
              </div>
              <div className="col-span-2 bg-[#0B0F14] p-1.5 rounded border border-[#2A3441]">
                <span className="text-slate-400 block text-[10px]">ENVIRONMENT DIFFICULTY</span>
                <span className="text-tactical-amber font-bold">
                  {Math.round(environmentCost(selectedCell, weather))} / 100
                </span>
              </div>
            </div>

            {selectedIntel && (
              <div className="mt-1.5 pt-1.5 border-t border-[#2A3441] bg-tactical-blue/10 p-1.5 rounded border border-tactical-blue/30 text-[10px]">
                <span className="font-bold text-tactical-blue block">{selectedIntel.report_id}</span>
                <span className="text-slate-300 block">{selectedIntel.observation_type}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-tactical-muted">
        <span>Click any map cell to inspect elevation, land type and environmental difficulty.</span>
        <span>Standard Study Area Grid</span>
      </div>
    </div>
  );
}
