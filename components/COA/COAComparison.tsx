"use client";

import { GitBranch, Sparkles, HelpCircle } from "lucide-react";
import { COACard } from "./COACard";
import { COA } from "@/lib/simulation/types";

interface COAComparisonProps {
  coas: COA[];
  selectedCOA?: COA;
  onSelectCOA: (coa: COA) => void;
  isAdvancedMode?: boolean;
}

export function COAComparison({
  coas,
  selectedCOA,
  onSelectCOA,
  isAdvancedMode = false,
}: COAComparisonProps) {
  return (
    <div id="coa-section" className="space-y-3 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A3441] pb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-tactical-green/20 text-tactical-green">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
              SIMULATED OPTIONS
            </h3>
            <p className="text-xs text-tactical-muted">
              Choose an alternative to inspect route trade-offs on the map.
            </p>
          </div>
        </div>

        <div className="text-xs text-tactical-muted hidden sm:block">
          Select option to focus on map
        </div>
      </div>

      {/* 3 Option Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coas.map((coa) => (
          <COACard
            key={coa.id}
            coa={coa}
            isSelected={selectedCOA?.name === coa.name}
            onSelect={() => onSelectCOA(coa)}
            isAdvancedMode={isAdvancedMode}
          />
        ))}
      </div>
    </div>
  );
}
