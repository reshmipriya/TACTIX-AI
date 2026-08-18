"use client";

import { useState } from "react";
import { Bot, X, Send, Sparkles, MessageSquare } from "lucide-react";
import { COA, MissionScenario } from "@/lib/simulation/types";
import { AnalysisMode } from "@/lib/ai/types";

interface AICopilotProps {
  scenario: MissionScenario;
  coas: COA[];
  onRequestAnalysis: (mode: AnalysisMode) => void;
}

export function AICopilot({ scenario, coas, onRequestAnalysis }: AICopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content: "TACTIX COPILOT: Ask about this simulation.",
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Section 19 Copilot Actions
  const handleQuickAction = async (mode: AnalysisMode, label: string) => {
    setMessages((prev) => [...prev, { role: "user", content: label }]);
    setIsProcessing(true);
    onRequestAnalysis(mode);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, coas, mode }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.text || "Analysis synthesized." },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "AI interpretation is temporarily unavailable. You can review the simulation directly on the dashboard." },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || isProcessing) return;

    const query = userQuery;
    setUserQuery("");
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setIsProcessing(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, coas, mode: "compare", query }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.text || "Analysis synthesized." },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Simulation data evaluated." },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 font-mono">
      {!isOpen ? (
        /* Compact Floating Badge (Section 19) */
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 px-3 py-2 rounded-full bg-[#131A24]/95 border border-tactical-green/50 text-slate-100 text-xs shadow-2xl hover:border-tactical-green hover:bg-[#1A2534] transition-all group backdrop-blur"
        >
          <div className="p-1 rounded-full bg-tactical-green/20 text-tactical-green group-hover:bg-tactical-green group-hover:text-black transition-all">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-tactical-green text-xs pr-1">TACTIX AI</span>
          <span className="w-2 h-2 rounded-full bg-tactical-green animate-pulse" />
        </button>
      ) : (
        /* Contextual Dialog Drawer */
        <div className="w-[340px] sm:w-[400px] h-[500px] bg-[#131A24] border border-tactical-green/50 rounded-panel shadow-2xl flex flex-col text-xs overflow-hidden animate-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="p-3 bg-[#0B0F14] border-b border-[#2A3441] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-tactical-green" />
              <span className="font-bold text-slate-100 uppercase tracking-wide">
                TACTIX COPILOT
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action Chips (Section 19) */}
          <div className="p-2 bg-[#16202E]/80 border-b border-[#2A3441] flex flex-wrap gap-1">
            <button
              onClick={() => handleQuickAction("compare", "Compare options")}
              disabled={isProcessing}
              className="px-2 py-0.5 rounded bg-[#0B0F14] border border-[#2A3441] text-[10px] text-tactical-green hover:border-tactical-green"
            >
              Compare options
            </button>
            <button
              onClick={() => handleQuickAction("explain_risk", "Explain risk")}
              disabled={isProcessing}
              className="px-2 py-0.5 rounded bg-[#0B0F14] border border-[#2A3441] text-[10px] text-tactical-amber hover:border-tactical-amber"
            >
              Explain risk
            </button>
            <button
              onClick={() => handleQuickAction("explain_uncertainty", "Explain map")}
              disabled={isProcessing}
              className="px-2 py-0.5 rounded bg-[#0B0F14] border border-[#2A3441] text-[10px] text-tactical-blue hover:border-tactical-blue"
            >
              Explain map
            </button>
            <button
              onClick={() => handleQuickAction("what_changed", "What changed?")}
              disabled={isProcessing}
              className="px-2 py-0.5 rounded bg-[#0B0F14] border border-[#2A3441] text-[10px] text-slate-300 hover:text-white"
            >
              What changed?
            </button>
            <button
              onClick={() => handleQuickAction("summarize", "Summarize")}
              disabled={isProcessing}
              className="px-2 py-0.5 rounded bg-[#0B0F14] border border-[#2A3441] text-[10px] text-slate-300 hover:text-white"
            >
              Summarize
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-btn text-[11px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#1A2330] border border-tactical-blue/40 text-slate-100 ml-6"
                    : "bg-[#0B0F14] border border-[#2A3441] text-slate-200 mr-4"
                }`}
              >
                <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-1">
                  {m.role === "user" ? "You" : "TACTIX Copilot"}
                </div>
                <div className="whitespace-pre-line">{m.content}</div>
              </div>
            ))}
            {isProcessing && (
              <div className="p-2 rounded-btn bg-[#0B0F14] text-[11px] text-tactical-green animate-pulse">
                Evaluating simulation parameters...
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-2 bg-[#0B0F14] border-t border-[#2A3441] flex items-center space-x-2"
          >
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Ask about this simulation..."
              className="flex-1 bg-[#131A24] border border-[#2A3441] rounded-btn px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-tactical-green"
            />
            <button
              type="submit"
              disabled={isProcessing || !userQuery.trim()}
              className="p-1.5 rounded-btn bg-tactical-green text-black font-bold disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
