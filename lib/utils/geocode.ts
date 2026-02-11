// Geocoding Utility
// Uses Mapbox Geocoding API to convert venue names + cities to lat/lng coordinates
// 📚 Library Research Agent: Mapbox Geocoding API (free tier: 100k requests/month)

import { prisma } from '@/lib/prisma';

const MAPBOX_GEOCODING_BASE = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

interface GeocodeResult {
  latitude: number;
  longitude: number;
  placeName: string;
}

/**
 * Geocode a venue by name, city, and country using Mapbox Geocoding API.
 * Returns coordinates or null if geocoding fails.
 */
export async function geocodeVenue(
  name: string,
  city: string,
  country: string
): Promise<GeocodeResult | null> {
  // Check both server-side and client-side env var names
  // MAPBOX_TOKEN is the server-side runtime variable
  // NEXT_PUBLIC_MAPBOX_TOKEN is available at build time for client components
  const token = process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    console.warn('[Geocode] MAPBOX_TOKEN / NEXT_PUBLIC_MAPBOX_TOKEN not set, skipping geocoding');
    return null;
  }

  // Build search query: "Venue Name, City, Country"
  const query = [name, city, country].filter(Boolean).join(', ');
  const encodedQuery = encodeURIComponent(query);

  try {
    const response = await fetch(
      `${MAPBOX_GEOCODING_BASE}/${encodedQuery}.json?access_token=${token}&limit=1&types=poi,address,place`,
      { next: { revalidate: 86400 } } // Cache geocoding results for 24 hours
    );

    if (!response.ok) {
      console.error(`[Geocode] Mapbox API error: ${response.status} for "${query}"`);
      return null;
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      // Fallback: try with just city and country (less specific)
      const fallbackQuery = [city, country].filter(Boolean).join(', ');
      const fallbackEncoded = encodeURIComponent(fallbackQuery);

      const fallbackResponse = await fetch(
        `${MAPBOX_GEOCODING_BASE}/${fallbackEncoded}.json?access_token=${token}&limit=1&types=place,region`,
        { next: { revalidate: 86400 } }
      );

      if (!fallbackResponse.ok) return null;

      const fallbackData = await fallbackResponse.json();
      if (!fallbackData.features || fallbackData.features.length === 0) {
        console.warn(`[Geocode] No results for "${query}" or fallback "${fallbackQuery}"`);
        return null;
      }

      const [lng, lat] = fallbackData.features[0].center;
      return {
        latitude: lat,
        longitude: lng,
        placeName: fallbackData.features[0].place_name,
      };
    }

    const [lng, lat] = data.features[0].center;
    return {
      latitude: lat,
      longitude: lng,
      placeName: data.features[0].place_name,
    };
  } catch (error) {
    console.error(`[Geocode] Error geocoding "${query}":`, error);
    return null;
  }
}

/**
 * Ensure a venue has coordinates. If not, geocode it and update the record.
 * Runs in the background (fire-and-forget) to not block event creation.
 */
export async function ensureVenueCoordinates(
  venueId: string,
  name: string,
  city: string,
  country: string
): Promise<void> {
  try {
    // Check if venue already has coordinates
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      select: { latitude: true, longitude: true },
    });

    if (venue?.latitude && venue?.longitude) {
      return; // Already geocoded
    }

    // Geocode the venue
    const result = await geocodeVenue(name, city, country);
    if (!result) return;

    // Update venue with coordinates
    await prisma.venue.update({
      where: { id: venueId },
      data: {
        latitude: result.latitude,
        longitude: result.longitude,
      },
    });

    console.log(`[Geocode] Updated venue "${name}" (${venueId}): ${result.latitude}, ${result.longitude}`);
  } catch (error) {
    // Don't throw - geocoding failure shouldn't block event creation
    console.error(`[Geocode] Failed to update venue "${name}" (${venueId}):`, error);
  }
}

/**
 * Update a venue with specific coordinates (e.g., from Setlist.fm data).
 */
export async function updateVenueCoordinates(
  venueId: string,
  latitude: number,
  longitude: number
): Promise<void> {
  try {
    await prisma.venue.update({
      where: { id: venueId },
      data: { latitude, longitude },
    });
  } catch (error) {
    console.error(`[Geocode] Failed to set coordinates for venue ${venueId}:`, error);
  }
}
