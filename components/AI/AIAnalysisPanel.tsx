"use client";

import { useState } from "react";
import { Sparkles, MessageSquare, RefreshCw, HelpCircle, Check, BookOpen } from "lucide-react";
import { AIAnalysisResponse, AnalysisMode } from "@/lib/ai/types";
import { COA, MissionScenario } from "@/lib/simulation/types";

interface AIAnalysisPanelProps {
  scenario: MissionScenario;
  coas: COA[];
  analysis?: AIAnalysisResponse;
  onRequestMode: (mode: AnalysisMode) => void;
  isLoading: boolean;
}

export function AIAnalysisPanel({
  scenario,
  coas,
  analysis,
  onRequestMode,
  isLoading,
}: AIAnalysisPanelProps) {
  const [activeMode, setActiveMode] = useState<AnalysisMode>("compare");

  const handleModeClick = (mode: AnalysisMode) => {
    setActiveMode(mode);
    onRequestMode(mode);
  };

  const quickActions: { mode: AnalysisMode; label: string }[] = [
    { mode: "compare", label: "Compare Options" },
    { mode: "explain_risk", label: "Explain Risk" },
    { mode: "explain_uncertainty", label: "Why Is Option Different?" },
    { mode: "explain_risk", label: "Explain Weather Impact" },
    { mode: "what_changed", label: "What Changed?" },
    { mode: "summarize", label: "Summarize Scenario" },
  ];

  return (
    <div className="tactical-panel p-5 space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A3441] pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-tactical-blue/20 text-tactical-blue">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
              AI DECISION ANALYST
            </h3>
            <p className="text-xs text-tactical-muted">
              Plain-language explanations grounded strictly in pre-computed simulation outputs.
            </p>
          </div>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A2330] text-tactical-muted border border-[#2A3441]">
          Deterministic Grounding
        </span>
      </div>

      {/* Quick Action Chips (Section 14) */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => handleModeClick(action.mode)}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-btn border transition-all ${
              activeMode === action.mode
                ? "bg-tactical-green text-black font-bold border-tactical-green shadow-sm"
                : "bg-[#1A2330] border-[#2A3441] text-slate-300 hover:text-white hover:border-slate-400"
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Narrative Output */}
      <div className="bg-[#0B0F14] p-4 rounded-btn border border-[#2A3441] text-xs text-slate-200 leading-relaxed min-h-[160px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-36 space-x-2 text-tactical-green">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Evaluating simulation trade-offs and generating explanation...</span>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none space-y-3 whitespace-pre-line text-xs font-mono">
            {analysis?.text || "Click an action above to request specialized analysis."}
          </div>
        )}
      </div>

      {/* Citation Tags */}
      {analysis?.citations && analysis.citations.length > 0 && !isLoading && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-tactical-muted uppercase mr-1">Cited Factors:</span>
          {analysis.citations.map((cite, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-badge bg-[#1A2330] text-tactical-blue border border-tactical-blue/30 text-[10px]"
            >
              {cite.coa ? `Option ${cite.coa}: ` : ""}{cite.highlightText}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
