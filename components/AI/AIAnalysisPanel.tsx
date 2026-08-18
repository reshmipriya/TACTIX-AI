"use client";

import { useState } from "react";
import { Sparkles, MessageSquare, RefreshCw, ChevronDown, ChevronUp, Send } from "lucide-react";
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
  const [isDetailedOpen, setIsDetailedOpen] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");

  const handleModeClick = (mode: AnalysisMode) => {
    setActiveMode(mode);
    onRequestMode(mode);
  };

  // Chapter 16: Quick Actions
  const quickActions: { mode: AnalysisMode; label: string }[] = [
    { mode: "compare", label: "[ Compare Options ]" },
    { mode: "explain_risk", label: "[ Explain Risk ]" },
    { mode: "explain_uncertainty", label: "[ Why Is This Option Different? ]" },
    { mode: "explain_risk", label: "[ Explain Weather Impact ]" },
    { mode: "what_changed", label: "[ What Changed? ]" },
    { mode: "summarize", label: "[ Summarize Scenario ]" },
  ];

  // Split narrative into concise lead (1-2 sentences) and detailed explanation (Chapter 16)
  const fullText = analysis?.text || "Select an action above to request grounded AI analysis.";
  const paragraphs = fullText.split("\n\n");
  const leadSummary = paragraphs[0];
  const detailNarrative = paragraphs.slice(1).join("\n\n");

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || isLoading) return;
    onRequestMode("compare");
    setCustomQuestion("");
  };

  return (
    <div className="tactical-panel p-5 space-y-4 font-mono">
      
      {/* Header (Chapter 16) */}
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
              Plain-language explanation grounded in simulation outputs.
            </p>
          </div>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A2330] text-tactical-muted border border-[#2A3441]">
          AI Explanation
        </span>
      </div>

      {/* Quick Action Chips (Chapter 16) */}
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

      {/* Narrative Output with Concise Lead (Chapter 16) */}
      <div className="bg-[#0B0F14] p-4 rounded-btn border border-[#2A3441] text-xs text-slate-200 leading-relaxed min-h-[140px] space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-28 space-x-2 text-tactical-green">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Analyzing simulation trade-offs...</span>
          </div>
        ) : (
          <>
            {/* Concise Lead (1-2 sentences) */}
            <div className="text-slate-100 font-semibold text-xs leading-relaxed">
              {leadSummary}
            </div>

            {/* View Detailed Explanation Expansion (Chapter 16) */}
            {detailNarrative && (
              <div className="pt-2 border-t border-[#2A3441]/70 space-y-2">
                <button
                  onClick={() => setIsDetailedOpen(!isDetailedOpen)}
                  className="flex items-center space-x-1 text-tactical-blue hover:text-white text-xs transition-colors"
                >
                  <span>{isDetailedOpen ? "[ Hide Detailed Explanation ]" : "[ View Detailed Explanation ]"}</span>
                  {isDetailedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isDetailedOpen && (
                  <div className="text-slate-300 whitespace-pre-line text-xs font-mono leading-relaxed pt-1 animate-in fade-in duration-150">
                    {detailNarrative}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Free-text input below quick actions for advanced questions (Chapter 16) */}
      <form onSubmit={handleCustomSubmit} className="flex items-center space-x-2 pt-1">
        <input
          type="text"
          value={customQuestion}
          onChange={(e) => setCustomQuestion(e.target.value)}
          placeholder="Ask a question about this scenario..."
          className="flex-1 bg-[#0B0F14] border border-[#2A3441] rounded-btn px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-tactical-green"
        />
        <button
          type="submit"
          disabled={isLoading || !customQuestion.trim()}
          className="px-3 py-1.5 rounded-btn bg-[#1A2330] border border-[#2A3441] text-xs text-slate-200 hover:text-white hover:border-tactical-green disabled:opacity-40"
        >
          Ask
        </button>
      </form>

    </div>
  );
}
