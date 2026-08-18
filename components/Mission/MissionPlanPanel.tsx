"use client";

import { useMemo } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Truck, 
  HardHat, 
  Radio, 
  BatteryCharging, 
  AlertTriangle, 
  Compass, 
  CheckCircle2, 
  Clock, 
  Layers,
  Sparkles,
  Zap,
  ArrowRight
} from "lucide-react";
import { COA, MissionScenario } from "@/lib/simulation/types";
import { WeatherCondition } from "@/lib/environment/types";

interface MissionPlanPanelProps {
  coa: COA;
  scenario?: MissionScenario;
  weather?: WeatherCondition;
  resourceLevel?: number;
  timeLimit?: number;
  intelConfidence?: number;
  isWhatIf?: boolean;
}

export function MissionPlanPanel({
  coa,
  scenario,
  weather,
  resourceLevel,
  timeLimit,
  intelConfidence,
  isWhatIf = false,
}: MissionPlanPanelProps) {
  const { overall, contributions, riskBand, riskColor } = coa.risk;
  const activeWeather = weather || scenario?.weather_condition || "NORMAL";
  const activeResources = resourceLevel ?? scenario?.resource_level ?? 0.7;
  const activeTime = timeLimit ?? scenario?.time_limit ?? 6;
  const activeIntel = intelConfidence ?? scenario?.intelligence_confidence ?? 0.7;

  // Compute natural-language soldier directives based on risk factors & scenario inputs
  const planDirectives = useMemo(() => {
    // 1. Executive Directive
    let executiveSummary = "";
    if (overall <= 35) {
      executiveSummary = `Execute Option ${coa.name} (${coa.title}) under standard operating protocol. Environmental and operational risk is low (${overall}/100). Maintain standard pacing and regular radio check-ins.`;
    } else if (overall <= 60) {
      executiveSummary = `Execute Option ${coa.name} (${coa.title}) with heightened caution (${overall}/100 risk). Key drivers are ${
        contributions.weather > 12 ? "adverse weather" : contributions.terrain > 12 ? "rugged terrain" : "resource constraints"
      }. Enforce strict speed limits and gear checks before departure.`;
    } else {
      executiveSummary = `Execute Option ${coa.name} (${coa.title}) under CRITICAL RISK PROTOCOL (${overall}/100 risk). Severe environmental strain detected. Deploy advance scouts, enforce maximum fuel conservation, and establish mandatory 15-minute rally point check-ins.`;
    }

    // 2. Equipment & Gear Directives
    const equipmentItems: string[] = [];
    if (activeWeather === "HEAVY_RAIN" || activeWeather === "POOR_CONDITIONS" || contributions.weather > 14) {
      equipmentItems.push("Mandatory heavy waterproof outer shells and sealed equipment dry-sacks.");
      equipmentItems.push("Equip all tactical ground vehicles with deep-tread mud chains / high-traction tires.");
    } else if (activeWeather === "HIGH_WIND") {
      equipmentItems.push("Secure all loose external gear and use ballistic goggles for dust/debris protection.");
    } else {
      equipmentItems.push("Standard environmental field uniform and lightweight tactical vests.");
    }

    if (contributions.terrain > 14) {
      equipmentItems.push("Issue heavy-duty slope anchor ropes, trekking poles, and reinforced boots for steep incline ascents.");
    } else {
      equipmentItems.push("Standard tactical footwear suitable for mixed road and light trail terrain.");
    }

    if (activeResources < 0.5 || contributions.logistics > 12) {
      equipmentItems.push("Pack compact solar charging pads and auxiliary lithium power banks for critical sensors.");
    }

    // 3. Pacing & Navigation Guidelines
    const pacingDirectives: string[] = [];
    if (coa.name === "Alpha") {
      pacingDirectives.push(`Maintain maximum safe speed (~${coa.metrics.average_speed_kmh} km/h) to meet the ${activeTime}-hour timeline limit.`);
      pacingDirectives.push("Enforce 40m convoy spacing on open paved sections; collapse to 20m in low-visibility sectors.");
    } else if (coa.name === "Bravo") {
      pacingDirectives.push(`Throttle convoy speed to ~${coa.metrics.average_speed_kmh} km/h to minimize fuel burn and engine thermal wear.`);
      pacingDirectives.push("Schedule a mandatory 10-minute cooling and telemetry inspection every 2 hours.");
    } else {
      pacingDirectives.push(`Adopt steady low-exposure pacing (~${coa.metrics.average_speed_kmh} km/h) avoiding high-slope ridge lines.`);
      pacingDirectives.push("Bypass active water channels and steep embankment edges to prevent vehicle slippage.");
    }

    if (contributions.constraints > 4) {
      pacingDirectives.push("⚠️ Observe strict corridor boundaries: do not cross restricted boundary buffers marked on tactical map.");
    }

    // 4. Resource & Supply Management
    const supplyDirectives: string[] = [];
    const resourcePct = Math.round(activeResources * 100);
    supplyDirectives.push(`Operating at ${resourcePct}% initial resource availability.`);
    
    if (activeResources < 0.4) {
      supplyDirectives.push("CRITICAL FUEL PROTOCOL: Restrict non-essential heating/AC and idling. Reserve 25% fuel for emergency withdrawal.");
    } else if (activeResources < 0.7) {
      supplyDirectives.push("RESOURCE CONSERVATION: Monitor fuel consumption against benchmark markers at mid-point checkpoint.");
    } else {
      supplyDirectives.push("SUFFICIENT RESERVES: Maintain standard consumption rates with routine fuel level logging.");
    }

    const estDuration = coa.metrics.estimated_duration_hours;
    if (estDuration > activeTime - 1) {
      supplyDirectives.push(`⏱️ Tight time margin: Estimated duration (${estDuration}h) is close to mission deadline (${activeTime}h). Limit rest breaks.`);
    }

    // 5. Intel & Comms Protocol
    const commsDirectives: string[] = [];
    const intelPct = Math.round(activeIntel * 100);
    if (activeIntel < 0.4 || contributions.intelligence > 10) {
      commsDirectives.push(`UNCERTAIN INTEL (${intelPct}% confidence): Deploy point reconnaissance drone 1.5 km ahead of primary column.`);
      commsDirectives.push("Radio check-in interval: Mandatory every 15 minutes with Squad Leader.");
    } else if (activeIntel < 0.7) {
      commsDirectives.push(`MODERATE INTEL (${intelPct}% confidence): Maintain standard forward observation posts.`);
      commsDirectives.push("Radio check-in interval: Every 30 minutes at key waypoint crossings.");
    } else {
      commsDirectives.push(`HIGH INTEL CONFIDENCE (${intelPct}%): Clear situational picture across planned corridor.`);
      commsDirectives.push("Radio check-in interval: Hourly status reports.");
    }

    // 6. Emergency Contingency Rules
    const contingencyRules: string[] = [];
    if (overall > 55) {
      contingencyRules.push(`IF total risk score spikes above 70 during transit &rarr; HIDE & HOLD position at nearest terrain shelter.`);
    }
    if (activeWeather === "POOR_CONDITIONS" || activeWeather === "HEAVY_RAIN") {
      contingencyRules.push("IF river channel depth exceeds safe threshold &rarr; Immediately divert to Option Bravo inland detour.");
    }
    if (activeResources < 0.45) {
      contingencyRules.push("IF fuel drops below 20% total capacity &rarr; Signal immediate resupply request on primary emergency frequency.");
    }
    if (contingencyRules.length === 0) {
      contingencyRules.push("IF unexpected obstacle encountered &rarr; Fallback to previous safe checkpoint and notify Mission Command.");
    }

    return {
      executiveSummary,
      equipmentItems,
      pacingDirectives,
      supplyDirectives,
      commsDirectives,
      contingencyRules,
    };
  }, [coa, scenario, activeWeather, activeResources, activeTime, activeIntel, overall, contributions]);

  return (
    <div 
      id={isWhatIf ? "whatif-mission-plan" : "mission-plan-section"}
      data-tour="mission-plan-section"
      className="workflow-card p-5 space-y-4 font-mono bg-[#111823] border border-tactical-green/40 shadow-xl"
    >
      {/* Header Block */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3441] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded bg-tactical-green/20 text-tactical-green border border-tactical-green/40">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
                {isWhatIf ? "WHAT-IF OPERATIONAL MISSION PLAN" : "ACTIONABLE OPERATIONAL MISSION PLAN FOR SOLDIERS"}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-tactical-green/10 text-tactical-green border border-tactical-green/30">
                Option {coa.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Plain-language tactical directives for field execution based on calculated risk.
            </p>
          </div>
        </div>

        {/* Dynamic Risk Badge */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Simulated Risk:</span>
          <span
            className="text-xs sm:text-sm font-bold px-3 py-1 rounded border flex items-center space-x-1.5"
            style={{
              color: riskColor,
              borderColor: `${riskColor}60`,
              backgroundColor: `${riskColor}18`,
            }}
          >
            {overall >= 60 ? <AlertTriangle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>{overall} / 100 ({riskBand} RISK)</span>
          </span>
        </div>
      </div>

      {/* 1. Executive Directive Banner */}
      <div className="bg-[#0B0F14] p-3.5 rounded-btn border border-[#2A3441] space-y-1.5">
        <div className="flex items-center space-x-2 text-tactical-green text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-tactical-green" />
          <span>TACTICAL EXECUTION DIRECTIVE (SQUAD COMMANDER)</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
          {planDirectives.executiveSummary}
        </p>
      </div>

      {/* 2. Four Category Action Directives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        
        {/* Category A: Equipment & Gear Prep */}
        <div className="bg-[#0E1520] p-4 rounded-btn border border-[#2A3441] space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-tactical-blue border-b border-[#2A3441] pb-1.5">
              <HardHat className="w-4 h-4" />
              <span className="font-bold uppercase tracking-wide text-[11px]">1. Equipment & Gear Directives</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed font-sans">
              {planDirectives.equipmentItems.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-tactical-blue font-bold flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-[#2A3441]/50 font-mono">
            Weather Impact: {contributions.weather} pts · Terrain Impact: {contributions.terrain} pts
          </div>
        </div>

        {/* Category B: Pacing & Navigation */}
        <div className="bg-[#0E1520] p-4 rounded-btn border border-[#2A3441] space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-tactical-green border-b border-[#2A3441] pb-1.5">
              <Truck className="w-4 h-4" />
              <span className="font-bold uppercase tracking-wide text-[11px]">2. Pacing & Convoy Navigation</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed font-sans">
              {planDirectives.pacingDirectives.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-tactical-green font-bold flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-[#2A3441]/50 font-mono">
            Est. Speed: {coa.metrics.average_speed_kmh} km/h · Distance: {coa.metrics.distance_km} km
          </div>
        </div>

        {/* Category C: Resource & Supply Management */}
        <div className="bg-[#0E1520] p-4 rounded-btn border border-[#2A3441] space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-tactical-amber border-b border-[#2A3441] pb-1.5">
              <BatteryCharging className="w-4 h-4" />
              <span className="font-bold uppercase tracking-wide text-[11px]">3. Resource & Supply Management</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed font-sans">
              {planDirectives.supplyDirectives.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-tactical-amber font-bold flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-[#2A3441]/50 font-mono">
            Logistics Strain: {contributions.logistics} pts · Resource Draw: {Math.round(coa.metrics.resource_consumption * 100)}%
          </div>
        </div>

        {/* Category D: Intel & Communications */}
        <div className="bg-[#0E1520] p-4 rounded-btn border border-[#2A3441] space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-purple-400 border-b border-[#2A3441] pb-1.5">
              <Radio className="w-4 h-4" />
              <span className="font-bold uppercase tracking-wide text-[11px]">4. Intel & Comms Check Protocol</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed font-sans">
              {planDirectives.commsDirectives.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-purple-400 font-bold flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-[#2A3441]/50 font-mono">
            Intel Uncertainty: {contributions.intelligence} pts · Confidence: {Math.round(activeIntel * 100)}%
          </div>
        </div>

      </div>

      {/* 3. Contingency & Fallback Rules */}
      <div className="bg-tactical-red/10 border border-tactical-red/30 p-3.5 rounded-btn text-xs space-y-1.5">
        <div className="flex items-center space-x-2 text-tactical-red font-bold uppercase text-[11px]">
          <AlertTriangle className="w-4 h-4" />
          <span>CONTINGENCY & EMERGENCY ABORT PROTOCOL</span>
        </div>
        <ul className="space-y-1 text-slate-300 text-[11px] font-sans">
          {planDirectives.contingencyRules.map((rule, idx) => (
            <li key={idx} className="flex items-start space-x-2">
              <span className="text-tactical-red font-bold">&rarr;</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
