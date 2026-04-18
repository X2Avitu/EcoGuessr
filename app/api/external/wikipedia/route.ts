import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) return NextResponse.json({ success: false, error: "Missing query" }, { status: 400 });

  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=${encodeURIComponent(query)}&exsentences=3&explaintext=1&redirects=1`);
    if (!res.ok) throw new Error("Wiki API Error");
    
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    if (pageId === "-1") {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      extract: pages[pageId].extract,
      title: pages[pageId].title,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(pages[pageId].title)}`
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to fetch from Wikipedia" }, { status: 500 });
  }
}
