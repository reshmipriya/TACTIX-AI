"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  Edit3, 
  Check, 
  Sliders, 
  Info,
  ChevronRight,
  X,
  Compass
} from "lucide-react";
import { MissionScenario } from "@/lib/simulation/types";
import { MissionParams } from "@/lib/ai/types";
import { WeatherCondition } from "@/lib/environment/types";

interface MissionInputProps {
  currentScenario: MissionScenario;
  onSimulate: (missionText: string, manualParams?: any) => void;
  onSelectPreset?: (scenarioId: string) => void;
  isLoading: boolean;
  interpretedParams?: MissionParams;
}

export function MissionInput({
  currentScenario,
  onSimulate,
  onSelectPreset,
  isLoading,
  interpretedParams,
}: MissionInputProps) {
  const [missionText, setMissionText] = useState(
    "Simulate a 5-hour scenario under heavy rain with limited resources."
  );
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  // Manual editable parameters in Scenario Confirmation (Section 9)
  const [customWeather, setCustomWeather] = useState<WeatherCondition>(
    interpretedParams?.weather || currentScenario.weather_condition
  );
  const [customResources, setCustomResources] = useState<number>(
    interpretedParams?.resource_level ?? currentScenario.resource_level
  );
  const [customTime, setCustomTime] = useState<number>(
    interpretedParams?.time_limit ?? currentScenario.time_limit
  );
  const [customTerrain, setCustomTerrain] = useState<"ANY" | "AVOID_DIFFICULT" | "AVOID_WATER">(
    interpretedParams?.terrain_preference || currentScenario.terrain_preference
  );
  const [customConfidence, setCustomConfidence] = useState<number>(0.62);

  useEffect(() => {
    if (interpretedParams) {
      if (interpretedParams.weather) setCustomWeather(interpretedParams.weather);
      if (interpretedParams.resource_level !== undefined) setCustomResources(interpretedParams.resource_level);
      if (interpretedParams.time_limit !== undefined) setCustomTime(interpretedParams.time_limit);
      if (interpretedParams.terrain_preference) setCustomTerrain(interpretedParams.terrain_preference);
    }
  }, [interpretedParams]);

  // Quick-start example chips (Section 7)
  const exampleChips = [
    "Simulate a 5-hour scenario under heavy rain with limited resources.",
    "Run a scenario with high winds, moderate resources and avoid water.",
    "Test what happens if resources drop to 30%.",
  ];

  const handleChipClick = (text: string) => {
    setMissionText(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionText.trim() || isLoading) return;
    onSimulate(missionText);
  };

  const handleApplyCustomAndRun = () => {
    setIsEditDrawerOpen(false);
    onSimulate(missionText, {
      weather: customWeather,
      resource_level: customResources,
      time_limit: customTime,
      terrain_preference: customTerrain,
    });
  };

  return (
    <div id="mission-input-card" className="space-y-4">
      
      {/* 1. Dominant Natural-Language Mission Command Bar (Section 5 & 7) */}
      <div className="workflow-card p-5 lg:p-6 shadow-xl space-y-4 border border-tactical-green/30 bg-gradient-to-b from-[#141E2B] to-[#0E1520]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-tactical-green" />
              <span>What would you like to simulate?</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Describe the conditions in your own words. TACTIX will convert them into a structured simulation scenario.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#0B0F14] text-slate-400 border border-[#2A3441]">
            Controlled Simulation Environment
          </span>
        </div>

        {/* Big Input + Primary Action */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <input
                id="mission-input-field"
                type="text"
                value={missionText}
                onChange={(e) => setMissionText(e.target.value)}
                placeholder="Describe the scenario you want to simulate (e.g., Heavy rain, 5 hours, limited resources)..."
                className="w-full bg-[#0B0F14] border border-[#2A3441] rounded-btn px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-tactical-green transition-all shadow-inner"
              />
            </div>

            <button
              id="run-simulation-btn"
              type="submit"
              disabled={isLoading || !missionText.trim()}
              className="flex items-center justify-center space-x-2 px-7 py-3.5 rounded-btn bg-tactical-green text-black font-bold text-xs uppercase tracking-wider hover:bg-tactical-green/90 transition-all shadow-lg shadow-tactical-green/10 disabled:opacity-40 flex-shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>SIMULATING...</span>
                </>
              ) : (
                <>
                  <span>RUN SIMULATION</span>
                  <Send className="w-3.5 h-3.5 fill-black" />
                </>
              )}
            </button>
          </div>

          {/* Contextual Hints & Example Chips (Section 7 & 8) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-400 mr-1">Quick Scenarios:</span>
              {exampleChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="px-2.5 py-1 rounded bg-[#16202E] border border-[#2A3441] text-slate-300 hover:text-white hover:border-tactical-green transition-all"
                >
                  {idx === 0 ? "⛈️ Heavy Rain / Limited Resources" : idx === 1 ? "💨 High Wind / Avoid Water" : "⏱️ Short Time Limit"}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-500 hidden xl:inline">
              Try including: Weather · Resources · Time limit · Terrain rule
            </span>
          </div>
        </form>
      </div>

      {/* 2. Sleek Horizontal Scenario Confirmation Strip (Section 5 & 9) */}
      <div id="scenario-review-card" className="workflow-card p-3.5 px-5 flex flex-wrap items-center justify-between gap-3 bg-[#101722]/80 border border-[#2A3441]">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-tactical-green" />
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">YOUR SCENARIO:</span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-slate-400">Weather:</span>
            <span className="font-semibold text-slate-100">{customWeather.replace("_", " ")}</span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-slate-400">Resources:</span>
            <span className="font-semibold text-tactical-green">{Math.round(customResources * 100)}%</span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-slate-400">Time:</span>
            <span className="font-semibold text-slate-100">{customTime} Hours</span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-slate-400">Terrain Rule:</span>
            <span className="font-semibold text-tactical-amber">
              {customTerrain === "AVOID_WATER" ? "Avoid Water" : customTerrain === "AVOID_DIFFICULT" ? "Avoid Slopes" : "Any Terrain"}
            </span>
          </div>

          <div className="flex items-center space-x-1 hidden sm:flex">
            <span className="text-slate-400">Confidence:</span>
            <span className="font-semibold text-tactical-blue">{Math.round(customConfidence * 100)}%</span>
          </div>
        </div>

        {/* Edit & Run Trigger Actions */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setIsEditDrawerOpen(true)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-btn bg-[#1A2330] border border-[#2A3441] text-tactical-blue hover:text-white hover:border-tactical-blue transition-all"
          >
            <Edit3 className="w-3 h-3" />
            <span>[ Edit Scenario ]</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-btn bg-tactical-green/20 text-tactical-green border border-tactical-green/40 hover:bg-tactical-green hover:text-black font-semibold transition-all"
          >
            Run
          </button>
        </div>
      </div>

      {/* 3. Compact Scenario Edit Modal / Drawer (Section 9) */}
      {isEditDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#131A24] border border-tactical-blue/40 rounded-panel p-6 shadow-2xl space-y-4 font-mono text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#2A3441] pb-2.5">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-tactical-blue" />
                <h3 className="text-sm font-bold text-slate-100 uppercase">Adjust Scenario Parameters</h3>
              </div>
              <button onClick={() => setIsEditDrawerOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Weather */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Weather Condition</label>
                <select
                  value={customWeather}
                  onChange={(e) => setCustomWeather(e.target.value as WeatherCondition)}
                  className="w-full bg-[#0B0F14] border border-[#2A3441] rounded p-2 text-slate-100 text-xs focus:border-tactical-green"
                >
                  <option value="NORMAL">Clear Skies (10/100 impact)</option>
                  <option value="LIGHT_RAIN">Light Rain (30/100 impact)</option>
                  <option value="HIGH_WIND">High Wind / Gale (55/100 impact)</option>
                  <option value="HEAVY_RAIN">Heavy Monsoon Rain (70/100 impact)</option>
                  <option value="POOR_CONDITIONS">Severe Storm (90/100 impact)</option>
                </select>
              </div>

              {/* Resources */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300 font-semibold">
                  <span>Available Resources:</span>
                  <span className="text-tactical-green font-bold">{Math.round(customResources * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={customResources}
                  onChange={(e) => setCustomResources(parseFloat(e.target.value))}
                  className="w-full accent-tactical-green cursor-pointer"
                />
              </div>

              {/* Time Limit */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300 font-semibold">
                  <span>Time Limit Cutoff:</span>
                  <span className="text-tactical-amber font-bold">{customTime} Hours</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="16"
                  step="1"
                  value={customTime}
                  onChange={(e) => setCustomTime(parseInt(e.target.value, 10))}
                  className="w-full accent-tactical-amber cursor-pointer"
                />
              </div>

              {/* Terrain Rule */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Terrain Routing Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["ANY", "AVOID_DIFFICULT", "AVOID_WATER"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setCustomTerrain(mode)}
                      className={`p-2 rounded border text-[11px] transition-all ${
                        customTerrain === mode
                          ? "bg-tactical-green/20 border-tactical-green text-tactical-green font-bold"
                          : "bg-[#0B0F14] border-[#2A3441] text-slate-400 hover:text-white"
                      }`}
                    >
                      {mode === "ANY" ? "Any Terrain" : mode === "AVOID_DIFFICULT" ? "Avoid Slopes" : "Avoid Water"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#2A3441]">
              <button
                type="button"
                onClick={() => setIsEditDrawerOpen(false)}
                className="px-3.5 py-1.5 rounded-btn bg-[#1A2330] text-slate-300 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCustomAndRun}
                className="px-5 py-1.5 rounded-btn bg-tactical-green text-black font-bold text-xs hover:bg-tactical-green/90"
              >
                Apply & Run Simulation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
