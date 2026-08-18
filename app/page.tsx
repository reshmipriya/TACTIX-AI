"use client";

import { useState } from "react";
import Link from "next/link";
import { StagedLoader } from "@/components/Layout/StagedLoader";
import { WorkflowIndicator, WorkflowStage } from "@/components/Layout/WorkflowIndicator";
import { MissionInput } from "@/components/Mission/MissionInput";
import { TacticalMap } from "@/components/Map/TacticalMap";
import { TerrainPanel } from "@/components/Terrain/TerrainPanel";
import { WeatherPanel } from "@/components/Weather/WeatherPanel";
import { LogisticsPanel } from "@/components/Logistics/LogisticsPanel";
import { IntelligencePanel } from "@/components/Intelligence/IntelligencePanel";
import { ConstraintsPanel } from "@/components/Constraints/ConstraintsPanel";
import { COAComparison } from "@/components/COA/COAComparison";
import { RiskBreakdown } from "@/components/Risk/RiskBreakdown";
import { AIAnalysisPanel } from "@/components/AI/AIAnalysisPanel";
import { AICopilot } from "@/components/AI/AICopilot";
import { 
  SCENARIOS, 
  runSimulation 
} from "@/lib/scenario/scenarioStore";
import { COA, MissionScenario } from "@/lib/simulation/types";
import { AIAnalysisResponse, AnalysisMode, MissionParams } from "@/lib/ai/types";
import { ChevronDown, ChevronUp, Database, FlaskConical, ArrowRight, Sparkles } from "lucide-react";

export default function MissionCommandPage() {
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>("describe");
  const [currentScenario, setCurrentScenario] = useState<MissionScenario>(SCENARIOS[0]);
  const [simResult, setSimResult] = useState(() => runSimulation(SCENARIOS[0]));
  const [selectedCOA, setSelectedCOA] = useState<COA>(simResult.preferredCOA);
  const [isLoading, setIsLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | undefined>(simResult.aiAnalysis);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isTechnicalTelemetryOpen, setIsTechnicalTelemetryOpen] = useState(false);

  const [interpretedParams, setInterpretedParams] = useState<MissionParams | undefined>({
    weather: SCENARIOS[0].weather_condition,
    resource_level: SCENARIOS[0].resource_level,
    time_limit: SCENARIOS[0].time_limit,
    terrain_preference: SCENARIOS[0].terrain_preference,
  });

  // Handle Natural Language Mission Input & Simulation (Section 5, 7, 9)
  const handleSimulate = async (missionText: string, manualParams?: any) => {
    setIsLoading(true);
    let extractedParams: MissionParams | undefined = manualParams;

    if (!manualParams) {
      try {
        const interpretRes = await fetch("/api/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mission_text: missionText,
            study_area_id: currentScenario.scenario_id,
          }),
        });

        if (interpretRes.ok) {
          const data = await interpretRes.json();
          extractedParams = data.params;
          setInterpretedParams(data.params);
        }
      } catch (e) {
        console.warn("Using fallback local mission interpreter:", e);
      }
    } else {
      setInterpretedParams(manualParams);
    }

    const newSim = runSimulation(
      currentScenario,
      extractedParams?.weather,
      extractedParams?.resource_level,
      extractedParams?.time_limit
    );

    setTimeout(() => {
      setSimResult(newSim);
      setSelectedCOA(newSim.preferredCOA);
      setAiAnalysis(newSim.aiAnalysis);
      setWorkflowStage("compare");
      setIsLoading(false);
    }, 1400);
  };

  // Handle Preset Scenario Selection
  const handleSelectPreset = (scenarioId: string) => {
    const matched = SCENARIOS.find((s) => s.scenario_id === scenarioId) || SCENARIOS[0];
    setCurrentScenario(matched);
    setIsLoading(true);

    const newSim = runSimulation(matched);
    setInterpretedParams({
      weather: matched.weather_condition,
      resource_level: matched.resource_level,
      time_limit: matched.time_limit,
      terrain_preference: matched.terrain_preference,
    });

    setTimeout(() => {
      setSimResult(newSim);
      setSelectedCOA(newSim.preferredCOA);
      setAiAnalysis(newSim.aiAnalysis);
      setWorkflowStage("compare");
      setIsLoading(false);
    }, 1000);
  };

  // Handle AI Analysis Mode Request (Section 18)
  const handleRequestMode = async (mode: AnalysisMode) => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: simResult.scenario,
          coas: simResult.coas,
          mode,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
      }
    } catch (e) {
      console.warn("AI analyze request failed, using local result:", e);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-[1780px] w-full mx-auto p-4 lg:p-6 space-y-6 flex-1">
      {/* Staged Loader for Simulation Processing (Section 10) */}
      <StagedLoader isLoading={isLoading} />

      {/* 1. MISSION COMMAND BAR & SCENARIO CONFIRMATION STRIP (Section 5, 7, 9) */}
      <MissionInput
        currentScenario={currentScenario}
        onSimulate={handleSimulate}
        onSelectPreset={handleSelectPreset}
        isLoading={isLoading}
        interpretedParams={interpretedParams}
      />

      {/* 2. RESULT WORKSPACE: SPATIAL MAP + SIMULATED OPTIONS (Section 5, 11, 13, 14) */}
      <div className="space-y-6">
        <TacticalMap
          scenario={simResult.scenario}
          weather={simResult.weather}
          coas={simResult.coas}
          intelReports={simResult.intelReports}
          constraints={simResult.constraints}
          selectedCOA={selectedCOA}
          onSelectCOA={setSelectedCOA}
        />

        <COAComparison
          coas={simResult.coas}
          selectedCOA={selectedCOA}
          onSelectCOA={setSelectedCOA}
        />
      </div>

      {/* 3. EXPLAINABLE RISK SUMMARY & AI DECISION ANALYST (Section 16, 17, 18) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6">
          <RiskBreakdown coa={selectedCOA} />
        </div>

        <div className="lg:col-span-6">
          <AIAnalysisPanel
            scenario={simResult.scenario}
            coas={simResult.coas}
            analysis={aiAnalysis}
            onRequestMode={handleRequestMode}
            isLoading={isAiLoading}
          />
        </div>
      </div>

      {/* 4. WHAT-IF ENTRY BANNER (Section 5 & 20) */}
      <div id="whatif-section" className="workflow-card p-5 bg-gradient-to-r from-[#141F2D] via-[#111A24] to-[#101722] border border-tactical-amber/30 flex flex-wrap items-center justify-between gap-4 font-mono">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-tactical-amber/20 text-tactical-amber">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Test Scenario Variations in the What-If Lab
            </h4>
            <p className="text-xs text-slate-400">
              Change a condition and see how the simulation responds with live Before &rarr; After deltas.
            </p>
          </div>
        </div>

        <Link
          href="/scenario"
          className="flex items-center space-x-2 px-5 py-2.5 rounded-btn bg-tactical-amber text-black font-bold text-xs uppercase hover:bg-tactical-amber/90 transition-all shadow-md shadow-tactical-amber/10"
        >
          <span>OPEN WHAT-IF LAB</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 5. PROGRESSIVE DISCLOSURE: TECHNICAL TELEMETRY DRAWER (Section 23 & 27) */}
      <div className="workflow-card p-4 font-mono space-y-3 bg-[#0E1520]/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-tactical-blue" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Technical Telemetry & Engineering Domain Layers
            </span>
          </div>

          <button
            onClick={() => setIsTechnicalTelemetryOpen(!isTechnicalTelemetryOpen)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-btn bg-[#16202E] border border-[#2A3441] text-xs text-tactical-blue hover:text-white transition-all"
          >
            <span>{isTechnicalTelemetryOpen ? "[ Hide Technical Details ]" : "[ View Technical Details ]"}</span>
            {isTechnicalTelemetryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isTechnicalTelemetryOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 pt-3 border-t border-[#2A3441] animate-in fade-in duration-150">
            <TerrainPanel
              meanElevation={28.4}
              meanSlope={7.2}
              meanRoughness={2.8}
              terrainScore={selectedCOA.metrics.terrain_exposure}
            />

            <WeatherPanel weather={simResult.weather} />

            <LogisticsPanel logistics={simResult.logistics} />

            <IntelligencePanel reports={simResult.intelReports} />

            <ConstraintsPanel
              constraints={simResult.constraints}
              coas={simResult.coas}
            />
          </div>
        )}
      </div>

      {/* Persistent Floating AI Copilot (Section 19) */}
      <AICopilot
        scenario={simResult.scenario}
        coas={simResult.coas}
        onRequestAnalysis={handleRequestMode}
      />
    </div>
  );
}
