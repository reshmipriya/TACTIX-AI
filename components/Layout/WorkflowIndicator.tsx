"use client";

import { Check, ArrowRight } from "lucide-react";

export type WorkflowStage = "describe" | "review" | "compare" | "explore";

interface WorkflowIndicatorProps {
  currentStage: WorkflowStage;
  onSelectStage?: (stage: WorkflowStage) => void;
}

const STAGES: { id: WorkflowStage; number: string; label: string }[] = [
  { id: "describe", number: "①", label: "Describe" },
  { id: "review", number: "②", label: "Review" },
  { id: "compare", number: "③", label: "Compare" },
  { id: "explore", number: "④", label: "Explore" },
];

export function WorkflowIndicator({ currentStage, onSelectStage }: WorkflowIndicatorProps) {
  const stageIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="w-full bg-[#131A24] border border-[#2A3441] rounded-panel p-2.5 flex items-center justify-between font-mono text-xs overflow-x-auto">
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-max mx-auto">
        {STAGES.map((s, idx) => {
          const isCurrent = s.id === currentStage;
          const isCompleted = idx < stageIndex;

          return (
            <div key={s.id} className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => onSelectStage && onSelectStage(s.id)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-btn transition-all ${
                  isCurrent
                    ? "bg-tactical-green text-black font-bold shadow-md shadow-tactical-green/10"
                    : isCompleted
                    ? "text-tactical-green bg-tactical-green/10 border border-tactical-green/30 font-medium"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <span>{s.number}</span>
                <span>{s.label}</span>
              </button>

              {idx < STAGES.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-[#2A3441]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
