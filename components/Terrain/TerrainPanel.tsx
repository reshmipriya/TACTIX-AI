"use client";

import { Mountain, Compass, Activity, CheckCircle } from "lucide-react";

interface TerrainPanelProps {
  meanElevation?: number;
  meanSlope?: number;
  meanRoughness?: number;
  terrainScore?: number;
}

export function TerrainPanel({
  meanElevation = 28.4,
  meanSlope = 7.2,
  meanRoughness = 2.8,
  terrainScore = 32.5,
}: TerrainPanelProps) {
  return (
    <div className="tactical-panel p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-[#2A3441] pb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-tactical-earth/20 text-[#D9C29B]">
            <Mountain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-semibold text-slate-100 uppercase">
              TERRAIN TELEMETRY (SRTM 30M)
            </h3>
            <p className="text-[10px] text-tactical-muted font-mono">
              USGS/NASA 1 Arc-Second DEM
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tactical-green/10 text-tactical-green border border-tactical-green/30">
          PROCESSED
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 font-mono text-xs">
        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <span className="text-[10px] text-slate-400 block uppercase">Elevation</span>
          <span className="text-sm font-semibold text-slate-100">{meanElevation} m</span>
          <span className="text-[9px] text-tactical-muted block">Coastal Plain</span>
        </div>

        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <span className="text-[10px] text-slate-400 block uppercase">Mean Slope</span>
          <span className="text-sm font-semibold text-slate-100">{meanSlope}°</span>
          <span className="text-[9px] text-tactical-muted block">Gradient vector</span>
        </div>

        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <span className="text-[10px] text-slate-400 block uppercase">Roughness</span>
          <span className="text-sm font-semibold text-slate-100">{meanRoughness}</span>
          <span className="text-[9px] text-tactical-muted block">3x3 Std-dev</span>
        </div>
      </div>

      {/* Terrain Score Gauge */}
      <div className="bg-[#1A2330] p-2.5 rounded border border-[#2A3441] space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300">Composite Terrain Score</span>
          <span className="font-bold text-tactical-green">{Math.round(terrainScore)} / 100</span>
        </div>
        <div className="w-full bg-[#0B0F14] h-2 rounded-full overflow-hidden border border-[#2A3441]">
          <div
            className="bg-tactical-green h-full transition-all duration-500"
            style={{ width: `${Math.min(100, terrainScore)}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-tactical-muted">
          <span>0 (Passable Flatlands)</span>
          <span>100 (Impassable Ridges)</span>
        </div>
      </div>
    </div>
  );
}
