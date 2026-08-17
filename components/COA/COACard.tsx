"use client";

import { useState } from "react";
import { 
  Award, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Package, 
  Leaf, 
  Check, 
  AlertTriangle, 
  X,
  Info
} from "lucide-react";
import { COA } from "@/lib/simulation/types";
import { useViewMode } from "@/lib/context/ViewModeContext";

interface COACardProps {
  coa: COA;
  isSelected?: boolean;
  onSelect?: () => void;
  isAdvancedMode?: boolean;
}

export function COACard({ coa, isSelected, onSelect, isAdvancedMode = false }: COACardProps) {
  const { openWhyModal } = useViewMode();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const isPreferred = coa.isPreferred;
  const status = coa.constraints.status;

  // Friendly Option Icon & Subtitle (Section 9)
  let OptionIcon = Zap;
  let friendlyTitle = "⚡ OPTION ALPHA";
  let friendlySubtitle = "Faster simulated option (Express Corridor)";

  if (coa.name === "Bravo") {
    OptionIcon = Package;
    friendlyTitle = "📦 OPTION BRAVO";
    friendlySubtitle = "Resource-efficient simulated option (Fuel Preservation)";
  } else if (coa.name === "Charlie") {
    OptionIcon = Leaf;
    friendlyTitle = "🌿 OPTION CHARLIE";
    friendlySubtitle = "Lower environmental difficulty (Hazard Bypass)";
  }

  // Friendly Status Badges (Section 22)
  let statusBadge = "✓ Valid";
  let statusColor = "bg-tactical-green/20 text-tactical-green border-tactical-green/40";

  if (status === "WARNING") {
    statusBadge = "⚠ Warning";
    statusColor = "bg-tactical-amber/20 text-tactical-amber border-tactical-amber/40";
  } else if (status === "INVALID") {
    statusBadge = "✕ Invalid";
    statusColor = "bg-tactical-red/20 text-tactical-red border-tactical-red/40";
  }

  const handleWhyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openWhyModal(
      `Why is ${friendlyTitle} scored ${coa.risk.overall}/100?`,
      `This risk score represents estimated friction inside the simulated environment based on:\n` +
      `• Weather condition adds +${coa.risk.contributions.weather} pts.\n` +
      `• Terrain slope and roughness along the route adds +${coa.risk.contributions.terrain} pts.\n` +
      `• Resource consumption (${Math.round(coa.metrics.resource_consumption * 100)}%) adds +${coa.risk.contributions.logistics} pts.\n` +
      `• Route information uncertainty adds +${coa.risk.contributions.intelligence} pts.\n\n` +
      `This is a deterministic mathematical score, not an automated command.`,
      [
        { label: "Weather Impact (22%)", value: `+${coa.risk.contributions.weather} pts`, color: "#3B82F6" },
        { label: "Terrain Difficulty (22%)", value: `+${coa.risk.contributions.terrain} pts`, color: "#8B6F47" },
        { label: "Resource Strain (20%)", value: `+${coa.risk.contributions.logistics} pts`, color: "#00D9A3" },
        { label: "Information Uncertainty (18%)", value: `+${coa.risk.contributions.intelligence} pts`, color: "#FFB020" },
      ]
    );
  };

  return (
    <div
      onClick={onSelect}
      className={`tactical-panel p-5 flex flex-col justify-between space-y-4 cursor-pointer transition-all duration-200 relative overflow-hidden ${
        isSelected
          ? "border-tactical-green ring-2 ring-tactical-green/30 bg-[#16212E]"
          : "hover:border-slate-500 bg-[#131A24]"
      }`}
    >
      {/* Preferred Banner */}
      {isPreferred && (
        <div className="bg-tactical-green/15 border-b border-tactical-green/30 -mx-5 -mt-5 px-4 py-1.5 flex items-center justify-between font-mono text-[11px] text-tactical-green font-semibold">
          <div className="flex items-center space-x-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>PREFERRED SIMULATED ALTERNATIVE</span>
          </div>
          <span className="text-[10px] uppercase text-tactical-muted">Lowest Risk</span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <OptionIcon className="w-4 h-4 text-slate-100" />
            <h4 className="font-mono text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
              {friendlyTitle}
            </h4>
          </div>

          <span className={`px-2.5 py-0.5 rounded-badge text-xs font-mono font-bold border ${statusColor}`}>
            {statusBadge}
          </span>
        </div>
        <p className="text-xs text-tactical-muted font-mono">{friendlySubtitle}</p>
      </div>

      {/* Primary Clean Metrics Grid (Section 9) */}
      <div className="grid grid-cols-3 gap-2 font-mono text-xs">
        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <span className="text-[10px] text-slate-400 block uppercase">Risk</span>
          <span
            className="text-base font-bold block mt-0.5"
            style={{ color: coa.risk.riskColor }}
          >
            {coa.risk.overall} / 100
          </span>
        </div>

        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <span className="text-[10px] text-slate-400 block uppercase">Duration</span>
          <span className="text-base font-bold text-slate-100 block mt-0.5">
            {coa.metrics.estimated_duration_hours} h
          </span>
        </div>

        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <span className="text-[10px] text-slate-400 block uppercase">Resources</span>
          <span className="text-base font-bold text-tactical-blue block mt-0.5">
            {Math.round(coa.metrics.resource_consumption * 100)}%
          </span>
        </div>
      </div>

      {/* Simple Risk Bar */}
      <div className="space-y-1 font-mono">
        <div className="flex justify-between text-xs text-slate-300">
          <span>Simulated Risk:</span>
          <span className="font-semibold" style={{ color: coa.risk.riskColor }}>
            {coa.risk.riskBand} Band
          </span>
        </div>
        <div className="w-full bg-[#0B0F14] h-1.5 rounded-full overflow-hidden border border-[#2A3441]">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${coa.risk.overall}%`, backgroundColor: coa.risk.riskColor }}
          />
        </div>
      </div>

      {/* Action Buttons: Why & View Details */}
      <div className="flex items-center justify-between pt-1 border-t border-[#2A3441] font-mono text-xs">
        <button
          onClick={handleWhyClick}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#1A2330] border border-[#2A3441] text-tactical-green hover:border-tactical-green transition-all"
        >
          <HelpCircle className="w-3 h-3" />
          <span>Why?</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDetailsOpen(!isDetailsOpen);
          }}
          className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
        >
          <span>{isDetailsOpen ? "Hide Details" : "View Details"}</span>
          {isDetailsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expandable Technical Details (Advanced / Progressive Disclosure) */}
      {isDetailsOpen && (
        <div className="bg-[#0B0F14] p-3 rounded border border-[#2A3441] space-y-2 font-mono text-[11px] animate-in fade-in duration-150">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500 block text-[10px]">DISTANCE</span>
              <span className="text-slate-200">{coa.metrics.distance_km} km</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">EFF. SPEED</span>
              <span className="text-slate-200">{coa.metrics.average_speed_kmh} km/h</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">TERRAIN FRICTION</span>
              <span className="text-slate-200">{coa.metrics.terrain_exposure}/100</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">WEATHER STRESS</span>
              <span className="text-slate-200">{coa.metrics.weather_exposure}/100</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">INFO UNCERTAINTY</span>
              <span className="text-slate-200">{Math.round(coa.metrics.intel_uncertainty * 100)}%</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">MAX ENV COST</span>
              <span className="text-slate-200">{coa.metrics.max_environment_cost}/100</span>
            </div>
          </div>
          {coa.constraints.violations.length > 0 && (
            <div className="p-1.5 bg-tactical-red/10 border border-tactical-red/30 rounded text-tactical-red text-[10px]">
              ⚠️ Rule violation: {coa.constraints.violations[0].detail}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
