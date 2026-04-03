import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured on the server." }, { status: 500 });
  }

  try {
    const { squadName, neighborhood, totalKg, streak } = await request.json();

    if (!squadName) {
      return NextResponse.json({ error: "squadName is required." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(key);
    // Use gemini-1.5-flash or whatever the default is in the codebase. 
    // We already saw they use `gemini-2.5-flash` in the chat model, let's use that.
    const modelName = process.env.GEMINI_CHAT_MODEL?.trim() || "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `You are a hype-man for "PLATZ", a gritty, streetwear-inspired civic cleanup movement.
    Generate a short, viral social media caption (under 280 characters if possible) to hype up a specific squad's cleanup stats.
    
    Squad Name: ${squadName}
    Neighborhood: ${neighborhood || "The City"}
    Total Trash Removed: ${totalKg || 0} KG
    Current Streak: ${streak || 0} Weeks
    
    Rules:
    1. Make it sound gritty, badass, and highly motivational (streetwear energy).
    2. Use emojis like ☢️, 🔥, 🗑️, ⚡, 🚧.
    3. Include hashtags #PLATZ #TakBackTheStreets #CivicAction.
    4. Do not include any introductory text like "Here is your caption:", just return the raw caption text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ hypeText: text.trim() });
  } catch (e: unknown) {
    console.error("[generate-hype]", e);
    return NextResponse.json({ error: "Failed to generate hype." }, { status: 500 });
  }
}
