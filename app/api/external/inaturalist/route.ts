import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) return NextResponse.json({ success: false, error: "Missing query" }, { status: 400 });

  try {
    const taxonRes = await fetch(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(query)}&is_active=true&rank=species,genus`);
    if (!taxonRes.ok) throw new Error("iNaturalist Taxon API Error");
    
    const taxonData = await taxonRes.json();
    if (taxonData.results.length === 0) {
      return NextResponse.json({ success: false, error: "Not found on iNat" }, { status: 404 });
    }
    
    const primaryTaxon = taxonData.results[0];
    
    return NextResponse.json({
      success: true,
      taxonId: primaryTaxon.id,
      name: primaryTaxon.name,
      observations_count: primaryTaxon.observations_count,
      threatened: primaryTaxon.threatened,
      url: `https://www.inaturalist.org/taxa/${primaryTaxon.id}`
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to fetch from iNaturalist" }, { status: 500 });
  }
}
