import { NextResponse } from 'next/server';

export async function GET() {
  // Simulated leaderboard data for hackathon API presentation
  const mockLeaderboard = [
    { rank: 1, username: "EcoWarrior", score: 24500, streak: 14 },
    { rank: 2, username: "GreenLeaf", score: 23200, streak: 12 },
    { rank: 3, username: "PlanetSaver", score: 21800, streak: 9 },
    { rank: 4, username: "NatureNinja", score: 19400, streak: 7 },
    { rank: 5, username: "BioHacker", score: 18900, streak: 5 },
  ];

  return NextResponse.json({
    success: true,
    lastUpdated: new Date().toISOString(),
    data: mockLeaderboard
  });
}
