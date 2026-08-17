"use client";

import { useViewMode } from "@/lib/context/ViewModeContext";
import { HelpCircle, Play, X, Compass, Database, Shield, BookOpen } from "lucide-react";

export function HelpModal() {
  const { isHelpOpen, closeHelp, startTour } = useViewMode();

  if (!isHelpOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F14]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#131A24] border border-tactical-blue/40 rounded-panel p-6 shadow-2xl space-y-5 font-mono text-xs relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A3441] pb-3">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-tactical-blue" />
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
              ABOUT TACTIX AI & HELP GUIDE
            </h2>
          </div>

          <button onClick={closeHelp} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Core Principles */}
        <div className="bg-[#0B0F14] p-3.5 rounded-btn border border-[#2A3441] space-y-1.5 leading-relaxed text-slate-300">
          <p className="text-slate-100 font-semibold">
            TACTIX AI is an AI-assisted simulated mission-planning decision-support prototype.
          </p>
          <p className="text-tactical-muted">
            It combines real public geospatial and weather data with synthetic operational profiles to compute, simulate, and score candidate Courses of Action (COAs) transparently.
          </p>
        </div>

        {/* Dataset Summary (Section 18) */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-tactical-green uppercase flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>Underlying Data Sources & Provenance</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="bg-[#1A2330] p-2.5 rounded-btn border border-[#2A3441]">
              <span className="font-semibold text-slate-100 block">Terrain Elevation (SRTM)</span>
              <span className="text-slate-400">USGS 30m Global DEM provides elevation, slope, aspect, and roughness.</span>
            </div>

            <div className="bg-[#1A2330] p-2.5 rounded-btn border border-[#2A3441]">
              <span className="font-semibold text-slate-100 block">Geographic Features (OSM)</span>
              <span className="text-slate-400">OpenStreetMap provides roads, waterways, bridges, and infrastructure networks.</span>
            </div>

            <div className="bg-[#1A2330] p-2.5 rounded-btn border border-[#2A3441]">
              <span className="font-semibold text-slate-100 block">Land Cover (Copernicus)</span>
              <span className="text-slate-400">Copernicus Global Service provides satellite-derived vegetation and land friction factors.</span>
            </div>

            <div className="bg-[#1A2330] p-2.5 rounded-btn border border-[#2A3441]">
              <span className="font-semibold text-slate-100 block">Weather (ERA5 Reanalysis)</span>
              <span className="text-slate-400">ECMWF hourly single-level reanalysis provides precipitation, wind, and storm data.</span>
            </div>

            <div className="bg-[#1A2330] p-2.5 rounded-btn border border-[#2A3441] sm:col-span-2">
              <span className="font-semibold text-slate-100 block">Logistics & Intelligence (Synthetic)</span>
              <span className="text-slate-400">All unit allocations, readiness, and intelligence observations are synthetic and generated in-house for simulation testing only.</span>
            </div>
          </div>
        </div>

        {/* Ethical / Scope Disclaimers */}
        <div className="p-3 bg-[#1A2330] rounded-btn border border-tactical-amber/40 text-[11px] text-slate-300 space-y-1">
          <div className="flex items-center space-x-1.5 text-tactical-amber font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Scope & Responsible Use Framing</span>
          </div>
          <p className="text-slate-400">
            • TACTIX AI estimates risk within a controlled simulated environment using environmental, logistical, and constraint variables.
          </p>
          <p className="text-slate-400">
            • The system generates and evaluates simulated alternatives and presents trade-offs to a human decision-maker — it does not predict real-world operational outcomes or select a &quot;best military plan.&quot;
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#2A3441]">
          <button
            onClick={startTour}
            className="flex items-center space-x-2 px-4 py-2 rounded-btn bg-tactical-green text-black font-bold text-xs hover:bg-tactical-green/90 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>REPLAY GUIDED TOUR</span>
          </button>

          <button
            onClick={closeHelp}
            className="px-4 py-2 rounded-btn bg-[#1A2330] border border-[#2A3441] text-xs text-slate-300 hover:text-white"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
}
