// Admin: Backfill Venue Coordinates
// One-time migration endpoint to geocode all venues missing lat/lng
// Protected by NEXTAUTH_SECRET or authenticated session

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { geocodeVenue } from '@/lib/utils/geocode';

export async function POST(request: NextRequest) {
  try {
    // Auth check - require authenticated user or admin secret
    const body = await request.json().catch(() => ({}));
    const adminSecret = body?.secret;

    if (adminSecret === process.env.NEXTAUTH_SECRET) {
      // Admin access via secret
    } else {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Find all venues without coordinates
    const venues = await prisma.venue.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null },
        ],
      },
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
      },
    });

    console.log(`[Geocode Backfill] Found ${venues.length} venues without coordinates`);

    let geocoded = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const venue of venues) {
      // Rate limit: wait 200ms between requests to respect Mapbox rate limits
      if (geocoded > 0 || failed > 0) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      try {
        const result = await geocodeVenue(venue.name, venue.city, venue.country);

        if (result) {
          await prisma.venue.update({
            where: { id: venue.id },
            data: {
              latitude: result.latitude,
              longitude: result.longitude,
            },
          });
          geocoded++;
          console.log(`[Geocode Backfill] ✓ ${venue.name}, ${venue.city}: ${result.latitude}, ${result.longitude}`);
        } else {
          failed++;
          errors.push(`${venue.name}, ${venue.city} - No results`);
          console.warn(`[Geocode Backfill] ✗ ${venue.name}, ${venue.city} - No results`);
        }
      } catch (error) {
        failed++;
        const msg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${venue.name}, ${venue.city} - ${msg}`);
        console.error(`[Geocode Backfill] ✗ ${venue.name}, ${venue.city}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: venues.length,
        geocoded,
        failed,
        errors: errors.slice(0, 20), // Limit error list
      },
    });
  } catch (error) {
    console.error('Geocode backfill error:', error);
    return NextResponse.json(
      { success: false, error: 'Backfill failed' },
      { status: 500 }
    );
  }
}
