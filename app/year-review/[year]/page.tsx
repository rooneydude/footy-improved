'use client';

// Year in Review Display Page
// ✅ Code Quality Agent: Year statistics display

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface YearReviewData {
  year: number;
  totalEvents: number;
  eventsByType: Record<string, number>;
  topVenues: { venue: { name: string; city: string }; count: number }[];
  topArtists: { name: string; count: number }[];
  monthlyBreakdown: { month: number; count: number }[];
  countriesVisited: string[];
  achievementsUnlocked: number;
}

export default function YearReviewDetailPage() {
  const params = useParams();
  const year = params.year as string;
  const [data, setData] = useState<YearReviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/year-review/${year}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year]);

  if (loading) {
    return (
      <div className="min-h-screen pb-20">
        <Header title={`${year} Review`} />
        <main className="px-4 py-6 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary rounded w-1/2" />
            <div className="h-32 bg-secondary rounded" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen pb-20">
        <Header title={`${year} Review`} />
        <main className="px-4 py-6 max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">No data for {year}</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="min-h-screen pb-20">
      <Header title={`${year} Review`} />
      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold gradient-text">{year}</h1>
          <p className="text-muted-foreground">Your Year in Review</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-mono font-bold">{data.totalEvents}</p>
              <p className="text-sm text-muted-foreground">Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-mono font-bold">{data.topVenues.length}</p>
              <p className="text-sm text-muted-foreground">Venues</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-mono font-bold">{data.countriesVisited.length}</p>
              <p className="text-sm text-muted-foreground">Countries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-mono font-bold">{data.achievementsUnlocked}</p>
              <p className="text-sm text-muted-foreground">Achievements</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Events by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-32 gap-1">
              {data.monthlyBreakdown.map((item, i) => {
                const max = Math.max(...data.monthlyBreakdown.map((m) => m.count), 1);
                const height = (item.count / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary rounded-t transition-all"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{months[i]}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Venues */}
        {data.topVenues.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Venues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.topVenues.slice(0, 5).map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span>{item.venue.name}</span>
                  <span className="font-mono">{item.count} events</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
