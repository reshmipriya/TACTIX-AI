"use client";

import { useState } from "react";
import { BarChart3, HelpCircle, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { COA } from "@/lib/simulation/types";
import { useViewMode } from "@/lib/context/ViewModeContext";

interface RiskBreakdownProps {
  coa: COA;
}

export function RiskBreakdown({ coa }: RiskBreakdownProps) {
  const { openWhyModal } = useViewMode();
  const [isFullDecompOpen, setIsFullDecompOpen] = useState(false);
  const { overall, contributions, riskBand, riskColor } = coa.risk;

  // Chapter 15: Labelled bars with real computed magnitudes
  const riskFactors = [
    { label: "Weather Impact", value: contributions.weather, max: 22, color: "#3B82F6", hint: "Precipitation, wind, storm intensity (22% weight)" },
    { label: "Terrain Difficulty", value: contributions.terrain, max: 22, color: "#8B6F47", hint: "Slope gradient & ground roughness (22% weight)" },
    { label: "Resource Strain", value: contributions.logistics, max: 20, color: "#00D9A3", hint: "Resource availability & vehicle draw (20% weight)" },
    { label: "Information Uncertainty", value: contributions.intelligence, max: 18, color: "#FFB020", hint: "Sensor reliability & observation gaps (18% weight)" },
    { label: "Time Pressure", value: contributions.time, max: 10, color: "#C9A24B", hint: "Estimated duration vs deadline cutoff (10% weight)" },
    { label: "Constraint Impact", value: contributions.constraints, max: 8, color: "#FF3B5C", hint: "Corridor boundaries & rule checks (8% weight)" },
  ];

  const handleWhyClick = () => {
    openWhyModal(
      `Understanding Risk for Option ${coa.name}`,
      `Risk is calculated from the simulation outputs:\n\n` +
      `• Weather impact adds +${contributions.weather} pts.\n` +
      `• Terrain difficulty adds +${contributions.terrain} pts.\n` +
      `• Resource strain adds +${contributions.logistics} pts.\n` +
      `• Information uncertainty adds +${contributions.intelligence} pts.\n` +
      `• Time pressure adds +${contributions.time} pts.\n` +
      `• Constraint impact adds +${contributions.constraints} pts.\n\n` +
      `Total score = ${overall} / 100 (${riskBand} risk band).`,
      riskFactors.map(f => ({ label: f.label, value: `+${f.value} pts`, color: f.color }))
    );
  };

  return (
    <div id="risk-section" className="tactical-panel p-5 space-y-4 font-mono">
      
      {/* Header Block (Chapter 15) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A3441] pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-tactical-amber/20 text-tactical-amber">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
              OVERALL SIMULATED RISK
            </h3>
            <p className="text-xs text-tactical-muted">
              Risk is calculated from the simulation outputs.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleWhyClick}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#1A2330] border border-[#2A3441] text-tactical-green hover:border-tactical-green transition-all text-xs"
          >
            <HelpCircle className="w-3 h-3" />
            <span>[ Why? ]</span>
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

      {/* Labelled Bars (Chapter 15) */}
      <div className="space-y-2.5 text-xs">
        {(isFullDecompOpen ? riskFactors : riskFactors.slice(0, 4)).map((f) => {
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

      {/* [ Understand Risk ] Action (Chapter 15) */}
      <div className="flex items-center justify-between pt-1 border-t border-[#2A3441] text-xs">
        <span className="text-tactical-muted text-[11px]">
          {isFullDecompOpen ? "Showing all 6 weighted formula factors." : "Showing primary risk drivers."}
        </span>

        <button
          onClick={() => setIsFullDecompOpen(!isFullDecompOpen)}
          className="flex items-center space-x-1 text-tactical-blue hover:text-white transition-colors"
        >
          <span>{isFullDecompOpen ? "[ Show Summary ]" : "[ Understand Risk ]"}</span>
          {isFullDecompOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

    </div>
  );
}
