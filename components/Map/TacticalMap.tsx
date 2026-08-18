"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { 
  Layers, 
  RotateCcw, 
  MapPin, 
  Navigation,
  ChevronDown,
  ChevronUp,
  Info,
  List,
  Target,
  Sparkles,
  Zap,
  Package,
  Leaf
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
}

export function TacticalMap({
  scenario,
  weather,
  coas,
  intelReports,
  constraints,
  selectedCOA,
  onSelectCOA,
}: TacticalMapProps) {
  // Default clean layers (Section 14 & 15)
  const [layers, setLayers] = useState({
    terrain: false,
    elevation: false,
    landcover: false,
    weatherOverlay: false,
    roads: true,
    waterways: true,
    coaAlpha: true,
    coaBravo: true,
    coaCharlie: true,
    intelligence: false,
    constraints: false,
  });

  const [isLayerDrawerOpen, setIsLayerDrawerOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(true);
  const [selectedCell, setSelectedCell] = useState<EnvCell | null>(null);
  const [showCellTechnical, setShowCellTechnical] = useState(false);
  const [hoveredCOA, setHoveredCOA] = useState<COA | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetView = () => {
    setSelectedCell(null);
    setShowCellTechnical(false);
    setHoveredCOA(null);
    setLayers({
      terrain: false,
      elevation: false,
      landcover: false,
      weatherOverlay: false,
      roads: true,
      waterways: true,
      coaAlpha: true,
      coaBravo: true,
      coaCharlie: true,
      intelligence: false,
      constraints: false,
    });
  };

  // 1. Dynamic Route Bounding Calculation (Section 3: fitBounds equivalent)
  const bounds = useMemo(() => {
    let lats: number[] = [scenario.start.lat, scenario.goal.lat];
    let lons: number[] = [scenario.start.lon, scenario.goal.lon];

    coas.forEach((coa) => {
      if (coa.pathCells && coa.pathCells.length > 0) {
        coa.pathCells.forEach((c) => {
          lats.push(c.latitude);
          lons.push(c.longitude);
        });
      }
    });

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    // Add 12% padding around active routes so they occupy the useful central area
    const latPadding = Math.max(0.006, (maxLat - minLat) * 0.18);
    const lonPadding = Math.max(0.008, (maxLon - minLon) * 0.18);

    return {
      latMin: minLat - latPadding,
      latMax: maxLat + latPadding,
      lonMin: minLon - lonPadding,
      lonMax: maxLon + lonPadding,
    };
  }, [scenario, coas]);

  // Coordinate Projection Helper
  const project = useCallback((lat: number, lon: number, width: number, height: number) => {
    const x = ((lon - bounds.lonMin) / (bounds.lonMax - bounds.lonMin)) * width;
    const y = ((bounds.latMax - lat) / (bounds.latMax - bounds.latMin)) * height;
    return { x, y };
  }, [bounds]);

  // Inverse projection from canvas pixels to geographic coords
  const unproject = useCallback((x: number, y: number, width: number, height: number) => {
    const lon = bounds.lonMin + (x / width) * (bounds.lonMax - bounds.lonMin);
    const lat = bounds.latMax - (y / height) * (bounds.latMax - bounds.latMin);
    return { lat, lon };
  }, [bounds]);

  // Grid cells generation for the bounding box
  const rows = 28, cols = 36;
  const gridCells = useMemo(() => {
    const cells: EnvCell[] = [];
    const dLat = (bounds.latMax - bounds.latMin) / rows;
    const dLon = (bounds.lonMax - bounds.lonMin) / cols;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lat = bounds.latMax - (r + 0.5) * dLat;
        const lon = bounds.lonMin + (c + 0.5) * dLon;

        const xNorm = (c / cols) * 3;
        const yNorm = (r / rows) * 3;
        const elev = 14.0 + 32.0 * Math.sin(xNorm * 1.5) * Math.cos(yNorm * 1.2) + 18.0 * Math.exp(-((xNorm - 1.5) ** 2 + (yNorm - 1.2) ** 2) / 0.5);
        const slope = Math.abs(Math.cos(xNorm * 1.5) * 11.0) + Math.abs(Math.sin(yNorm * 1.2) * 7.5);
        const roughness = (slope / 2.0) + 1.1;
        const terrainScore = Math.min(100, Math.max(5, (slope * 2.5) + (roughness * 4.0)));

        let landCover: EnvCell["land_cover"] = "grassland";
        let factor = 0.30;
        if (r >= 13 && r <= 15 && c > 4 && c < 32) {
          landCover = "water";
          factor = 1.0;
        } else if (r < 7 && c < 10) {
          landCover = "urban";
          factor = 0.5;
        } else if (r >= 8 && r <= 19 && c >= 12 && c <= 20) {
          landCover = "forest";
          factor = 0.7;
        }

        const distToCenterRoad = Math.hypot(xNorm - yNorm, 0.5);
        const roadAccess = Math.max(0.1, Math.min(1.0, 1.0 - distToCenterRoad * 0.4));
        const waterProx = landCover === "water" ? 0.9 : Math.max(0, 0.8 - Math.abs(r - 14) * 0.1);

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
  }, [bounds, weather]);

  // Main Canvas Rendering Engine
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

    // 1. Subtle Background Grid (Section 4: low contrast spatial grid)
    gridCells.forEach((cell) => {
      const px = cell.col * cellWidth;
      const py = cell.row * cellHeight;

      if (layers.landcover) {
        switch (cell.land_cover) {
          case "forest": ctx.fillStyle = "rgba(74, 120, 86, 0.35)"; break;
          case "grassland": ctx.fillStyle = "rgba(156, 175, 92, 0.20)"; break;
          case "urban": ctx.fillStyle = "rgba(107, 114, 128, 0.30)"; break;
          case "water": ctx.fillStyle = "rgba(59, 130, 246, 0.45)"; break;
          default: ctx.fillStyle = "transparent"; break;
        }
        ctx.fillRect(px, py, cellWidth, cellHeight);
      }

      if (layers.terrain || layers.elevation) {
        const elevNorm = Math.min(1, Math.max(0, (cell.elevation - 10) / 45));
        ctx.fillStyle = `rgba(139, 111, 71, ${elevNorm * 0.35})`;
        ctx.fillRect(px, py, cellWidth, cellHeight);
      }

      // Subtle grid line (Section 4)
      ctx.strokeStyle = "rgba(42, 52, 65, 0.18)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(px, py, cellWidth, cellHeight);
    });

    // 2. Spatial Infrastructure: Roads (Section 14)
    if (layers.roads) {
      ctx.strokeStyle = "rgba(147, 161, 180, 0.35)";
      ctx.lineWidth = 2.0;
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
    }

    // 3. Spatial Infrastructure: Waterways (Section 14)
    if (layers.waterways) {
      ctx.strokeStyle = "rgba(59, 130, 246, 0.50)";
      ctx.lineWidth = 4.0;
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
          ctx.fillStyle = "rgba(255, 59, 92, 0.15)";
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

    // 5. Draw Simulated Routes (Alpha, Bravo, Charlie) (Section 8, 9, 11)
    const coaVisibility = {
      Alpha: layers.coaAlpha,
      Bravo: layers.coaBravo,
      Charlie: layers.coaCharlie,
    };

    coas.forEach((coa) => {
      if (!coaVisibility[coa.name] || !coa.pathCells || coa.pathCells.length === 0) return;

      const isSelected = selectedCOA ? selectedCOA.name === coa.name : coa.isPreferred;
      const isHovered = hoveredCOA?.name === coa.name;

      // Line style & glow (Section 9: Selected thicker and prominent, others subdued)
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (isSelected || isHovered) {
        ctx.shadowColor = coa.color;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = coa.color;
        ctx.lineWidth = 5.5;
      } else {
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `${coa.color}70`;
        ctx.lineWidth = 2.5;
      }

      if (coa.constraints.status === "INVALID") {
        ctx.setLineDash([6, 4]);
      } else {
        ctx.setLineDash([]);
      }

      // Draw Main Route Line
      ctx.beginPath();
      const points: { x: number; y: number }[] = [];
      coa.pathCells.forEach((c, idx) => {
        const pt = project(c.latitude, c.longitude, width, height);
        points.push(pt);
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0; // Reset shadow

      // 6. Directional Indicators / Chevrons (Section 7: Direction along route START -> END)
      if (points.length >= 4) {
        const step = Math.floor(points.length / 4);
        for (let i = step; i < points.length - 1; i += step) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

          ctx.save();
          ctx.translate(p1.x, p1.y);
          ctx.rotate(angle);
          ctx.fillStyle = isSelected ? "#FFFFFF" : coa.color;
          ctx.beginPath();
          ctx.moveTo(6, 0);
          ctx.lineTo(-4, -4);
          ctx.lineTo(-2, 0);
          ctx.lineTo(-4, 4);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      // 7. Route Midpoint Badges / Labels (Section 10)
      if (points.length > 2) {
        const midIdx = Math.floor(points.length * (coa.name === "Alpha" ? 0.35 : coa.name === "Bravo" ? 0.55 : 0.72));
        const midPt = points[midIdx];

        ctx.save();
        ctx.fillStyle = "#131A24";
        ctx.strokeStyle = coa.color;
        ctx.lineWidth = 1;
        
        const labelText = `OPTION ${coa.name.toUpperCase()}`;
        ctx.font = "bold 10px Inter, monospace";
        const textWidth = ctx.measureText(labelText).width;
        
        const badgeY = midPt.y - 14;
        const badgeX = midPt.x - (textWidth + 12) / 2;

        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY - 10, textWidth + 12, 16, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSelected ? "#FFFFFF" : coa.color;
        ctx.fillText(labelText, badgeX + 6, badgeY + 2);
        ctx.restore();
      }
    });

    // 8. Distinct START Marker (Section 5: actual start coordinate)
    const startPt = project(scenario.start.lat, scenario.start.lon, width, height);

    // Glowing outer ring
    ctx.fillStyle = "rgba(0, 217, 163, 0.25)";
    ctx.beginPath();
    ctx.arc(startPt.x, startPt.y, 14, 0, Math.PI * 2);
    ctx.fill();

    // Solid inner core
    ctx.fillStyle = "#00D9A3";
    ctx.beginPath();
    ctx.arc(startPt.x, startPt.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // START Badge
    ctx.save();
    ctx.fillStyle = "#00D9A3";
    ctx.strokeStyle = "#0B0F14";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(startPt.x - 26, startPt.y - 28, 52, 16, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.font = "bold 9px Inter, sans-serif";
    ctx.fillText("● START", startPt.x - 20, startPt.y - 17);
    ctx.restore();

    // 9. Distinct END / DESTINATION Marker (Section 6: actual goal coordinate)
    const goalPt = project(scenario.goal.lat, scenario.goal.lon, width, height);

    // Outer target ring
    ctx.fillStyle = "rgba(255, 176, 32, 0.25)";
    ctx.beginPath();
    ctx.arc(goalPt.x, goalPt.y, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#FFB020";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(goalPt.x, goalPt.y, 11, 0, Math.PI * 2);
    ctx.stroke();

    // Solid center dot
    ctx.fillStyle = "#FFB020";
    ctx.beginPath();
    ctx.arc(goalPt.x, goalPt.y, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    // END Badge
    ctx.save();
    ctx.fillStyle = "#FFB020";
    ctx.strokeStyle = "#0B0F14";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(goalPt.x - 24, goalPt.y - 28, 48, 16, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.font = "bold 9px Inter, sans-serif";
    ctx.fillText("◎ END", goalPt.x - 17, goalPt.y - 17);
    ctx.restore();

    // Selected cell indicator
    if (selectedCell) {
      const px = selectedCell.col * cellWidth;
      const py = selectedCell.row * cellHeight;
      ctx.strokeStyle = "#00D9A3";
      ctx.lineWidth = 2;
      ctx.strokeRect(px, py, cellWidth, cellHeight);
    }
  }, [layers, gridCells, coas, constraints, weather, scenario, selectedCell, selectedCOA, hoveredCOA, project]);

  // Handle Mouse Move for Route Hover Detection (Section 23)
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    let nearestCOA: COA | null = null;
    let minDistance = 16; // 16px threshold

    coas.forEach((coa) => {
      if (!coa.pathCells) return;
      coa.pathCells.forEach((c) => {
        const pt = project(c.latitude, c.longitude, canvas.width, canvas.height);
        const dist = Math.hypot(pt.x - x, pt.y - y);
        if (dist < minDistance) {
          minDistance = dist;
          nearestCOA = coa;
        }
      });
    });

    if (nearestCOA) {
      setHoveredCOA(nearestCOA);
      setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    } else {
      setHoveredCOA(null);
      setHoverPos(null);
    }
  };

  // Handle Canvas Click: Route Selection or Cell Inspection (Section 18 & 24)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // 1. If clicked near a route, select that option (Section 24)
    if (hoveredCOA && onSelectCOA) {
      onSelectCOA(hoveredCOA);
      return;
    }

    // 2. Otherwise inspect the clicked cell (Section 18)
    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;
    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    const match = gridCells.find((c) => c.row === row && c.col === col);
    if (match) {
      setSelectedCell(match);
      setShowCellTechnical(false);
    }
  };

  return (
    <div id="map-section" className="workflow-card p-4 lg:p-5 flex flex-col space-y-3 font-mono relative overflow-hidden">
      
      {/* Header with Floating Controls (Section 15 & 16) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3441]/70 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded bg-tactical-blue/20 text-tactical-blue">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              SIMULATION ENVIRONMENT MAP
            </h3>
            <p className="text-[11px] text-slate-400">
              Study Area: Coastal Corridor • Auto-Bounded to Simulated Alternatives
            </p>
          </div>
        </div>

        {/* Clean Floating Map Toolbar (Section 15, 16, 17) */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="relative">
            <button
              onClick={() => setIsLayerDrawerOpen(!isLayerDrawerOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-btn bg-[#16202E] border border-[#2A3441] text-slate-200 hover:text-white hover:border-tactical-green transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-tactical-green" />
              <span>Layers</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Layer Control Dropdown (Section 15) */}
            {isLayerDrawerOpen && (
              <div className="absolute right-0 top-9 z-30 w-64 bg-[#131A24] border border-[#2A3441] rounded-panel p-3.5 shadow-2xl space-y-2.5 animate-in fade-in duration-100 text-xs">
                <div className="flex items-center justify-between border-b border-[#2A3441] pb-1">
                  <span className="font-bold text-slate-100 uppercase text-[11px]">Map Layers</span>
                  <button onClick={() => setIsLayerDrawerOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-1 text-[11px]">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Environment</span>
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={layers.terrain} onChange={() => toggleLayer("terrain")} className="accent-tactical-green" />
                    <span>Terrain (DEM Hillshade)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={layers.landcover} onChange={() => toggleLayer("landcover")} className="accent-tactical-green" />
                    <span>Land Types</span>
                  </label>
                </div>

                <div className="space-y-1 text-[11px] pt-1.5 border-t border-[#2A3441]">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Infrastructure</span>
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={layers.roads} onChange={() => toggleLayer("roads")} className="accent-tactical-green" />
                    <span>OSM Roads</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={layers.waterways} onChange={() => toggleLayer("waterways")} className="accent-tactical-green" />
                    <span>Water Channels</span>
                  </label>
                </div>

                <div className="space-y-1 text-[11px] pt-1.5 border-t border-[#2A3441]">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Simulated Options</span>
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
                    <span>Option Charlie (Env Difficulty)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-btn bg-[#16202E] border border-[#2A3441] text-slate-200 hover:text-white transition-all"
          >
            <List className="w-3.5 h-3.5 text-tactical-blue" />
            <span>Legend</span>
          </button>

          <button
            onClick={handleResetView}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-btn bg-[#16202E] border border-[#2A3441] text-slate-300 hover:text-white transition-all"
            title="Reset Map View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Map Canvas Viewport (Section 19: Responsive height 420px to 480px) */}
      <div className="relative w-full h-[400px] sm:h-[460px] bg-[#0B0F14] rounded-btn border border-[#2A3441] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1100}
          height={620}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => { setHoveredCOA(null); setHoverPos(null); }}
          className={`w-full h-full object-cover ${hoveredCOA ? "cursor-pointer" : "cursor-crosshair"}`}
        />

        {/* Compact Integrated Map Legend (Section 12) */}
        {isLegendOpen && (
          <div className="absolute top-3 right-3 bg-[#0B0F14]/90 backdrop-blur p-3 rounded-panel border border-[#2A3441] text-xs space-y-2 animate-in fade-in duration-100 max-w-xs shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2A3441]/60 pb-1">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">
                SIMULATED ROUTES
              </span>
              <span className="text-[10px] text-tactical-green">
                {selectedCOA ? `Option ${selectedCOA.name} Selected` : "All Visible"}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-[11px]">
              <span className="flex items-center space-x-1 text-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-tactical-green inline-block" />
                <span className="font-bold">START</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-tactical-amber inline-block" />
                <span className="font-bold">END</span>
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] pt-1 border-t border-[#2A3441]/60">
              <div
                onClick={() => onSelectCOA && coas.find(c => c.name === "Alpha") && onSelectCOA(coas.find(c => c.name === "Alpha")!)}
                className={`flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors ${
                  selectedCOA?.name === "Alpha" ? "bg-tactical-green/20 text-white font-bold" : "text-slate-300 hover:bg-[#16202E]"
                }`}
              >
                <span className="w-4 h-1 bg-tactical-green rounded" />
                <span><b>Option Alpha</b> — Faster option</span>
              </div>

              <div
                onClick={() => onSelectCOA && coas.find(c => c.name === "Bravo") && onSelectCOA(coas.find(c => c.name === "Bravo")!)}
                className={`flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors ${
                  selectedCOA?.name === "Bravo" ? "bg-tactical-blue/20 text-white font-bold" : "text-slate-300 hover:bg-[#16202E]"
                }`}
              >
                <span className="w-4 h-1 bg-tactical-blue rounded" />
                <span><b>Option Bravo</b> — Resource-efficient</span>
              </div>

              <div
                onClick={() => onSelectCOA && coas.find(c => c.name === "Charlie") && onSelectCOA(coas.find(c => c.name === "Charlie")!)}
                className={`flex items-center space-x-2 cursor-pointer p-1 rounded transition-colors ${
                  selectedCOA?.name === "Charlie" ? "bg-tactical-amber/20 text-white font-bold" : "text-slate-300 hover:bg-[#16202E]"
                }`}
              >
                <span className="w-4 h-1 bg-tactical-amber rounded" />
                <span><b>Option Charlie</b> — Lower env. difficulty</span>
              </div>
            </div>
          </div>
        )}

        {/* Route Hover Tooltip (Section 23) */}
        {hoveredCOA && hoverPos && (
          <div
            className="absolute pointer-events-none bg-[#131A24]/95 backdrop-blur border border-tactical-green/70 rounded-panel p-2.5 shadow-2xl text-xs space-y-1 z-20 font-mono animate-in fade-in duration-75"
            style={{
              left: `${Math.min(hoverPos.x + 12, 700)}px`,
              top: `${Math.max(hoverPos.y - 70, 10)}px`,
            }}
          >
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredCOA.color }} />
              <span className="font-bold text-slate-100 uppercase">OPTION {hoveredCOA.name}</span>
            </div>
            <p className="text-[11px] text-tactical-green font-semibold">{hoveredCOA.description}</p>
            <div className="flex items-center space-x-3 text-[10px] text-slate-300 pt-0.5 border-t border-[#2A3441]">
              <span>Risk: <b>{hoveredCOA.metrics.risk_score}/100</b></span>
              <span>Duration: <b>{hoveredCOA.metrics.estimated_duration_hours}h</b></span>
              <span>Resources: <b>{Math.round(hoveredCOA.metrics.resource_consumption * 100)}%</b></span>
            </div>
          </div>
        )}

        {/* Contextual Cell Inspection Popup (Section 18) */}
        {selectedCell && (
          <div className="absolute bottom-3 left-3 max-w-xs bg-[#131A24]/95 backdrop-blur border border-tactical-green/60 rounded-panel p-3.5 shadow-2xl text-xs space-y-2 z-10 animate-in fade-in duration-100 font-mono">
            <div className="flex items-center justify-between border-b border-[#2A3441] pb-1">
              <div className="flex items-center space-x-1 text-tactical-green font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>STUDY AREA POINT</span>
              </div>
              <button onClick={() => setSelectedCell(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Plain Language Inspection */}
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Terrain Difficulty:</span>
                <span className="font-semibold text-slate-100">
                  {selectedCell.terrain_score > 60 ? "High Difficulty" : selectedCell.terrain_score > 30 ? "Moderate Difficulty" : "Low Difficulty"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Land Type:</span>
                <span className="font-semibold text-tactical-green capitalize">{selectedCell.land_cover}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Weather Impact:</span>
                <span className="font-semibold text-tactical-blue">{selectedCell.weather.condition.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Environmental Difficulty:</span>
                <span className="font-bold text-tactical-amber">
                  {Math.round(environmentCost(selectedCell, weather))} / 100
                </span>
              </div>
            </div>

            {/* Expandable Technical Details */}
            <div className="pt-1.5 border-t border-[#2A3441]">
              <button
                onClick={() => setShowCellTechnical(!showCellTechnical)}
                className="text-[10px] text-tactical-blue hover:text-white flex items-center space-x-1"
              >
                <span>{showCellTechnical ? "[ Hide Technical Details ]" : "[ Technical Details ]"}</span>
                {showCellTechnical ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showCellTechnical && (
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 text-[10px] text-slate-300">
                  <div>Elevation: {selectedCell.elevation}m</div>
                  <div>Slope: {selectedCell.slope}°</div>
                  <div>Roughness: {selectedCell.roughness}</div>
                  <div>Road Access: {Math.round(selectedCell.road_accessibility * 100)}%</div>
                  <div className="col-span-2 text-slate-400">Coords: {selectedCell.latitude}, {selectedCell.longitude}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Status Bar (Section 13) */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-tactical-green animate-pulse" />
          <span className="font-bold text-slate-200 uppercase text-[11px]">
            SIMULATED STUDY AREA:
          </span>
          <span className="text-slate-300">
            {coas.length} OPTIONS • 1 START • 1 DESTINATION
          </span>
        </div>
        <span className="hidden sm:inline text-slate-500 text-[11px]">
          Hover route for metrics • Click route to select
        </span>
      </div>

    </div>
  );
}
