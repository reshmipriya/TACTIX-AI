"use client";

import { useViewMode } from "@/lib/context/ViewModeContext";
import { 
  FileText, 
  CheckCircle2, 
  Map as MapIcon, 
  GitBranch, 
  TrendingUp, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Sparkles,
  Check
} from "lucide-react";

const TOUR_STEPS = [
  {
    step: 1,
    title: "DESCRIBE YOUR SCENARIO",
    subtitle: "Natural-Language Scenario Description",
    description: "Tell TACTIX AI what you want to simulate using plain, normal language. You can specify weather, time limits, resource envelopes, or pick from ready presets.",
    icon: FileText,
    target: "mission-input-section",
    accent: "text-tactical-green",
    badge: "Step 1 of 5",
  },
  {
    step: 2,
    title: "REVIEW YOUR SCENARIO",
    subtitle: "Structured Simulation Conditions",
    description: "TACTIX automatically converts your plain description into validated simulation parameters: Weather condition, Resource availability, Time cutoff, and Terrain preference.",
    icon: CheckCircle2,
    target: "scenario-summary-section",
    accent: "text-tactical-blue",
    badge: "Step 2 of 5",
  },
  {
    step: 3,
    title: "UNDERSTAND THE ENVIRONMENT",
    subtitle: "Integrated Geospatial Intelligence",
    description: "TACTIX fuses real SRTM 30m elevation, Copernicus land cover, OpenStreetMap roads & water, and ERA5 weather into an environment cost grid. Click any cell to inspect live telemetry.",
    icon: MapIcon,
    target: "map-section",
    accent: "text-tactical-earth",
    badge: "Step 3 of 5",
  },
  {
    step: 4,
    title: "COMPARE SIMULATED OPTIONS",
    subtitle: "Multi-Objective Route Alternatives",
    description: "TACTIX evaluates three distinct simulated Courses of Action: Alpha (Faster), Bravo (Resource Efficient), and Charlie (Lower Environmental Difficulty). Each has clear trade-offs and constraint checks.",
    icon: GitBranch,
    target: "coa-section",
    accent: "text-tactical-amber",
    badge: "Step 4 of 5",
  },
  {
    step: 5,
    title: "UNDERSTAND RISK & TRY WHAT-IF",
    subtitle: "Explainable Risk & Perturbation Lab",
    description: "Click 'Why?' to understand what drove each risk score. Use the What-If Scenario Lab to change sliders and instantly see how the simulated outcomes and route trade-offs shift.",
    icon: TrendingUp,
    target: "risk-section",
    accent: "text-tactical-red",
    badge: "Step 5 of 5",
  },
];

export function GuidedTourModal() {
  const { isTourOpen, tourStep, setTourStep, closeTour } = useViewMode();

  if (!isTourOpen) return null;

  const current = TOUR_STEPS[tourStep - 1] || TOUR_STEPS[0];
  const Icon = current.icon;
  const isLast = tourStep === TOUR_STEPS.length;

  const handleNext = () => {
    if (isLast) {
      closeTour();
    } else {
      setTourStep(tourStep + 1);
    }
  };

  const handlePrev = () => {
    if (tourStep > 1) {
      setTourStep(tourStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F14]/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#131A24] border border-tactical-green/50 rounded-panel p-6 shadow-2xl space-y-5 font-mono relative animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A3441] pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-tactical-green/10 text-tactical-green border border-tactical-green/30 font-bold uppercase">
              {current.badge}
            </span>
            <span className="text-xs text-tactical-muted">Interactive Product Tour</span>
          </div>

          <button
            onClick={closeTour}
            className="text-slate-400 hover:text-white p-1 rounded-btn"
            aria-label="Exit tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Body */}
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-panel bg-[#1A2330] border border-[#2A3441] flex-shrink-0 text-tactical-green">
            <Icon className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
              {current.title}
            </h3>
            <p className="text-xs text-tactical-muted font-medium">
              {current.subtitle}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {current.description}
            </p>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center space-x-2 py-1">
          {TOUR_STEPS.map((s) => (
            <button
              key={s.step}
              onClick={() => setTourStep(s.step)}
              className={`h-1.5 rounded-full transition-all ${
                s.step === tourStep
                  ? "w-6 bg-tactical-green"
                  : s.step < tourStep
                  ? "w-2 bg-tactical-green/50"
                  : "w-2 bg-[#2A3441]"
              }`}
              aria-label={`Go to step ${s.step}`}
            />
          ))}
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#2A3441]">
          <button
            onClick={closeTour}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Skip Tour
          </button>

          <div className="flex items-center space-x-2">
            {tourStep > 1 && (
              <button
                onClick={handlePrev}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-btn bg-[#1A2330] border border-[#2A3441] text-xs text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-btn bg-tactical-green text-black font-bold text-xs hover:bg-tactical-green/90 transition-all shadow-md shadow-tactical-green/10"
            >
              <span>{isLast ? "Start Exploring" : "Next"}</span>
              {isLast ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
