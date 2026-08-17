"use client";

import { useState } from "react";
import { ShieldCheck, BarChart3, HelpCircle, Info, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { COA } from "@/lib/simulation/types";
import { useViewMode } from "@/lib/context/ViewModeContext";

interface RiskBreakdownProps {
  coa: COA;
  isAdvancedMode?: boolean;
}

export function RiskBreakdown({ coa, isAdvancedMode = false }: RiskBreakdownProps) {
  const { openWhyModal } = useViewMode();
  const [isFullDecompOpen, setIsFullDecompOpen] = useState(isAdvancedMode);
  const { overall, contributions, riskBand, riskColor } = coa.risk;

  const simpleFactors = [
    { label: "Weather Impact", value: contributions.weather, max: 22, color: "#3B82F6", hint: "Precipitation & wind friction" },
    { label: "Terrain Difficulty", value: contributions.terrain, max: 22, color: "#8B6F47", hint: "Slope & ground roughness" },
    { label: "Resource Strain", value: contributions.logistics, max: 20, color: "#00D9A3", hint: "Fuel & equipment draw" },
    { label: "Information Uncertainty", value: contributions.intelligence, max: 18, color: "#FFB020", hint: "Sensor variance & gaps" },
  ];

  const fullFactors = [
    ...simpleFactors,
    { label: "Time Pressure", value: contributions.time, max: 10, color: "#C9A24B", hint: "Duration vs deadline" },
    { label: "Constraint Stress", value: contributions.constraints, max: 8, color: "#FF3B5C", hint: "Rule & corridor penalties" },
  ];

  const handleWhyClick = () => {
    openWhyModal(
      `Understanding Risk for Option ${coa.name}`,
      `Weather has a relatively large effect (+${contributions.weather} pts) on this simulated result due to active conditions.\n\n` +
      `Terrain difficulty contributes +${contributions.terrain} pts along this specific path. Resource utilization adds +${contributions.logistics} pts, while information uncertainty adds +${contributions.intelligence} pts.\n\n` +
      `All factors combine deterministically into the total score of ${overall}/100.`,
      fullFactors.map(f => ({ label: f.label, value: `+${f.value} pts`, color: f.color }))
    );
  };

  return (
    <div id="risk-section" className="tactical-panel p-5 space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A3441] pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-tactical-amber/20 text-tactical-amber">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
              SIMULATED RISK · OPTION {coa.name.toUpperCase()}
            </h3>
            <p className="text-xs text-tactical-muted">
              Traceable, explainable calculation based on environmental and operational factors.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleWhyClick}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#1A2330] border border-[#2A3441] text-tactical-green hover:border-tactical-green transition-all text-xs"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Why?</span>
          </button>

          <span
            className="text-sm sm:text-base font-bold px-3 py-1 rounded border"
            style={{
              color: riskColor,
              borderColor: `${riskColor}50`,
              backgroundColor: `${riskColor}15`,
            }}
          >
            {overall} / 100 ({riskBand})
          </span>
        </div>
      </div>

      {/* Visual Factor Bars (Section 13) */}
      <div className="space-y-3 text-xs">
        {(isFullDecompOpen || isAdvancedMode ? fullFactors : simpleFactors).map((f) => {
          const pct = Math.min(100, Math.round((f.value / f.max) * 100));
          return (
            <div key={f.label} className="space-y-1 bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                  <span className="text-slate-200 font-semibold">{f.label}</span>
                  <span className="text-[10px] text-tactical-muted hidden sm:inline">({f.hint})</span>
                </div>
                <span className="font-bold text-slate-100">
                  +{f.value} pts <span className="text-[10px] text-tactical-muted">/ {f.max} max</span>
                </span>
              </div>

              <div className="w-full bg-[#1A2330] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: f.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Progressive Disclosure Toggle */}
      <div className="flex items-center justify-between pt-1 border-t border-[#2A3441] text-xs">
        <span className="text-tactical-muted text-[11px]">
          {isFullDecompOpen ? "Showing all 6 weighted formula factors." : "Showing primary risk drivers."}
        </span>

        <button
          onClick={() => setIsFullDecompOpen(!isFullDecompOpen)}
          className="flex items-center space-x-1 text-tactical-blue hover:text-white transition-colors"
        >
          <span>{isFullDecompOpen ? "Show Summary" : "Understand Risk (Full Breakdown)"}</span>
          {isFullDecompOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
