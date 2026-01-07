'use client';

// Venue Stats Page
// 📚 Library Research Agent: React for UI
// ✅ Code Quality Agent: Type safety, loading states, error handling

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  MapPin,
  Building,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface VenueStatsEntry {
  venueId: string;
  venueName: string;
  city: string;
  country: string;
  totalEvents: number;
  eventTypes: { type: string; count: number }[];
  wins: number;
  losses: number;
  draws: number;
}

function VenueStatsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [year, setYear] = useState<string>(searchParams.get('year') || '');
  const [venueStats, setVenueStats] = useState<VenueStatsEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch venue stats
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (year) params.append('year', year);

        const response = await fetch(`/api/stats/venues?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch venue stats');
        }

        setVenueStats(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [year]);

  // Update URL when filter changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    router.replace(`/stats/venues?${params}`, { scroll: false });
  }, [year, router]);

  // Get years for filter
  const yearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - i);
  };

  // Get event type emoji
  const getEventTypeEmoji = (type: string): string => {
    switch (type) {
      case 'SOCCER':
        return '⚽';
      case 'BASKETBALL':
        return '🏀';
      case 'BASEBALL':
        return '⚾';
      case 'TENNIS':
        return '🎾';
      case 'CONCERT':
        return '🎤';
      default:
        return '📍';
    }
  };

  // Get win rate display
  const getWinRate = (venue: VenueStatsEntry): string => {
    const totalGames = venue.wins + venue.losses + venue.draws;
    if (totalGames === 0) return '-';
    return `${Math.round((venue.wins / totalGames) * 100)}%`;
  };

  return (
    <div className="min-h-screen pb-20">
      <Header title="Venue Stats" />

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/stats"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          ← Back to Stats
        </Link>

        {/* Year Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Year:</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">All Time</option>
                {yearOptions().map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Venue Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              Venues You've Visited
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">{error}</div>
            ) : venueStats.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No venue data yet</p>
                <p className="text-sm mt-1">
                  Start logging events to see venue statistics
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {venueStats.map((venue) => (
                  <div
                    key={venue.venueId}
                    className="p-4 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{venue.venueName}</h3>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {venue.city}, {venue.country}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">
                          {venue.totalEvents}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          event{venue.totalEvents !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    {/* Event Types Breakdown */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {venue.eventTypes.map((et) => (
                        <span
                          key={et.type}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-sm"
                        >
                          {getEventTypeEmoji(et.type)} {et.count}
                        </span>
                      ))}
                    </div>

                    {/* Win Rate (for sports venues) */}
                    {(venue.wins + venue.losses + venue.draws) > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Home Team Win Rate:
                          </span>
                          <span className="font-bold flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-400" />
                            {getWinRate(venue)}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {venue.wins}W - {venue.draws > 0 ? `${venue.draws}D - ` : ''}
                          {venue.losses}L
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

export default function VenueStatsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VenueStatsContent />
    </Suspense>
  );
}
