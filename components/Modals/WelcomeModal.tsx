"use client";

import { useViewMode } from "@/lib/context/ViewModeContext";
import { Sparkles, Shield, Compass, ArrowRight, X, Play } from "lucide-react";

export function WelcomeModal() {
  const { isWelcomeOpen, closeWelcome, startTour } = useViewMode();

  if (!isWelcomeOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F14]/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#131A24] border border-tactical-green/40 rounded-panel p-6 sm:p-8 shadow-2xl space-y-6 relative">
        
        {/* Close Button */}
        <button
          onClick={closeWelcome}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-btn hover:bg-[#1A2330] transition-colors"
          aria-label="Close welcome modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-badge bg-tactical-green/10 border border-tactical-green/30 text-tactical-green font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-tactical-green animate-pulse" />
            <span>CONTROLLED SIMULATION ENVIRONMENT</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 font-mono">
            TACTIX <span className="text-tactical-green">AI</span>
          </h2>
          <p className="text-sm sm:text-base font-semibold text-slate-300 font-mono">
            AI-Assisted Mission Planning
          </p>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-mono">
            Explore simulated scenarios, compare alternatives, understand risk, and test what-if conditions with real environmental data and explainable models.
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="bg-[#0B0F14] p-3 rounded-btn border border-[#2A3441] space-y-1">
            <div className="text-tactical-green font-semibold flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Real Data</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-tight">
              SRTM elevation, Copernicus land cover, OSM roads & ERA5 weather.
            </p>
          </div>

          <div className="bg-[#0B0F14] p-3 rounded-btn border border-[#2A3441] space-y-1">
            <div className="text-tactical-blue font-semibold flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-COA</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-tight">
              Compare speed, resource efficiency, and hazard avoidance options.
            </p>
          </div>

          <div className="bg-[#0B0F14] p-3 rounded-btn border border-[#2A3441] space-y-1">
            <div className="text-tactical-amber font-semibold flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Explainable</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-tight">
              Every risk score is 100% traceable. AI explains without guessing.
            </p>
          </div>
        </div>

        {/* Ethical / Simulation Disclaimer */}
        <div className="bg-[#1A2330] p-3 rounded-btn border border-[#2A3441] text-[11px] text-tactical-muted font-mono">
          <span className="text-slate-300 font-semibold block mb-0.5">Simulation Only — Decision-Support Prototype</span>
          This tool is designed for scenario exploration and human evaluation. It does not predict real-world operational outcomes or command autonomous actions.
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={startTour}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-btn bg-tactical-green text-black font-mono font-bold text-xs hover:bg-tactical-green/90 transition-all shadow-lg shadow-tactical-green/10"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>START GUIDED TOUR</span>
          </button>

          <button
            onClick={closeWelcome}
            className="w-full sm:w-auto px-4 py-2.5 rounded-btn bg-[#1A2330] border border-[#2A3441] text-xs font-mono text-slate-300 hover:text-white hover:border-slate-400 transition-all text-center"
          >
            Skip Tour & Enter App
          </button>
        </div>

      </div>
    </div>
  );
}
