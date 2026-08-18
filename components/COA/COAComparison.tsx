"use client";

import { GitBranch, Sparkles, HelpCircle, Check, Award, ArrowRight } from "lucide-react";
import { COACard } from "./COACard";
import { COA } from "@/lib/simulation/types";

interface COAComparisonProps {
  coas: COA[];
  selectedCOA?: COA;
  onSelectCOA: (coa: COA) => void;
}

export function COAComparison({
  coas,
  selectedCOA,
  onSelectCOA,
}: COAComparisonProps) {
  const preferredCOA = coas.find((c) => c.isPreferred) || coas[0];

  return (
    <div id="coa-section" className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A3441]/70 pb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-tactical-green/20 text-tactical-green">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              SIMULATED OPTIONS
            </h3>
            <p className="text-xs text-slate-400">
              Three computational alternatives evaluated under active scenario conditions.
            </p>
          </div>
        </div>

        {/* Preferred Criterion Explanation (Section 15) */}
        <div className="flex items-center space-x-1.5 text-xs text-tactical-green bg-tactical-green/10 px-2.5 py-1 rounded border border-tactical-green/30">
          <Award className="w-3.5 h-3.5" />
          <span>Option {preferredCOA.name}: Lowest simulated risk among valid alternatives</span>
        </div>
      </div>

      {/* 3 Decision Option Cards (Section 13) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {coas.map((coa) => (
          <COACard
            key={coa.id}
            coa={coa}
            isSelected={selectedCOA?.name === coa.name}
            onSelect={() => onSelectCOA(coa)}
          />
        ))}
      </div>

      {/* Trade-Off Summary Strip (Section 14) */}
      <div className="workflow-card p-3.5 px-4 bg-[#101722]/90 border border-[#2A3441] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex-shrink-0">
          TRADE-OFF SUMMARY:
        </span>
        <div className="flex flex-wrap items-center gap-4 text-slate-300 text-[11px]">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-tactical-green" />
            <span><b>Alpha:</b> Favors speed</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-tactical-blue" />
            <span><b>Bravo:</b> Favors resource efficiency</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-tactical-amber" />
            <span><b>Charlie:</b> Favors lower environmental difficulty</span>
          </span>
        </div>
      </div>
    </div>
  );
}
