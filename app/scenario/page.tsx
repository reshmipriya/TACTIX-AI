"use client";

import { useState, useMemo } from "react";
import { 
  FlaskConical, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  Check, 
  AlertTriangle, 
  X,
  Sliders, 
  TrendingUp, 
  TrendingDown,
  Layers,
  HelpCircle,
  RefreshCw,
  Send
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  LineChart, 
  Line 
} from "recharts";
import { 
  SCENARIOS, 
  computeScenarioDeltas, 
  runSimulation 
} from "@/lib/scenario/scenarioStore";
import { WeatherCondition } from "@/lib/environment/types";
import { AICopilot } from "@/components/AI/AICopilot";
import { useViewMode } from "@/lib/context/ViewModeContext";

export default function ScenarioLabPage() {
  const { openWhyModal } = useViewMode();
  const baseScenario = SCENARIOS[0];
  const [baseRun] = useState(() => runSimulation(baseScenario));

  // Current Working What-If Controls (Section 20)
  const [weather, setWeather] = useState<WeatherCondition>("HEAVY_RAIN");
  const [resourceLevel, setResourceLevel] = useState<number>(0.55);
  const [timeLimit, setTimeLimit] = useState<number>(5);
  const [intelConfidence, setIntelConfidence] = useState<number>(0.62);
  const [terrainCondition, setTerrainCondition] = useState<"ANY" | "AVOID_DIFFICULT" | "AVOID_WATER">("AVOID_WATER");

  // Committed Simulation Run
  const [committedParams, setCommittedParams] = useState({
    weather: "HEAVY_RAIN" as WeatherCondition,
    resourceLevel: 0.55,
    timeLimit: 5,
    intelConfidence: 0.62,
    terrainCondition: "AVOID_WATER" as "ANY" | "AVOID_DIFFICULT" | "AVOID_WATER",
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [aiDeltaExplanation, setAiDeltaExplanation] = useState<string | null>(null);
  const [isAiExplaining, setIsAiExplaining] = useState(false);

  // Check if conditions have changed since last simulation (Section 21)
  const hasUnsavedChanges = 
    weather !== committedParams.weather ||
    resourceLevel !== committedParams.resourceLevel ||
    timeLimit !== committedParams.timeLimit ||
    intelConfidence !== committedParams.intelConfidence ||
    terrainCondition !== committedParams.terrainCondition;

  // Compute what-if simulation dynamically from committed parameters
  const whatIfRun = useMemo(() => {
    return runSimulation(
      baseScenario,
      committedParams.weather,
      committedParams.resourceLevel,
      committedParams.timeLimit,
      committedParams.intelConfidence
    );
  }, [committedParams, baseScenario]);

  // Compute Before / After deltas (Section 20)
  const deltas = useMemo(() => {
    return computeScenarioDeltas(baseRun, whatIfRun);
  }, [baseRun, whatIfRun]);

  // Weather Sensitivity Curve Data
  const weatherSensitivityData = [
    { condition: "Normal", Alpha: 28, Bravo: 22, Charlie: 34 },
    { condition: "Light Rain", Alpha: 36, Bravo: 29, Charlie: 42 },
    { condition: "High Wind", Alpha: 48, Bravo: 39, Charlie: 52 },
    { condition: "Heavy Rain", Alpha: 58, Bravo: 46, Charlie: 64 },
    { condition: "Severe Storm", Alpha: 74, Bravo: 62, Charlie: 82 },
  ];

  const handleRunWhatIf = () => {
    setIsSimulating(true);
    setCommittedParams({
      weather,
      resourceLevel,
      timeLimit,
      intelConfidence,
      terrainCondition,
    });
    setAiDeltaExplanation(null);

    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  const handleExplainDeltas = async () => {
    setIsAiExplaining(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: whatIfRun.scenario,
          coas: whatIfRun.coas,
          mode: "what_changed",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiDeltaExplanation(data.text);
      }
    } catch (e) {
      console.warn("AI explain delta failed:", e);
    } finally {
      setIsAiExplaining(false);
    }
  };

  const handleReset = () => {
    setWeather("HEAVY_RAIN");
    setResourceLevel(0.55);
    setTimeLimit(5);
    setIntelConfidence(0.62);
    setTerrainCondition("AVOID_WATER");
    setCommittedParams({
      weather: "HEAVY_RAIN",
      resourceLevel: 0.55,
      timeLimit: 5,
      intelConfidence: 0.62,
      terrainCondition: "AVOID_WATER",
    });
    setAiDeltaExplanation(null);
  };

  return (
    <div className="max-w-[1780px] w-full mx-auto p-4 lg:p-6 space-y-6 flex-1 font-mono">
      {/* Header Block (Section 20) */}
      <div className="workflow-card p-5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-tactical-amber/20 text-tactical-amber">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-100 uppercase tracking-wide">
                WHAT-IF SCENARIO LAB
              </h1>
              <p className="text-xs text-slate-400">
                Change a condition and see how the simulation responds with live Before &rarr; After deltas.
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-btn bg-[#1A2330] border border-[#2A3441] text-xs text-slate-300 hover:text-white hover:border-slate-400 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Comparison (Section 20 & 21) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Condition Controls */}
        <div className="lg:col-span-5 workflow-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A3441] pb-2">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-tactical-amber" />
              <span>TEST CONDITIONS</span>
            </h3>

            {hasUnsavedChanges && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-tactical-amber/20 text-tactical-amber border border-tactical-amber/40 font-bold animate-pulse">
                Condition Changed
              </span>
            )}
          </div>

          {/* 1. Weather Dropdown */}
          <div className="space-y-1.5 text-xs">
            <label className="text-slate-300 flex items-center justify-between font-semibold">
              <span>Weather</span>
              <span className="text-tactical-blue">{weather.replace("_", " ")}</span>
            </label>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value as WeatherCondition)}
              className="w-full bg-[#0B0F14] border border-[#2A3441] rounded-btn p-2.5 text-xs text-slate-100 focus:border-tactical-amber"
            >
              <option value="NORMAL">Clear Skies (Impact: 10/100)</option>
              <option value="LIGHT_RAIN">Light Rain (Impact: 30/100)</option>
              <option value="HIGH_WIND">High Wind / Gale (Impact: 55/100)</option>
              <option value="HEAVY_RAIN">Heavy Monsoon Rain (Impact: 70/100)</option>
              <option value="POOR_CONDITIONS">Severe Storm (Impact: 90/100)</option>
            </select>
          </div>

          {/* 2. Resources Slider */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300 font-semibold">
              <span>Available Resources:</span>
              <span className="text-tactical-green font-bold">{Math.round(resourceLevel * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.20"
              max="1.0"
              step="0.05"
              value={resourceLevel}
              onChange={(e) => setResourceLevel(parseFloat(e.target.value))}
              className="w-full accent-tactical-green cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>20% (Scarcity)</span>
              <span>100% (Full Capacity)</span>
            </div>
          </div>

          {/* 3. Time Available Slider */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300 font-semibold">
              <span>Time Available:</span>
              <span className="text-tactical-amber font-bold">{timeLimit} Hours</span>
            </div>
            <input
              type="range"
              min="2"
              max="16"
              step="1"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value, 10))}
              className="w-full accent-tactical-amber cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>2 Hours (Tight)</span>
              <span>16 Hours (Extended)</span>
            </div>
          </div>

          {/* 4. Information Confidence Slider */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300 font-semibold">
              <span>Information Confidence:</span>
              <span className="text-tactical-blue font-bold">{Math.round(intelConfidence * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.95"
              step="0.05"
              value={intelConfidence}
              onChange={(e) => setIntelConfidence(parseFloat(e.target.value))}
              className="w-full accent-tactical-blue cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>10% (High Uncertainty)</span>
              <span>95% (High Certainty)</span>
            </div>
          </div>

          {/* 5. Terrain Routing Preference */}
          <div className="space-y-1.5 text-xs">
            <label className="text-slate-300 block font-semibold">Terrain Preference:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["ANY", "AVOID_DIFFICULT", "AVOID_WATER"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTerrainCondition(mode)}
                  className={`p-2 rounded-btn border text-[11px] transition-all ${
                    terrainCondition === mode
                      ? "bg-tactical-green/20 border-tactical-green text-tactical-green font-bold"
                      : "bg-[#0B0F14] border-[#2A3441] text-slate-400 hover:text-white"
                  }`}
                >
                  {mode === "ANY" ? "Any Terrain" : mode === "AVOID_DIFFICULT" ? "Avoid Slopes" : "Avoid Water"}
                </button>
              ))}
            </div>
          </div>

          {/* Primary CTA (Section 21 & 31) */}
          <div className="pt-2 border-t border-[#2A3441]">
            <button
              onClick={handleRunWhatIf}
              disabled={isSimulating}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-btn bg-tactical-amber text-black font-bold text-xs uppercase hover:bg-tactical-amber/90 transition-all shadow-lg shadow-tactical-amber/10"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>RECALCULATING SIMULATION...</span>
                </>
              ) : (
                <>
                  <span>RUN WHAT-IF SIMULATION</span>
                  <Send className="w-3.5 h-3.5 fill-black" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Before -> After Comparison & What Changed (Section 20) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Side-by-Side Delta Comparison */}
          <div className="workflow-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A3441] pb-2">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                BEFORE &rarr; AFTER SIMULATION COMPARISON
              </h3>
              <span className="text-[10px] text-slate-400">Deterministic Engine Diffs</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {deltas.map((d) => (
                <div key={d.coaName} className="bg-[#0B0F14] p-3.5 rounded-btn border border-[#2A3441] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">Option {d.coaName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      d.whatIfStatus === "VALID" ? "bg-tactical-green/20 text-tactical-green" : "bg-tactical-red/20 text-tactical-red"
                    }`}>
                      {d.whatIfStatus === "VALID" ? "✓ VALID" : "✗ INVALID"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase">Risk Shift</span>
                    <div className="flex items-center space-x-2 text-base font-bold">
                      <span className="text-slate-400">{d.baseRisk}</span>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-100">{d.whatIfRisk}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        d.riskDelta > 0 ? "bg-tactical-red/20 text-tactical-red" : d.riskDelta < 0 ? "bg-tactical-green/20 text-tactical-green" : "text-slate-400"
                      }`}>
                        {d.riskDelta > 0 ? `+${d.riskDelta}` : d.riskDelta}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-1 border-t border-[#2A3441] flex justify-between">
                    <span>Duration:</span>
                    <span className="text-slate-200">{d.whatIfDuration}h ({d.durationDelta > 0 ? `+${d.durationDelta}` : d.durationDelta}h)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Explanation Trigger (Section 20) */}
            <div className="flex justify-end pt-1">
              <button
                onClick={handleExplainDeltas}
                disabled={isAiExplaining}
                className="flex items-center space-x-2 px-4 py-2 rounded-btn bg-tactical-green text-black font-bold text-xs hover:bg-tactical-green/90 transition-all disabled:opacity-50 shadow-md shadow-tactical-green/10"
              >
                <Sparkles className="w-3.5 h-3.5 fill-black" />
                <span>{isAiExplaining ? "EXPLAINING DIFF..." : "WHY DID THE RESULTS CHANGE? (AI)"}</span>
              </button>
            </div>
          </div>

          {/* AI Explanation Result Box */}
          {aiDeltaExplanation && (
            <div className="workflow-card p-5 border-tactical-green/40 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center space-x-2 text-tactical-green text-xs font-bold uppercase">
                <Sparkles className="w-4 h-4" />
                <span>WHY DID THE RESULTS CHANGE?</span>
              </div>
              <div className="bg-[#0B0F14] p-3.5 rounded text-xs text-slate-200 whitespace-pre-line leading-relaxed border border-[#2A3441]">
                {aiDeltaExplanation}
              </div>
            </div>
          )}

          {/* Sensitivity Graph */}
          <div className="workflow-card p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
              WEATHER SENSITIVITY CURVE
            </h4>
            <div className="h-40 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weatherSensitivityData}>
                  <XAxis dataKey="condition" stroke="#93A1B4" fontSize={10} />
                  <YAxis stroke="#93A1B4" fontSize={10} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: "#131A24", borderColor: "#2A3441" }} />
                  <Line type="monotone" dataKey="Alpha" stroke="#00D9A3" strokeWidth={2} name="Option Alpha" />
                  <Line type="monotone" dataKey="Bravo" stroke="#3B82F6" strokeWidth={2} name="Option Bravo" />
                  <Line type="monotone" dataKey="Charlie" stroke="#FFB020" strokeWidth={2} name="Option Charlie" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      <AICopilot
        scenario={whatIfRun.scenario}
        coas={whatIfRun.coas}
        onRequestAnalysis={() => {}}
      />
    </div>
  );
}
