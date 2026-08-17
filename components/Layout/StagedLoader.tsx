"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface StagedLoaderProps {
  isLoading: boolean;
  onComplete?: () => void;
}

const SIMPLE_STAGES = [
  "Combining environmental information",
  "Generating simulated options",
  "Calculating risk",
  "Preparing explanation",
];

const TECHNICAL_STAGES = [
  "Loading SRTM terrain DEM (30m)",
  "Processing ERA5 atmospheric reanalysis",
  "Integrating Copernicus dynamic land cover",
  "Evaluating synthetic logistics profiles",
  "Processing intelligence observation nodes",
  "Applying corridor boundary constraints",
  "Running multi-objective A* pathfinding",
  "Executing vehicle mobility simulation",
  "Calculating weighted-sum risk scores",
  "Synthesizing grounded AI trade-off analysis",
];

export function StagedLoader({ isLoading, onComplete }: StagedLoaderProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [showTechnical, setShowTechnical] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setActiveStep(0);
      return;
    }

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < TECHNICAL_STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          if (onComplete) onComplete();
          return prev;
        }
      });
    }, 180);

    return () => clearInterval(interval);
  }, [isLoading, onComplete]);

  if (!isLoading) return null;

  const currentSimpleIdx = Math.min(
    SIMPLE_STAGES.length - 1,
    Math.floor((activeStep / TECHNICAL_STAGES.length) * SIMPLE_STAGES.length)
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F14]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#131A24] border border-tactical-green/40 rounded-panel p-6 shadow-2xl space-y-5 font-mono">
        
        {/* Header (Section 17) */}
        <div className="flex items-center justify-between border-b border-[#2A3441] pb-3">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 text-tactical-green animate-spin" />
            <span className="text-sm uppercase tracking-wider text-slate-100 font-bold">
              ANALYZING SCENARIO...
            </span>
          </div>
          <span className="text-xs text-tactical-green font-bold">
            {Math.round(((activeStep + 1) / TECHNICAL_STAGES.length) * 100)}%
          </span>
        </div>

        {/* High-Level Friendly Steps */}
        {!showTechnical ? (
          <div className="space-y-2.5 text-xs">
            {SIMPLE_STAGES.map((stage, idx) => {
              const isCompleted = idx < currentSimpleIdx;
              const isCurrent = idx === currentSimpleIdx;

              return (
                <div
                  key={stage}
                  className={`flex items-center space-x-2.5 p-2.5 rounded-btn border transition-all ${
                    isCompleted
                      ? "bg-tactical-green/10 border-tactical-green/30 text-tactical-green"
                      : isCurrent
                      ? "bg-[#1A2330] border-tactical-amber/50 text-tactical-amber animate-pulse"
                      : "bg-[#0B0F14]/40 border-[#2A3441]/50 text-slate-500"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-tactical-green flex-shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-tactical-amber animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0" />
                  )}
                  <span className="font-medium text-slate-200">{stage}</span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Detailed Technical Steps */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] max-h-48 overflow-y-auto">
            {TECHNICAL_STAGES.map((stage, idx) => {
              const isCompleted = idx < activeStep;
              const isCurrent = idx === activeStep;

              return (
                <div
                  key={stage}
                  className={`flex items-center space-x-2 p-2 rounded border truncate ${
                    isCompleted
                      ? "bg-tactical-green/10 border-tactical-green/30 text-tactical-green"
                      : isCurrent
                      ? "bg-[#1A2330] border-tactical-amber/50 text-tactical-amber"
                      : "bg-[#0B0F14] border-[#2A3441] text-slate-500"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-tactical-green flex-shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0" />
                  )}
                  <span className="truncate">{stage}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full bg-[#0B0F14] h-1.5 rounded-full overflow-hidden border border-[#2A3441]">
          <div
            className="bg-tactical-green h-full transition-all duration-200"
            style={{ width: `${((activeStep + 1) / TECHNICAL_STAGES.length) * 100}%` }}
          />
        </div>

        {/* Toggle Details Action (Section 17) */}
        <div className="flex justify-end pt-1">
          <button
            onClick={() => setShowTechnical(!showTechnical)}
            className="text-xs text-tactical-blue hover:text-white flex items-center space-x-1"
          >
            <span>{showTechnical ? "Hide Technical Details" : "Show Technical Details"}</span>
            {showTechnical ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

      </div>
    </div>
  );
}
