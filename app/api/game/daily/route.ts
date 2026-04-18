import { NextResponse } from 'next/server';
import { getDailySpecies } from '@/lib/gameUtils';

export async function GET() {
  const daily = getDailySpecies();
  
  // We purposefully do not expose the hints or identity directly here
  // so users cannot cheat by inspecting the API response before playing.
  return NextResponse.json({
    success: true,
    date: new Date().toISOString().split('T')[0],
    kingdom: daily.kingdom,
    biome: daily.biome,
    conservationStatus: daily.conservationStatus,
    maxScore: 500,
    message: "Use the UI to play the challenge. Do not cheat by looking at the API!"
  });
}
