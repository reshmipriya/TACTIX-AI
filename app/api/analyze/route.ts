import { NextRequest, NextResponse } from "next/server";
import { ANALYZE_SYSTEM_PROMPT } from "@/lib/ai/prompts/analyze";
import { analyzeCOAsLocally } from "@/lib/ai/client";
import { AnalysisMode } from "@/lib/ai/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scenario, coas, mode = "compare" } = body;

    if (!scenario || !coas || !Array.isArray(coas) || coas.length === 0) {
      return NextResponse.json(
        { error: "invalid_input", message: "Scenario and at least one COA required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    if (apiKey && apiKey.trim().length > 10) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const promptPayload = {
          mode: mode as AnalysisMode,
          current_scenario: {
            name: scenario.name,
            weather: scenario.weather_condition,
            resource_level: scenario.resource_level,
            time_limit: scenario.time_limit,
            intel_confidence: scenario.intelligence_confidence,
          },
          alternatives: coas.map((c: any) => ({
            name: c.name,
            title: c.title,
            distance_km: c.metrics.distance_km,
            duration_hours: c.metrics.estimated_duration_hours,
            resource_consumption_pct: Math.round(c.metrics.resource_consumption * 100),
            terrain_exposure: c.metrics.terrain_exposure,
            weather_exposure: c.metrics.weather_exposure,
            intel_uncertainty_pct: Math.round(c.metrics.intel_uncertainty * 100),
            constraint_status: c.constraints.status,
            risk_score: c.risk.overall,
            risk_contributions: c.risk.contributions,
          })),
        };

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: ANALYZE_SYSTEM_PROMPT },
              { role: "user", content: JSON.stringify(promptPayload, null, 2) },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const completion = await response.json();
          const parsed = JSON.parse(completion.choices[0].message.content);
          if (parsed && typeof parsed.text === "string") {
            return NextResponse.json({
              text: parsed.text,
              citations: parsed.citations || [],
              mode,
              isFallback: false,
            });
          }
        }
      } catch (err) {
        console.warn("[TACTIX AI API] OpenAI analyze failed or timed out, falling back to local engine.", err);
      }
    }

    // Local deterministic analysis engine fallback
    const localAnalysis = analyzeCOAsLocally(scenario, coas, mode as AnalysisMode);
    return NextResponse.json(localAnalysis);
  } catch (error) {
    console.error("[TACTIX AI API] Error in /api/analyze:", error);
    return NextResponse.json(
      { error: "internal_error", message: "Failed to generate AI analysis" },
      { status: 500 }
    );
  }
}
