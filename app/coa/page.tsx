"use client";

import { useState } from "react";
import { 
  GitBranch, 
  Layers, 
  BarChart3, 
  ShieldAlert, 
  Award, 
  Compass, 
  ChevronRight,
  TrendingDown,
  Clock,
  Fuel,
  Activity
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend 
} from "recharts";
import { COACard } from "@/components/COA/COACard";
import { RiskBreakdown } from "@/components/Risk/RiskBreakdown";
import { AICopilot } from "@/components/AI/AICopilot";
import { SCENARIOS, runSimulation } from "@/lib/scenario/scenarioStore";
import { COA } from "@/lib/simulation/types";

export default function COAMatrixPage() {
  const [simResult] = useState(() => runSimulation(SCENARIOS[0]));
  const [selectedCOA, setSelectedCOA] = useState<COA>(simResult.preferredCOA);

  const { coas, scenario } = simResult;
  const [alpha, bravo, charlie] = coas;

  // Recharts Multi-Metric Comparison Data
  const comparisonData = [
    {
      metric: "Duration (h)",
      Alpha: alpha.metrics.estimated_duration_hours,
      Bravo: bravo.metrics.estimated_duration_hours,
      Charlie: charlie.metrics.estimated_duration_hours,
    },
    {
      metric: "Fuel Burn (%)",
      Alpha: Math.round(alpha.metrics.resource_consumption * 100),
      Bravo: Math.round(bravo.metrics.resource_consumption * 100),
      Charlie: Math.round(charlie.metrics.resource_consumption * 100),
    },
    {
      metric: "Terrain Friction",
      Alpha: alpha.metrics.terrain_exposure,
      Bravo: bravo.metrics.terrain_exposure,
      Charlie: charlie.metrics.terrain_exposure,
    },
    {
      metric: "Weather Stress",
      Alpha: alpha.metrics.weather_exposure,
      Bravo: bravo.metrics.weather_exposure,
      Charlie: charlie.metrics.weather_exposure,
    },
    {
      metric: "Overall Risk",
      Alpha: alpha.risk.overall,
      Bravo: bravo.risk.overall,
      Charlie: charlie.risk.overall,
    },
  ];

  // Radar Chart Data for Multi-Dimensional Profile
  const radarData = [
    { subject: "Speed", Alpha: 90, Bravo: 70, Charlie: 55, fullMark: 100 },
    { subject: "Fuel Efficiency", Alpha: 60, Bravo: 92, Charlie: 68, fullMark: 100 },
    { subject: "Terrain Safety", Alpha: 55, Bravo: 78, Charlie: 88, fullMark: 100 },
    { subject: "Weather Resilience", Alpha: 65, Bravo: 80, Charlie: 85, fullMark: 100 },
    { subject: "Intel Clarity", Alpha: 68, Bravo: 82, Charlie: 74, fullMark: 100 },
    { subject: "Constraint Margin", Alpha: 75, Bravo: 90, Charlie: 80, fullMark: 100 },
  ];

  return (
    <div className="max-w-[1780px] w-full mx-auto p-4 lg:p-6 space-y-6 flex-1">
      {/* Header */}
      <div className="tactical-panel p-5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-tactical-green/20 text-tactical-green">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-mono text-xl font-bold text-slate-100 uppercase tracking-wide">
                COURSES OF ACTION (COA) COMPARISON MATRIX
              </h1>
              <p className="text-xs text-tactical-muted font-mono">
                Multi-Objective Optimization Trade-Offs · Baseline: {scenario.name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-slate-400">Preferred Option:</span>
            <span className="px-2.5 py-1 rounded bg-tactical-green/20 text-tactical-green font-bold border border-tactical-green/40">
              {simResult.preferredCOA.name} ({simResult.preferredCOA.risk.overall}/100 Risk)
            </span>
          </div>
        </div>
      </div>

      {/* 3 COA Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coas.map((coa) => (
          <COACard
            key={coa.id}
            coa={coa}
            isSelected={selectedCOA.name === coa.name}
            onSelect={() => setSelectedCOA(coa)}
          />
        ))}
      </div>

      {/* Deep-Dive Comparative Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Bar Comparison Chart */}
        <div className="lg:col-span-7 tactical-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#2A3441] pb-2">
            <h3 className="font-mono text-xs font-semibold text-slate-100 uppercase tracking-wide flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-tactical-blue" />
              <span>DIRECT METRIC COMPARISON ACROSS ALTERNATIVES</span>
            </h3>
            <span className="text-[10px] font-mono text-tactical-muted">Normalized Metrics</span>
          </div>

          <div className="h-72 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="metric" stroke="#93A1B4" fontSize={11} tickLine={false} />
                <YAxis stroke="#93A1B4" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#131A24", borderColor: "#2A3441", borderRadius: "6px", fontFamily: "JetBrains Mono" }}
                  itemStyle={{ fontSize: "11px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="Alpha" fill="#00D9A3" name="COA Alpha (Speed)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Bravo" fill="#3B82F6" name="COA Bravo (Resources)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Charlie" fill="#FFB020" name="COA Charlie (Environment)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Radar Chart Profile */}
        <div className="lg:col-span-5 tactical-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#2A3441] pb-2">
            <h3 className="font-mono text-xs font-semibold text-slate-100 uppercase tracking-wide flex items-center space-x-2">
              <Activity className="w-4 h-4 text-tactical-green" />
              <span>MULTI-DIMENSIONAL COA PROFILE</span>
            </h3>
            <span className="text-[10px] font-mono text-tactical-muted">Capability Radar</span>
          </div>

          <div className="h-72 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius={90}>
                <PolarGrid stroke="#2A3441" />
                <PolarAngleAxis dataKey="subject" stroke="#93A1B4" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#2A3441" fontSize={8} />
                <Radar name="Alpha" dataKey="Alpha" stroke="#00D9A3" fill="#00D9A3" fillOpacity={0.25} />
                <Radar name="Bravo" dataKey="Bravo" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.25} />
                <Radar name="Charlie" dataKey="Charlie" stroke="#FFB020" fill="#FFB020" fillOpacity={0.25} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                <Tooltip contentStyle={{ backgroundColor: "#131A24", borderColor: "#2A3441" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Selected COA Risk Decomposition & Waypoint Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <RiskBreakdown coa={selectedCOA} />
        </div>

        <div className="lg:col-span-6 tactical-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#2A3441] pb-2">
            <h3 className="font-mono text-xs font-semibold text-slate-100 uppercase tracking-wide flex items-center space-x-2">
              <Compass className="w-4 h-4 text-tactical-amber" />
              <span>WAYPOINT & CORRIDOR TRANSIT TELEMETRY</span>
            </h3>
            <span className="text-[10px] font-mono text-tactical-green">
              {selectedCOA.pathCells.length} Transit Nodes
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
            {selectedCOA.pathCells.map((cell, idx) => (
              <div
                key={cell.cell_id}
                className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441] flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#1A2330] border border-[#2A3441] text-[10px] flex items-center justify-center text-slate-300 font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-slate-200 font-semibold">{cell.cell_id}</span>
                    <span className="text-[10px] text-tactical-muted block">
                      {cell.latitude}, {cell.longitude}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Elevation</span>
                    <span className="text-slate-100">{cell.elevation}m ({cell.slope}°)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Land Cover</span>
                    <span className="text-tactical-green capitalize">{cell.land_cover}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AICopilot
        scenario={scenario}
        coas={coas}
        onRequestAnalysis={() => {}}
      />
    </div>
  );
}
