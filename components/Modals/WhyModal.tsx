"use client";

import { useViewMode } from "@/lib/context/ViewModeContext";
import { HelpCircle, X, Info, Sparkles } from "lucide-react";

export function WhyModal() {
  const { whyModal, closeWhyModal } = useViewMode();

  if (!whyModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F14]/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#131A24] border border-tactical-green/50 rounded-panel p-5 shadow-2xl space-y-4 font-mono text-xs relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A3441] pb-2.5">
          <div className="flex items-center space-x-2 text-tactical-green">
            <Info className="w-4 h-4" />
            <h3 className="font-bold uppercase tracking-wide text-slate-100">
              {whyModal.title}
            </h3>
          </div>

          <button onClick={closeWhyModal} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Narrative Explanation */}
        <div className="bg-[#0B0F14] p-3 rounded-btn border border-[#2A3441] text-slate-200 leading-relaxed whitespace-pre-line text-[11px]">
          {whyModal.explanation}
        </div>

        {/* Contributing Factors if available */}
        {whyModal.factors && whyModal.factors.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-tactical-muted uppercase font-semibold block">
              Contributing Factors & Weights:
            </span>
            <div className="space-y-1">
              {whyModal.factors.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-[#1A2330] px-2.5 py-1 rounded border border-[#2A3441] text-[11px]"
                >
                  <span className="text-slate-300">{f.label}</span>
                  <span className="font-bold text-slate-100" style={{ color: f.color }}>
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={closeWhyModal}
            className="px-4 py-1.5 rounded-btn bg-tactical-green text-black font-bold text-xs hover:bg-tactical-green/90"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
}
