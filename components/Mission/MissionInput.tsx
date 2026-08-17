"use client";

import { useState } from "react";
import { 
  Play, 
  Sparkles, 
  SlidersHorizontal, 
  Edit3, 
  CheckCircle2, 
  RotateCcw,
  CloudRain,
  Fuel,
  Clock,
  Compass,
  Radio,
  Check
} from "lucide-react";
import { MissionScenario } from "@/lib/simulation/types";
import { WeatherCondition } from "@/lib/environment/types";

interface MissionInputProps {
  currentScenario: MissionScenario;
  onSimulate: (prompt: string, manualParams?: any) => void;
  onSelectPreset: (scenarioId: string) => void;
  isLoading: boolean;
  interpretedParams?: {
    weather: string;
    resource_level: number;
    time_limit: number;
    terrain_preference: string;
    extracted_summary?: string;
  };
  isAdvancedMode?: boolean;
}

const PRESETS = [
  { id: "SIM-0001", label: "Heavy Rain (5h / 55% Resources)" },
  { id: "SIM-0002", label: "Resource Patrol (8h / 40% Resources)" },
  { id: "SIM-0003", label: "High Wind Storm (6h / 75% Resources)" },
];

export function MissionInput({
  currentScenario,
  onSimulate,
  onSelectPreset,
  isLoading,
  interpretedParams,
  isAdvancedMode = false,
}: MissionInputProps) {
  const [missionText, setMissionText] = useState(
    "Simulate a 5-hour scenario under heavy rain with limited resources (55%) and avoid river crossings."
  );

  const [isEditingScenario, setIsEditingScenario] = useState(false);
  const [customWeather, setCustomWeather] = useState<WeatherCondition>("HEAVY_RAIN");
  const [customResources, setCustomResources] = useState<number>(0.55);
  const [customTime, setCustomTime] = useState<number>(5);
  const [customTerrain, setCustomTerrain] = useState<"ANY" | "AVOID_DIFFICULT" | "AVOID_WATER">("AVOID_WATER");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionText.trim()) return;
    onSimulate(missionText);
  };

  const handleSaveManualEdit = () => {
    setIsEditingScenario(false);
    onSimulate(missionText, {
      weather: customWeather,
      resource_level: customResources,
      time_limit: customTime,
      terrain_preference: customTerrain,
    });
  };

  return (
    <div id="mission-input-section" className="tactical-panel p-5 space-y-4">
      {/* Friendly Header (Section 7) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3441] pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 font-mono tracking-tight">
            What would you like to simulate?
          </h2>
          <p className="text-xs text-tactical-muted font-mono">
            Describe the conditions in your own words or pick a quick scenario.
          </p>
        </div>

        {/* Preset Chips */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          <span className="text-[10px] text-tactical-muted uppercase font-mono mr-1">Quick Scenarios:</span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p.id)}
              disabled={isLoading}
              className={`px-2.5 py-1 rounded-btn text-xs font-mono border transition-all ${
                currentScenario.scenario_id === p.id
                  ? "bg-tactical-blue/20 border-tactical-blue text-tactical-blue font-semibold"
                  : "bg-[#1A2330] border-[#2A3441] text-slate-300 hover:text-white hover:border-slate-500"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={missionText}
            onChange={(e) => setMissionText(e.target.value)}
            disabled={isLoading}
            rows={2}
            className="w-full bg-[#0B0F14] border border-[#2A3441] rounded-btn p-3 text-xs sm:text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-tactical-green transition-all resize-none shadow-inner"
            placeholder="Example: Simulate a 5-hour scenario under heavy rain with limited resources."
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 font-mono">
            TACTIX will interpret your description and show you the resulting scenario before running the simulation.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-btn bg-tactical-green text-black font-mono font-bold text-xs hover:bg-tactical-green/90 transition-all disabled:opacity-50 shadow-md shadow-tactical-green/10"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>RUN SIMULATION</span>
          </button>
        </div>
      </form>

      {/* Simple Scenario Review Confirmation Card (Section 8) */}
      <div id="scenario-summary-section" className="bg-[#1A2330] p-4 rounded-btn border border-[#2A3441] space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-tactical-green" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
              YOUR SCENARIO
            </span>
          </div>

          <button
            onClick={() => setIsEditingScenario(!isEditingScenario)}
            className="text-xs text-tactical-blue hover:text-white flex items-center space-x-1 underline"
          >
            <Edit3 className="w-3 h-3" />
            <span>{isEditingScenario ? "Cancel Edit" : "Edit Scenario"}</span>
          </button>
        </div>

        {!isEditingScenario ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
              <span className="text-[10px] text-slate-400 block uppercase">Weather</span>
              <span className="font-semibold text-slate-100">
                {interpretedParams?.weather?.replace("_", " ") || currentScenario.weather_condition.replace("_", " ")}
              </span>
            </div>

            <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
              <span className="text-[10px] text-slate-400 block uppercase">Resources</span>
              <span className="font-semibold text-tactical-blue">
                {Math.round((interpretedParams?.resource_level ?? currentScenario.resource_level) * 100)}%
              </span>
            </div>

            <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
              <span className="text-[10px] text-slate-400 block uppercase">Time Limit</span>
              <span className="font-semibold text-tactical-amber">
                {interpretedParams?.time_limit ?? currentScenario.time_limit} Hours
              </span>
            </div>

            <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
              <span className="text-[10px] text-slate-400 block uppercase">Terrain Rule</span>
              <span className="font-semibold text-tactical-green truncate block">
                {interpretedParams?.terrain_preference?.replace("_", " ") || currentScenario.terrain_preference.replace("_", " ")}
              </span>
            </div>

            <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
              <span className="text-[10px] text-slate-400 block uppercase">Info Confidence</span>
              <span className="font-semibold text-slate-100">
                {Math.round(currentScenario.intelligence_confidence * 100)}%
              </span>
            </div>
          </div>
        ) : (
          /* Manual Inline Editor when user wants to tweak values */
          <div className="bg-[#0B0F14] p-4 rounded-btn border border-tactical-blue/40 space-y-3">
            <span className="text-xs text-tactical-blue font-bold block">Customize Scenario Parameters:</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Weather</label>
                <select
                  value={customWeather}
                  onChange={(e) => setCustomWeather(e.target.value as WeatherCondition)}
                  className="w-full bg-[#131A24] border border-[#2A3441] rounded p-1.5 text-xs text-slate-100"
                >
                  <option value="NORMAL">Normal (Clear)</option>
                  <option value="LIGHT_RAIN">Light Rain</option>
                  <option value="HIGH_WIND">High Wind</option>
                  <option value="HEAVY_RAIN">Heavy Rain</option>
                  <option value="POOR_CONDITIONS">Poor Conditions</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Resources: {Math.round(customResources * 100)}%</label>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={customResources}
                  onChange={(e) => setCustomResources(parseFloat(e.target.value))}
                  className="w-full accent-tactical-blue"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Time Limit: {customTime}h</label>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="1"
                  value={customTime}
                  onChange={(e) => setCustomTime(parseInt(e.target.value, 10))}
                  className="w-full accent-tactical-amber"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Terrain Rule</label>
                <select
                  value={customTerrain}
                  onChange={(e) => setCustomTerrain(e.target.value as any)}
                  className="w-full bg-[#131A24] border border-[#2A3441] rounded p-1.5 text-xs text-slate-100"
                >
                  <option value="ANY">Any Terrain</option>
                  <option value="AVOID_DIFFICULT">Avoid Difficult Terrain</option>
                  <option value="AVOID_WATER">Avoid Water Crossings</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                onClick={handleSaveManualEdit}
                className="px-4 py-1.5 rounded-btn bg-tactical-blue text-white font-bold text-xs hover:bg-tactical-blue/90"
              >
                Apply & Run Simulation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
