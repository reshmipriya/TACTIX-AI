"use client";

import { CloudRain, Wind, Thermometer, Gauge, Compass } from "lucide-react";
import { WeatherScenario } from "@/lib/environment/types";

interface WeatherPanelProps {
  weather: WeatherScenario;
  onSelectCondition?: (condition: WeatherScenario["condition"]) => void;
}

export function WeatherPanel({ weather, onSelectCondition }: WeatherPanelProps) {
  // Convert 0-100 impact score into ASCII tactical bar: ████████░░ 78
  const filledBlocks = Math.round(weather.impact_score / 10);
  const emptyBlocks = 10 - filledBlocks;
  const asciiBar = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

  return (
    <div className="tactical-panel p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-[#2A3441] pb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-tactical-blue/20 text-tactical-blue">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-semibold text-slate-100 uppercase">
              METEOROLOGY (ERA5 REANALYSIS)
            </h3>
            <p className="text-[10px] text-tactical-muted font-mono">
              ECMWF Hourly Single-Level Reanalysis
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tactical-blue/10 text-tactical-blue border border-tactical-blue/30 uppercase">
          {weather.condition}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <div className="flex items-center space-x-1 text-slate-400 text-[10px] uppercase">
            <Thermometer className="w-3 h-3 text-tactical-amber" />
            <span>Temp</span>
          </div>
          <span className="text-base font-semibold text-slate-100 mt-1 block">
            {weather.temp_c} °C
          </span>
        </div>

        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <div className="flex items-center space-x-1 text-slate-400 text-[10px] uppercase">
            <CloudRain className="w-3 h-3 text-tactical-blue" />
            <span>Precip</span>
          </div>
          <span className="text-base font-semibold text-slate-100 mt-1 block">
            {weather.precip_mm} mm
          </span>
        </div>

        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <div className="flex items-center space-x-1 text-slate-400 text-[10px] uppercase">
            <Wind className="w-3 h-3 text-tactical-green" />
            <span>Wind</span>
          </div>
          <span className="text-base font-semibold text-slate-100 mt-1 block">
            {weather.wind_ms} m/s
          </span>
        </div>

        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <div className="flex items-center space-x-1 text-slate-400 text-[10px] uppercase">
            <Gauge className="w-3 h-3 text-tactical-muted" />
            <span>Pressure</span>
          </div>
          <span className="text-base font-semibold text-slate-100 mt-1 block">
            {weather.pressure_hpa} hPa
          </span>
        </div>
      </div>

      {/* Weather Impact Score Bar (Section 36) */}
      <div className="bg-[#1A2330] p-2.5 rounded border border-[#2A3441] space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300">Weather Impact Score</span>
          <span className="font-bold text-tactical-amber">Impact: {weather.impact_score} / 100</span>
        </div>
        <div className="text-xs text-tactical-amber tracking-widest bg-[#0B0F14] p-1.5 rounded border border-[#2A3441] flex items-center justify-between">
          <span className="font-mono text-sm">{asciiBar}</span>
          <span className="font-mono text-xs">{weather.impact_score}%</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          {weather.description}
        </p>
      </div>
    </div>
  );
}
