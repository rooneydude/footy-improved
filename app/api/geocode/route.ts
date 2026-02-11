// Geocoding API Route
// Server-side proxy to Mapbox Geocoding API
// Keeps the token server-side for geocoding calls

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { geocodeVenue } from '@/lib/utils/geocode';

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const city = searchParams.get('city') || '';
    const country = searchParams.get('country') || '';

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const result = await geocodeVenue(query, city, country);

    if (!result) {
      return NextResponse.json(
        { error: 'No results found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      latitude: result.latitude,
      longitude: result.longitude,
      placeName: result.placeName,
    });
  } catch (error) {
    console.error('Geocode API error:', error);
    return NextResponse.json(
      { error: 'Geocoding failed' },
      { status: 500 }
    );
  }
}
