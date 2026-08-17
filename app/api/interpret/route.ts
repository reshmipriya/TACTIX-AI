import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_MISSION_PARAMS, MissionParamsSchema } from "@/lib/ai/types";
import { INTERPRET_SYSTEM_PROMPT } from "@/lib/ai/prompts/interpret";
import { interpretMissionLocally } from "@/lib/ai/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mission_text, study_area_id } = body;

    if (!mission_text || typeof mission_text !== "string") {
      return NextResponse.json(
        { error: "invalid_input", fallback: DEFAULT_MISSION_PARAMS },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    // If OpenAI key is present, try invoking the API with a strict 10s timeout
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: INTERPRET_SYSTEM_PROMPT },
              { role: "user", content: `Study Area: ${study_area_id || "AOI-01"}\nMission: ${mission_text}` },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const completion = await response.json();
          const raw = JSON.parse(completion.choices[0].message.content);
          const parsed = MissionParamsSchema.safeParse(raw);

          if (parsed.success) {
            return NextResponse.json({ params: parsed.data, isFallback: false });
          }
        }
      } catch (err) {
        console.warn("[TACTIX AI API] OpenAI interpret failed or timed out, using deterministic fallback.", err);
      }
    }

    // Graceful fallback: Rule-based local natural language interpreter
    const localResult = interpretMissionLocally(mission_text);
    return NextResponse.json({
      params: localResult,
      isFallback: true,
      note: "Interpreted via built-in deterministic engine",
    });
  } catch (error) {
    console.error("[TACTIX AI API] Error in /api/interpret:", error);
    return NextResponse.json(
      { error: "internal_error", fallback: DEFAULT_MISSION_PARAMS },
      { status: 500 }
    );
  }
}
