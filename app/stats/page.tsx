'use client';

// Enhanced Stats Dashboard
// 📚 Library Research Agent: React for UI
// ✅ Code Quality Agent: Type safety, loading states, comprehensive stats

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Trophy,
  Users,
  MapPin,
  Calendar,
  Target,
  Music,
  Building,
  TrendingUp,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface OverviewStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  uniqueVenues: number;
  uniquePlayersWitnessed: number;
  // Sport-specific stats (new format)
  soccerStats?: {
    goalsWitnessed: number;
    assistsWitnessed: number;
  };
  basketballStats?: {
    pointsWitnessed: number;
    reboundsWitnessed: number;
    assistsWitnessed: number;
  };
  baseballStats?: {
    hitsWitnessed: number;
    homeRunsWitnessed: number;
    rbisWitnessed: number;
  };
  // Legacy format (backwards compatibility)
  aggregateStats: {
    goalsWitnessed: number;
    assistsWitnessed: number;
    pointsWitnessed: number;
    reboundsWitnessed: number;
    hitsWitnessed: number;
    homeRunsWitnessed: number;
  };
}

export default function StatsPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch overview stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch stats');
        }

        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Stats navigation cards
  const statsCards = [
    {
      title: 'Player Leaderboards',
      description: 'Top players by goals, points, stats',
      href: '/stats/leaderboards',
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Team Records',
      description: 'Win/loss records for teams',
      href: '/stats/teams',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Venue Stats',
      description: 'Events by venue, win rates',
      href: '/stats/venues',
      icon: Building,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Concert Artists',
      description: 'Artists and setlists',
      href: '/stats/leaderboards?sport=concert',
      icon: Music,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="min-h-screen pb-20">
      <Header title="Your Stats" />

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Overview Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : stats ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30 text-center">
                  <div className="text-3xl font-bold text-primary">
                    {stats.totalEvents}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Events
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {stats.uniqueVenues}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Venues Visited
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {stats.uniquePlayersWitnessed}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Players Seen
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30 text-center">
                  <div className="text-3xl font-bold text-yellow-400">
                    {stats.aggregateStats.goalsWitnessed +
                      stats.aggregateStats.homeRunsWitnessed}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Goals/HRs Witnessed
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Events by Type */}
        {stats && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Events by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-lg bg-green-500/10 text-center">
                  <div className="text-2xl">⚽</div>
                  <div className="text-xl font-bold">{stats.eventsByType.soccer || 0}</div>
                  <div className="text-xs text-muted-foreground">Soccer</div>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/10 text-center">
                  <div className="text-2xl">🏀</div>
                  <div className="text-xl font-bold">{stats.eventsByType.basketball || 0}</div>
                  <div className="text-xs text-muted-foreground">Basketball</div>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 text-center">
                  <div className="text-2xl">⚾</div>
                  <div className="text-xl font-bold">{stats.eventsByType.baseball || 0}</div>
                  <div className="text-xs text-muted-foreground">Baseball</div>
                </div>
                <div className="p-3 rounded-lg bg-lime-500/10 text-center">
                  <div className="text-2xl">🎾</div>
                  <div className="text-xl font-bold">{stats.eventsByType.tennis || 0}</div>
                  <div className="text-xs text-muted-foreground">Tennis</div>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 text-center">
                  <div className="text-2xl">🎤</div>
                  <div className="text-xl font-bold">{stats.eventsByType.concert || 0}</div>
                  <div className="text-xs text-muted-foreground">Concerts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sport-Specific Stats - organized by sport to avoid confusion */}
        {stats && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-400" />
                What You've Witnessed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Soccer Stats */}
              {(stats.soccerStats?.goalsWitnessed || stats.soccerStats?.assistsWitnessed || 
                stats.aggregateStats.goalsWitnessed > 0) && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                    ⚽ Soccer
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-green-500/10">
                      <div className="text-sm text-muted-foreground">Goals</div>
                      <div className="text-2xl font-bold text-green-400">
                        {stats.soccerStats?.goalsWitnessed ?? stats.aggregateStats.goalsWitnessed}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10">
                      <div className="text-sm text-muted-foreground">Assists</div>
                      <div className="text-2xl font-bold text-green-400">
                        {stats.soccerStats?.assistsWitnessed ?? stats.aggregateStats.assistsWitnessed}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Basketball Stats */}
              {(stats.basketballStats?.pointsWitnessed || stats.basketballStats?.reboundsWitnessed ||
                stats.aggregateStats.pointsWitnessed > 0) && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                    🏀 Basketball
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-orange-500/10">
                      <div className="text-sm text-muted-foreground">Points</div>
                      <div className="text-2xl font-bold text-orange-400">
                        {stats.basketballStats?.pointsWitnessed ?? stats.aggregateStats.pointsWitnessed}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-500/10">
                      <div className="text-sm text-muted-foreground">Rebounds</div>
                      <div className="text-2xl font-bold text-orange-400">
                        {stats.basketballStats?.reboundsWitnessed ?? stats.aggregateStats.reboundsWitnessed}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-500/10">
                      <div className="text-sm text-muted-foreground">Assists</div>
                      <div className="text-2xl font-bold text-orange-400">
                        {stats.basketballStats?.assistsWitnessed ?? 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Baseball Stats */}
              {(stats.baseballStats?.homeRunsWitnessed || stats.baseballStats?.hitsWitnessed ||
                stats.aggregateStats.homeRunsWitnessed > 0 || stats.aggregateStats.hitsWitnessed > 0) && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                    ⚾ Baseball
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-red-500/10">
                      <div className="text-sm text-muted-foreground">Home Runs</div>
                      <div className="text-2xl font-bold text-red-400">
                        {stats.baseballStats?.homeRunsWitnessed ?? stats.aggregateStats.homeRunsWitnessed}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/10">
                      <div className="text-sm text-muted-foreground">Hits</div>
                      <div className="text-2xl font-bold text-red-400">
                        {stats.baseballStats?.hitsWitnessed ?? stats.aggregateStats.hitsWitnessed}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/10">
                      <div className="text-sm text-muted-foreground">RBIs</div>
                      <div className="text-2xl font-bold text-red-400">
                        {stats.baseballStats?.rbisWitnessed ?? 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {statsCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="block"
            >
              <Card className="hover:bg-secondary/50 transition-colors h-full">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Year in Review Link */}
        <Card className="mt-6">
          <Link href="/year-review">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <Calendar className="h-6 w-6 text-pink-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Year in Review</h3>
                <p className="text-sm text-muted-foreground">
                  See your highlights from any year
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Link>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
