import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
import type { DirtySpot } from "@/types/dirty-spot";

/**
 * Google periodically renames/retires model IDs. `gemini-1.5-flash` often 404s on v1beta.
 * Override with GEMINI_VISION_MODEL in .env.local if needed.
 */
function visionModelCandidates(): string[] {
  const env = process.env.GEMINI_VISION_MODEL?.trim();
  const defaults = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
  ];
  if (env) {
    return [env, ...defaults.filter((m) => m !== env)];
  }
  return defaults;
}

function extractJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1]! : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as {
      imageBase64?: string;
      mimeType?: string;
      lat?: number;
      lng?: number;
    };

    if (!body.imageBase64 || !body.mimeType) {
      return NextResponse.json(
        { error: "imageBase64 and mimeType are required." },
        { status: 400 },
      );
    }

    const lat = typeof body.lat === "number" ? body.lat : 0;
    const lng = typeof body.lng === "number" ? body.lng : 0;

    const prompt = `You are an environmental cleanup assistant. The user uploaded a REAL photo of litter, illegal dumping, or waste in a public area.

Analyze ONLY what you can see in the image to determine the correct "threat level" or severity of the waste. 

CRITICAL GUIDELINES for distinguishing the threat/severity level:
- "small" (Low Threat): Minor litter, a few scattered wrappers, single bottles or cups. Easily cleaned by 1 person in under 30 minutes. No hazardous materials.
- "medium" (Moderate Threat): A concentrated pile of trash, several bags worth of scattered debris, or small abandoned household items. Requires a small group (2-4 people) and standard supplies.
- "large" (High Threat / Severe Hazard): Massive illegal dumping, large furniture, appliances, construction debris, or potentially hazardous/biological waste (needles, toxic substances). Requires a significant team (4+ people), trucks, or specialized equipment.

If the image does not clearly show trash, litter, or waste, respond with JSON where severity is "small", title is "No clear waste visible", description explains the photo does not show identifiable trash, and estimatedPeople is 1, estimatedMinutes is 10, supplies is ["Camera"].

Otherwise, carefully analyze the volume and type of waste to accurately classify the threat level based on the criteria above.

Respond with ONLY valid JSON (no markdown) using exactly these keys:
{
  "title": string (short, impactful headline),
  "description": string (2-4 sentences explaining what you see AND explicitly justifying why you chose the specific threat level),
  "severity": "small" | "medium" | "large",
  "supplies": string[] (specific cleanup supplies needed based on the threat),
  "estimatedPeople": number (1-8),
  "estimatedMinutes": number (10-180)
}`;

    const genAI = new GoogleGenerativeAI(key);
    const modelsToTry = visionModelCandidates();
    let text: string | null = null;
    let lastErr = "";

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          { text: prompt },
          {
            inlineData: {
              mimeType: body.mimeType,
              data: body.imageBase64,
            },
          },
        ]);
        text = result.response.text();
        if (text?.trim()) break;
      } catch (e: unknown) {
        lastErr = e instanceof Error ? e.message : String(e);
        console.warn(`[analyze-trash] model ${modelName} failed:`, lastErr);
      }
    }

    if (!text?.trim()) {
      return NextResponse.json(
        {
          error:
            lastErr ||
            "Vision models failed. Set GEMINI_VISION_MODEL in .env.local to a model your API key supports (see https://ai.google.dev/gemini-api/docs/models ).",
        },
        { status: 502 },
      );
    }

    const parsed = extractJsonObject(text);
    if (!parsed) {
      return NextResponse.json(
        { error: "Could not parse AI response. Try another photo." },
        { status: 422 },
      );
    }

    const sev = parsed.severity;
    const severity =
      sev === "large" || sev === "medium" || sev === "small" ? sev : "medium";

    const spot: DirtySpot = {
      id: uuidv4(),
      title: String(parsed.title ?? "Trash sighting"),
      description: String(
        parsed.description ?? "AI analysis of uploaded photo.",
      ),
      severity,
      lat,
      lng,
      supplies: Array.isArray(parsed.supplies)
        ? (parsed.supplies as unknown[]).map((s) => String(s))
        : ["Bags", "Gloves"],
      estimatedPeople: Math.min(
        8,
        Math.max(1, Number(parsed.estimatedPeople) || 2),
      ),
      estimatedMinutes: Math.min(
        180,
        Math.max(10, Number(parsed.estimatedMinutes) || 30),
      ),
      reportedBy: "local-user",
      reportedAt: new Date().toISOString(),
      status: "active",
    };

    return NextResponse.json({ spot });
  } catch (e: unknown) {
    console.error("[analyze-trash]", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Vision analysis failed. Try a smaller image or again later.",
      },
      { status: 500 },
    );
  }
}
