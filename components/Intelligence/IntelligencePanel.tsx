"use client";

import { useState } from "react";
import { Radio, ShieldAlert, AlertTriangle, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { IntelReport } from "@/lib/simulation/types";

interface IntelligencePanelProps {
  reports: IntelReport[];
}

export function IntelligencePanel({ reports }: IntelligencePanelProps) {
  const [selectedReport, setSelectedReport] = useState<IntelReport | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const totalReports = reports.length;
  const highConf = reports.filter((r) => r.confidence >= 0.75).length;
  const medConf = reports.filter((r) => r.confidence >= 0.55 && r.confidence < 0.75).length;
  const lowConf = reports.filter((r) => r.confidence < 0.55).length;
  
  const avgUncertainty = Math.round(
    (reports.reduce((acc, r) => acc + r.uncertainty, 0) / (totalReports || 1)) * 100
  );

  return (
    <div className="tactical-panel p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2A3441] pb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-tactical-blue/20 text-tactical-blue">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-mono text-xs font-semibold text-slate-100 uppercase">
                SYNTHETIC INTELLIGENCE
              </h3>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-badge bg-tactical-amber/10 text-tactical-amber border border-tactical-amber/30">
                SIMULATION ONLY
              </span>
            </div>
            <p className="text-[10px] text-tactical-muted font-mono">
              Uncertainty Modelling & Observation Nodes
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-mono text-tactical-blue hover:text-white flex items-center space-x-1"
        >
          <span>{isExpanded ? "Hide Logs" : "View Logs"}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
        <div className="bg-[#0B0F14] p-2 rounded border border-[#2A3441]">
          <span className="text-[10px] text-slate-400 block uppercase">Total Feeds</span>
          <span className="text-base font-semibold text-slate-100 mt-0.5 block">
            {totalReports} Active
          </span>
        </div>

        <div className="bg-[#0B0F14] p-2 rounded border border-[#2A3441]">
          <span className="text-[10px] text-tactical-green block uppercase">High Conf</span>
          <span className="text-base font-semibold text-tactical-green mt-0.5 block">
            {highConf} Feeds
          </span>
        </div>

        <div className="bg-[#0B0F14] p-2 rounded border border-[#2A3441]">
          <span className="text-[10px] text-tactical-amber block uppercase">Med Conf</span>
          <span className="text-base font-semibold text-tactical-amber mt-0.5 block">
            {medConf} Feeds
          </span>
        </div>

        <div className="bg-[#0B0F14] p-2 rounded border border-[#2A3441]">
          <span className="text-[10px] text-tactical-red block uppercase">Uncertainty</span>
          <span className="text-base font-semibold text-tactical-red mt-0.5 block">
            {avgUncertainty} / 100
          </span>
        </div>
      </div>

      {/* Expandable Intelligence Report Feed List */}
      {isExpanded && (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {reports.map((rep) => (
            <div
              key={rep.report_id}
              onClick={() => setSelectedReport(rep)}
              className={`p-2 rounded-btn border text-xs font-mono cursor-pointer transition-all ${
                selectedReport?.report_id === rep.report_id
                  ? "bg-[#1A2330] border-tactical-blue"
                  : "bg-[#0B0F14] border-[#2A3441] hover:border-slate-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">{rep.report_id} · {rep.zone}</span>
                <span className={`text-[10px] px-1.5 rounded ${
                  rep.confidence >= 0.75 ? "bg-tactical-green/10 text-tactical-green" : "bg-tactical-amber/10 text-tactical-amber"
                }`}>
                  Conf: {Math.round(rep.confidence * 100)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">{rep.observation_type}</p>
            </div>
          ))}
        </div>
      )}

      {/* Selected Report Modal Details */}
      {selectedReport && (
        <div className="bg-[#1A2330] p-3 rounded-btn border border-tactical-blue/40 font-mono text-xs space-y-1.5">
          <div className="flex items-center justify-between text-tactical-blue font-semibold">
            <span>{selectedReport.report_id} ({selectedReport.source_type})</span>
            <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <p className="text-slate-200">{selectedReport.observation_type}</p>
          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 pt-1 border-t border-[#2A3441]">
            <span>Reliability: {Math.round(selectedReport.reliability * 100)}%</span>
            <span>Age: {selectedReport.age_minutes}m ago</span>
            <span>Uncertainty: {selectedReport.uncertainty}</span>
          </div>
        </div>
      )}
    </div>
  );
}
