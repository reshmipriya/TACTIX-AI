"use client";

import { Truck, Users, Fuel, Wrench, Clock, Activity } from "lucide-react";
import { LogisticsProfile } from "@/lib/simulation/types";

interface LogisticsPanelProps {
  logistics: LogisticsProfile;
}

export function LogisticsPanel({ logistics }: LogisticsPanelProps) {
  return (
    <div className="tactical-panel p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-[#2A3441] pb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-tactical-green/20 text-tactical-green">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-semibold text-slate-100 uppercase">
              OPERATIONAL LOGISTICS
            </h3>
            <p className="text-[10px] text-tactical-muted font-mono">
              Simulated Readiness & Resource Capacity
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tactical-blue/10 text-tactical-blue border border-tactical-blue/30 uppercase">
          {logistics.scenario_id}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <div className="flex items-center space-x-1 text-slate-400 text-[10px] uppercase">
            <Users className="w-3 h-3 text-tactical-green" />
            <span>Personnel</span>
          </div>
          <span className="text-base font-semibold text-slate-100 mt-1 block">
            {logistics.personnel_available} Available
          </span>
        </div>

        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <div className="flex items-center space-x-1 text-slate-400 text-[10px] uppercase">
            <Fuel className="w-3 h-3 text-tactical-blue" />
            <span>Resource Level</span>
          </div>
          <span className="text-base font-semibold text-tactical-blue mt-1 block">
            {Math.round(logistics.resource_level * 100)}%
          </span>
        </div>

        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <div className="flex items-center space-x-1 text-slate-400 text-[10px] uppercase">
            <Wrench className="w-3 h-3 text-tactical-amber" />
            <span>Readiness</span>
          </div>
          <span className="text-base font-semibold text-slate-100 mt-1 block">
            {Math.round(logistics.equipment_readiness * 100)}%
          </span>
        </div>

        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <div className="flex items-center space-x-1 text-slate-400 text-[10px] uppercase">
            <Fuel className="w-3 h-3 text-slate-400" />
            <span>Supply Level</span>
          </div>
          <span className="text-base font-semibold text-slate-100 mt-1 block">
            {Math.round(logistics.supply_level * 100)}%
          </span>
        </div>

        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <div className="flex items-center space-x-1 text-slate-400 text-[10px] uppercase">
            <Clock className="w-3 h-3 text-tactical-amber" />
            <span>Time Horizon</span>
          </div>
          <span className="text-base font-semibold text-tactical-amber mt-1 block">
            {logistics.time_limit} Hours
          </span>
        </div>

        <div className="bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]">
          <div className="flex items-center space-x-1 text-slate-400 text-[10px] uppercase">
            <Activity className="w-3 h-3 text-tactical-green" />
            <span>Mobility Factor</span>
          </div>
          <span className="text-base font-semibold text-tactical-green mt-1 block">
            {logistics.mobility_factor}
          </span>
        </div>
      </div>
    </div>
  );
}
