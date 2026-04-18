import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    // Fetch species media from GBIF
    const res = await fetch(`https://api.gbif.org/v1/occurrence/search?taxonKey=${id}&mediaType=StillImage&limit=5`);
    
    if (!res.ok) {
      return NextResponse.json({ imageUrl: null }, { status: 200 });
    }
    
    const data = await res.json();
    const results = data.results || [];
    
    for (const r of results) {
      const media = r.media || [];
      for (const m of media) {
        if (m.type === 'StillImage' && m.identifier) {
          return NextResponse.json({ imageUrl: m.identifier });
        }
      }
    }
    
    return NextResponse.json({ imageUrl: null });
  } catch {
    return NextResponse.json({ imageUrl: null });
  }
}
