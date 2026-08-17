import { AIAnalysisResponse, AnalysisMode, Citation, DEFAULT_MISSION_PARAMS, MissionParams } from "./types";
import { COA, MissionScenario } from "../simulation/types";

/**
 * Deterministic Fallback Mission Interpreter
 * Parses keywords from user prompt without needing an external API.
 */
export function interpretMissionLocally(text: string): MissionParams {
  const lower = text.toLowerCase();
  
  let weather: MissionParams["weather"] = "NORMAL";
  if (lower.includes("heavy rain") || lower.includes("monsoon") || lower.includes("storm") || lower.includes("torrential")) {
    weather = "HEAVY_RAIN";
  } else if (lower.includes("light rain") || lower.includes("drizzle") || lower.includes("shower")) {
    weather = "LIGHT_RAIN";
  } else if (lower.includes("high wind") || lower.includes("gale") || lower.includes("gust")) {
    weather = "HIGH_WIND";
  } else if (lower.includes("poor") || lower.includes("fog") || lower.includes("severe")) {
    weather = "POOR_CONDITIONS";
  }

  // Extract hours/time limit if mentioned e.g. "5h", "5 hours", "within 6 hours"
  let timeLimit = 6;
  const timeMatch = lower.match(/(\d+)\s*(?:h|hr|hrs|hours?)/);
  if (timeMatch && timeMatch[1]) {
    const parsed = parseInt(timeMatch[1], 10);
    if (parsed >= 1 && parsed <= 48) timeLimit = parsed;
  }

  // Extract resource level e.g. "40%", "0.6", "limited resources"
  let resourceLevel = 0.75;
  const percentMatch = lower.match(/(\d{1,3})\s*%/);
  if (percentMatch && percentMatch[1]) {
    const parsed = parseInt(percentMatch[1], 10) / 100;
    if (parsed >= 0.1 && parsed <= 1.0) resourceLevel = parsed;
  } else if (lower.includes("limited resource") || lower.includes("low fuel") || lower.includes("scarce")) {
    resourceLevel = 0.45;
  } else if (lower.includes("ample") || lower.includes("full resource") || lower.includes("abundant")) {
    resourceLevel = 0.90;
  }

  let terrainPref: MissionParams["terrain_preference"] = "ANY";
  if (lower.includes("avoid water") || lower.includes("no river") || lower.includes("river avoidance")) {
    terrainPref = "AVOID_WATER";
  } else if (lower.includes("avoid terrain") || lower.includes("flat") || lower.includes("avoid difficult")) {
    terrainPref = "AVOID_DIFFICULT";
  }

  return {
    weather,
    resource_level: resourceLevel,
    time_limit: timeLimit,
    terrain_preference: terrainPref,
    extracted_summary: `Interpreted: ${weather} atmospheric state, ${(resourceLevel * 100).toFixed(0)}% resource availability, and ${timeLimit}h mission deadline.`,
  };
}

/**
 * Deterministic Fallback AI Analyst
 * Generates grounded analytical insights directly from computed COA metrics.
 */
export function analyzeCOAsLocally(
  scenario: MissionScenario,
  coas: COA[],
  mode: AnalysisMode
): AIAnalysisResponse {
  const [alpha, bravo, charlie] = coas;
  const preferred = coas.find((c) => c.isPreferred) || bravo;

  let text = "";
  const citations: Citation[] = [];

  switch (mode) {
    case "explain_risk":
      text = `### Operational Risk Decomposition\n\n` +
        `Evaluation of simulated alternatives indicates that **${preferred.title}** presents the lowest overall risk score (**${preferred.risk.overall}/100**, ${preferred.risk.riskBand} Band).\n\n` +
        `- **Terrain Risk Contribution:** ${preferred.risk.contributions.terrain} pts (Mean route terrain roughness score: ${preferred.metrics.terrain_exposure}/100).\n` +
        `- **Weather Exposure Risk:** ${preferred.risk.contributions.weather} pts under current **${scenario.weather_condition}** conditions.\n` +
        `- **Logistics & Resource Stress:** ${preferred.risk.contributions.logistics} pts with projected resource utilization at ${(preferred.metrics.resource_consumption * 100).toFixed(0)}%.\n` +
        `- **Intelligence Uncertainty:** ${preferred.risk.contributions.intelligence} pts (Uncertainty index: ${(preferred.metrics.intel_uncertainty * 100).toFixed(0)}%).\n\n` +
        `> **Decision-Support Note:** This score represents simulated risk computed within a controlled synthetic environment and does not represent an automated military command. Final tactical authorization rests with human leadership.`;
      
      citations.push(
        { coa: preferred.name, factor: "terrain", value: preferred.risk.contributions.terrain, highlightText: `Terrain: ${preferred.risk.contributions.terrain}` },
        { coa: preferred.name, factor: "weather", value: preferred.risk.contributions.weather, highlightText: `Weather: ${preferred.risk.contributions.weather}` },
        { coa: preferred.name, factor: "logistics", value: preferred.risk.contributions.logistics, highlightText: `Logistics: ${preferred.risk.contributions.logistics}` }
      );
      break;

    case "explain_uncertainty":
      text = `### Intelligence & Operational Uncertainty Assessment\n\n` +
        `The intelligence layer integrates synthetic observational reports across Sectors A, B, C, and D.\n\n` +
        `- **COA Alpha** transits adjacent to northern activity nodes with **${(alpha.metrics.intel_uncertainty * 100).toFixed(0)}%** local uncertainty.\n` +
        `- **COA Bravo** leverages verified secondary paved routes, reducing uncertainty to **${(bravo.metrics.intel_uncertainty * 100).toFixed(0)}%**.\n` +
        `- **COA Charlie** circumvents central terrain, yielding an uncertainty factor of **${(charlie.metrics.intel_uncertainty * 100).toFixed(0)}%**.\n\n` +
        `Synthetic intelligence reports indicate heightened sensor variance in marsh corridors. Maintain standard visual confirmation protocols.`;
      
      citations.push(
        { coa: "Alpha", factor: "intelligence", value: alpha.metrics.intel_uncertainty, highlightText: "Alpha uncertainty" },
        { coa: "Bravo", factor: "intelligence", value: bravo.metrics.intel_uncertainty, highlightText: "Bravo uncertainty" }
      );
      break;

    case "what_changed":
      text = `### Scenario Delta & Sensitivity Analysis\n\n` +
        `Parameter modifications directly impacted route cost graphs:\n\n` +
        `1. **Transit Durations:** COA Alpha (${alpha.metrics.estimated_duration_hours}h) vs Bravo (${bravo.metrics.estimated_duration_hours}h) vs Charlie (${charlie.metrics.estimated_duration_hours}h).\n` +
        `2. **Resource Consumption:** Bravo preserves fuel at ${(bravo.metrics.resource_consumption * 100).toFixed(0)}%, compared to Charlie at ${(charlie.metrics.resource_consumption * 100).toFixed(0)}%.\n` +
        `3. **Constraint Compliance:** Alpha status is **${alpha.constraints.status}**, Bravo is **${bravo.constraints.status}**, Charlie is **${charlie.constraints.status}**.\n\n` +
        `**Preferred Simulated Alternative:** **${preferred.title}** with overall risk **${preferred.risk.overall}/100**.`;
      break;

    case "compare":
    case "summarize":
    default:
      text = `### Strategic Course of Action Trade-off Analysis\n\n` +
        `Simulation of three candidate pathways across the **${scenario.name}** environment yields the following operational trade-offs:\n\n` +
        `| Alternative | Distance | Duration | Resources | Risk Score | Constraint Status |\n` +
        `| :--- | :--- | :--- | :--- | :--- | :--- |\n` +
        `| **COA Alpha** | ${alpha.metrics.distance_km} km | ${alpha.metrics.estimated_duration_hours}h | ${(alpha.metrics.resource_consumption * 100).toFixed(0)}% | **${alpha.risk.overall}/100** | \`${alpha.constraints.status}\` |\n` +
        `| **COA Bravo** | ${bravo.metrics.distance_km} km | ${bravo.metrics.estimated_duration_hours}h | ${(bravo.metrics.resource_consumption * 100).toFixed(0)}% | **${bravo.risk.overall}/100** | \`${bravo.constraints.status}\` |\n` +
        `| **COA Charlie** | ${charlie.metrics.distance_km} km | ${charlie.metrics.estimated_duration_hours}h | ${(charlie.metrics.resource_consumption * 100).toFixed(0)}% | **${charlie.risk.overall}/100** | \`${charlie.constraints.status}\` |\n\n` +
        `**Analytical Synthesis:**\n` +
        `- **COA Alpha** offers the most aggressive timeline (${alpha.metrics.estimated_duration_hours}h) by prioritizing major transit corridors, but absorbs higher terrain friction.\n` +
        `- **COA Bravo** delivers optimal sustainability with ${(bravo.metrics.resource_consumption * 100).toFixed(0)}% resource draw.\n` +
        `- **COA Charlie** avoids hazardous terrain zones at the expense of route length (${charlie.metrics.distance_km} km).\n\n` +
        `**Preferred Simulated Alternative:** **${preferred.title}** satisfies all operational envelopes within the defined ${scenario.time_limit}h mission horizon.`;
      
      citations.push(
        { coa: "Alpha", factor: "time", value: alpha.metrics.estimated_duration_hours, highlightText: `${alpha.metrics.estimated_duration_hours}h` },
        { coa: "Bravo", factor: "logistics", value: bravo.metrics.resource_consumption, highlightText: `${(bravo.metrics.resource_consumption * 100).toFixed(0)}%` },
        { coa: "Charlie", factor: "terrain", value: charlie.metrics.terrain_exposure, highlightText: `${charlie.metrics.terrain_exposure}` }
      );
      break;
  }

  return {
    text,
    citations,
    mode,
    isFallback: true,
  };
}
