"use client";

import { useState } from "react";
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
import { useViewMode } from "@/lib/context/ViewModeContext";

export default function MissionCommandPage() {
  const { viewMode } = useViewMode();
  const isAdvanced = viewMode === "advanced";

  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>("describe");
  const [currentScenario, setCurrentScenario] = useState<MissionScenario>(SCENARIOS[0]);
  const [simResult, setSimResult] = useState(() => runSimulation(SCENARIOS[0]));
  const [selectedCOA, setSelectedCOA] = useState<COA>(simResult.preferredCOA);
  const [isLoading, setIsLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | undefined>(simResult.aiAnalysis);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [interpretedParams, setInterpretedParams] = useState<MissionParams | undefined>({
    weather: SCENARIOS[0].weather_condition,
    resource_level: SCENARIOS[0].resource_level,
    time_limit: SCENARIOS[0].time_limit,
    terrain_preference: SCENARIOS[0].terrain_preference,
  });

  // Handle Natural Language Mission Input & Simulation
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
    }, 1600);
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
    }, 1200);
  };

  // Handle AI Analysis Mode Request
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
      {/* Staged Loader for Simulation Processing */}
      <StagedLoader isLoading={isLoading} />

      {/* Workflow Stage Progress Indicator (Section 6) */}
      <WorkflowIndicator
        currentStage={workflowStage}
        onSelectStage={(stage) => setWorkflowStage(stage)}
      />

      {/* Stage 1: Mission Command Input & Scenario Confirmation Card */}
      <MissionInput
        currentScenario={currentScenario}
        onSimulate={handleSimulate}
        onSelectPreset={handleSelectPreset}
        isLoading={isLoading}
        interpretedParams={interpretedParams}
        isAdvancedMode={isAdvanced}
      />

      {/* Stage 2 & 3: Environment Map + Simulated Options Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Map & Options Column */}
        <div className={isAdvanced ? "xl:col-span-8 space-y-6" : "xl:col-span-12 space-y-6"}>
          <TacticalMap
            scenario={simResult.scenario}
            weather={simResult.weather}
            coas={simResult.coas}
            intelReports={simResult.intelReports}
            constraints={simResult.constraints}
            selectedCOA={selectedCOA}
            onSelectCOA={setSelectedCOA}
            isAdvancedMode={isAdvanced}
          />

          <COAComparison
            coas={simResult.coas}
            selectedCOA={selectedCOA}
            onSelectCOA={setSelectedCOA}
            isAdvancedMode={isAdvanced}
          />
        </div>

        {/* Advanced Telemetry Column (Exposed only in Advanced View Mode) */}
        {isAdvanced && (
          <div className="xl:col-span-4 space-y-4 animate-in fade-in duration-200">
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

      {/* Stage 4: Explainable Risk Summary & Grounded AI Decision Analyst */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6">
          <RiskBreakdown coa={selectedCOA} isAdvancedMode={isAdvanced} />
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

      {/* Persistent Floating AI Copilot */}
      <AICopilot
        scenario={simResult.scenario}
        coas={simResult.coas}
        onRequestAnalysis={handleRequestMode}
      />
    </div>
  );
}
