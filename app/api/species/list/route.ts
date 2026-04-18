import { NextResponse } from 'next/server';
import { getAllSpeciesNames } from '@/lib/species';

export async function GET() {
  const speciesList = getAllSpeciesNames();
  return NextResponse.json({
    success: true,
    count: speciesList.length,
    data: speciesList
  });
}
