// Map Page - Interactive Venue Map
// Server component that fetches venue data and passes to client map component

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { MapPageClient } from '@/components/map/MapPageClient';
import type { VenueMapData } from '@/components/map/VenueMap';

export default async function MapPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Fetch venues with event counts and event type breakdowns
  const venues = await prisma.venue.findMany({
    where: {
      events: { some: { userId: session.user.id } },
    },
    include: {
      events: {
        where: { userId: session.user.id },
        select: { type: true },
      },
      _count: { select: { events: true } },
    },
    orderBy: {
      events: { _count: 'desc' },
    },
  });

  // Transform to VenueMapData, separating mapped and unmapped
  const mappedVenues: VenueMapData[] = [];
  let unmappedCount = 0;

  for (const venue of venues) {
    // Count events by type for this venue (only user's events)
    const eventTypes: Record<string, number> = {};
    for (const event of venue.events) {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
    }

    if (venue.latitude && venue.longitude) {
      mappedVenues.push({
        id: venue.id,
        name: venue.name,
        city: venue.city,
        country: venue.country,
        latitude: venue.latitude,
        longitude: venue.longitude,
        eventCount: venue.events.length,
        eventTypes,
      });
    } else {
      unmappedCount++;
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <Header title="Map" />

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Venues Visited</h1>
          <p className="text-muted-foreground">
            {venues.length} venue{venues.length !== 1 ? 's' : ''} across your events
            {mappedVenues.length > 0 && mappedVenues.length < venues.length && (
              <span> &middot; {mappedVenues.length} mapped</span>
            )}
          </p>
        </div>

        <MapPageClient venues={mappedVenues} unmappedCount={unmappedCount} />
      </main>

      <BottomNav />
    </div>
  );
}
