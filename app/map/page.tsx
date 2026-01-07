// Map Page (Placeholder)
// ✅ Code Quality Agent: Map placeholder with venue list

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent } from '@/components/ui/Card';

export default async function MapPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Get venues with event counts
  const venues = await prisma.venue.findMany({
    where: {
      events: { some: { userId: session.user.id } },
    },
    include: {
      _count: { select: { events: true } },
    },
    orderBy: {
      events: { _count: 'desc' },
    },
  });

  return (
    <div className="min-h-screen pb-20">
      <Header title="Map" />

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Venues Visited</h1>
          <p className="text-muted-foreground">
            {venues.length} venue{venues.length !== 1 ? 's' : ''} across your events
          </p>
        </div>

        {/* Map Placeholder */}
        <div className="aspect-video rounded-xl bg-card border border-border flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Interactive map coming soon</p>
            <p className="text-sm text-muted-foreground">Requires Mapbox integration</p>
          </div>
        </div>

        {/* Venue List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">All Venues</h2>
          {venues.length > 0 ? (
            venues.map((venue) => (
              <Card key={venue.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{venue.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {venue.city}, {venue.country}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold">{venue._count.events}</p>
                      <p className="text-xs text-muted-foreground">events</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No venues yet. Log your first event!</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
