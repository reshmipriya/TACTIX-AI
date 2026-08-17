"use client";

import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { OperationalConstraints } from "@/lib/constraints/types";
import { COA } from "@/lib/simulation/types";

interface ConstraintsPanelProps {
  constraints: OperationalConstraints;
  coas: COA[];
}

export function ConstraintsPanel({ constraints, coas }: ConstraintsPanelProps) {
  return (
    <div className="tactical-panel p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-[#2A3441] pb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-tactical-red/20 text-tactical-red">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-semibold text-slate-100 uppercase">
              OPERATIONAL CONSTRAINTS & BOUNDS
            </h3>
            <p className="text-[10px] text-tactical-muted font-mono">
              Deterministic Boundary & Violation Engine
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <span className="text-[10px] text-slate-400 block uppercase">Max Duration</span>
          <span className="text-sm font-semibold text-slate-100 mt-0.5 block">
            {constraints.time_limit} Hours Limit
          </span>
        </div>

        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <span className="text-[10px] text-slate-400 block uppercase">Max Resources</span>
          <span className="text-sm font-semibold text-tactical-blue mt-0.5 block">
            {Math.round(constraints.resource_limit * 100)}% Cap
          </span>
        </div>

        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <span className="text-[10px] text-slate-400 block uppercase">Restricted Zones</span>
          <span className="text-sm font-semibold text-tactical-red mt-0.5 block">
            {constraints.restricted_zones?.length || 2} Corridors
          </span>
        </div>

        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <span className="text-[10px] text-slate-400 block uppercase">AOI Perimeter</span>
          <span className="text-sm font-semibold text-tactical-green mt-0.5 block">
            ENFORCED
          </span>
        </div>
      </div>

      {/* COA Validation Status Pills */}
      <div className="bg-[#1A2330] p-3 rounded-btn border border-[#2A3441] space-y-2 font-mono text-xs">
        <span className="text-[10px] uppercase text-slate-400 font-semibold block">
          Current COA Constraint Validation Status
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {coas.map((coa) => {
            const status = coa.constraints.status;
            let statusColor = "bg-tactical-green text-black font-bold";
            if (status === "WARNING") statusColor = "bg-tactical-amber text-black font-bold";
            if (status === "INVALID") statusColor = "bg-tactical-red text-white font-bold";

            return (
              <div
                key={coa.id}
                className="bg-[#0B0F14] p-2 rounded border border-[#2A3441] flex items-center justify-between"
              >
                <span className="text-slate-200">{coa.name}</span>
                <span className={`px-2 py-0.5 rounded-badge text-[10px] font-mono uppercase tracking-wider ${statusColor}`}>
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
