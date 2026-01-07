'use client';

// Player Leaderboards Page
// 📚 Library Research Agent: Using React Query for data fetching
// ✅ Code Quality Agent: Type safety, loading states, error handling

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Trophy,
  Target,
  Medal,
  Users,
  Loader2,
  TrendingUp,
  Music,
} from 'lucide-react';
import Link from 'next/link';
import { TeamBadge } from '@/components/shared/TeamBadge';

type SportType = 'soccer' | 'basketball' | 'baseball' | 'concert';
type SoccerStat = 'goals' | 'assists' | 'appearances';
type BasketballStat = 'points' | 'rebounds' | 'assists' | 'appearances';
type BaseballStat = 'homeRuns' | 'hits' | 'rbis' | 'appearances';

interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  teamName?: string;
  artistName?: string;
  totalGoals?: number;
  totalAssists?: number;
  totalPoints?: number;
  totalRebounds?: number;
  totalHits?: number;
  totalHomeRuns?: number;
  appearances?: number;
  timesSeen?: number;
  totalSongsHeard?: number;
}

function LeaderboardsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sport, setSport] = useState<SportType>(
    (searchParams.get('sport') as SportType) || 'soccer'
  );
  const [statType, setStatType] = useState<string>(
    searchParams.get('stat') || 'goals'
  );
  const [year, setYear] = useState<string>(searchParams.get('year') || '');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append('sport', sport);
        params.append('stat', statType);
        if (year) params.append('year', year);

        const response = await fetch(`/api/stats/leaderboards?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch leaderboard');
        }

        setLeaderboard(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [sport, statType, year]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.append('sport', sport);
    params.append('stat', statType);
    if (year) params.append('year', year);
    router.replace(`/stats/leaderboards?${params}`, { scroll: false });
  }, [sport, statType, year, router]);

  // Get stat options based on sport
  const getStatOptions = () => {
    switch (sport) {
      case 'soccer':
        return [
          { value: 'goals', label: 'Goals', icon: '⚽' },
          { value: 'assists', label: 'Assists', icon: '🎯' },
          { value: 'appearances', label: 'Appearances', icon: '👤' },
        ];
      case 'basketball':
        return [
          { value: 'points', label: 'Points', icon: '🏀' },
          { value: 'rebounds', label: 'Rebounds', icon: '📊' },
          { value: 'assists', label: 'Assists', icon: '🎯' },
          { value: 'appearances', label: 'Appearances', icon: '👤' },
        ];
      case 'baseball':
        return [
          { value: 'homeRuns', label: 'Home Runs', icon: '⚾' },
          { value: 'hits', label: 'Hits', icon: '🏏' },
          { value: 'rbis', label: 'RBIs', icon: '📈' },
          { value: 'appearances', label: 'Appearances', icon: '👤' },
        ];
      case 'concert':
        return [
          { value: 'timesSeen', label: 'Times Seen', icon: '🎤' },
          { value: 'songs', label: 'Songs Heard', icon: '🎵' },
        ];
      default:
        return [];
    }
  };

  // Get display value for an entry
  const getDisplayValue = (entry: LeaderboardEntry) => {
    if (sport === 'concert') {
      return entry.timesSeen || entry.totalSongsHeard || 0;
    }

    switch (statType) {
      case 'goals':
        return entry.totalGoals || 0;
      case 'assists':
        return entry.totalAssists || 0;
      case 'points':
        return entry.totalPoints || 0;
      case 'rebounds':
        return entry.totalRebounds || 0;
      case 'homeRuns':
        return entry.totalHomeRuns || 0;
      case 'hits':
        return entry.totalHits || 0;
      case 'rbis':
        return entry.appearances || 0;
      case 'appearances':
        return entry.appearances || 0;
      default:
        return 0;
    }
  };

  // Get years for filter (last 10 years)
  const yearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - i);
  };

  // Get medal for position
  const getMedal = (position: number) => {
    switch (position) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `${position + 1}.`;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Header title="Leaderboards" />

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/stats"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          ← Back to Stats
        </Link>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Sport Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Sport</label>
                <select
                  value={sport}
                  onChange={(e) => {
                    const newSport = e.target.value as SportType;
                    setSport(newSport);
                    // Reset stat type to default for new sport
                    setStatType(
                      newSport === 'soccer'
                        ? 'goals'
                        : newSport === 'basketball'
                        ? 'points'
                        : newSport === 'baseball'
                        ? 'homeRuns'
                        : 'timesSeen'
                    );
                  }}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="soccer">⚽ Soccer</option>
                  <option value="basketball">🏀 Basketball</option>
                  <option value="baseball">⚾ Baseball</option>
                  <option value="concert">🎤 Concerts</option>
                </select>
              </div>

              {/* Stat Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Stat</label>
                <select
                  value={statType}
                  onChange={(e) => setStatType(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {getStatOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">All Time</option>
                  {yearOptions().map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              {sport === 'concert' ? 'Artists' : 'Players'} Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">{error}</div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No data yet</p>
                <p className="text-sm mt-1">
                  Start logging events with player stats to see the leaderboard
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <Link
                    key={entry.playerId}
                    href={
                      sport === 'concert'
                        ? `/stats/artists/${entry.playerId}`
                        : `/stats/players/${entry.playerId}`
                    }
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    {/* Position */}
                    <div className="w-8 text-center text-lg font-bold">
                      {getMedal(index)}
                    </div>

                    {/* Team Badge */}
                    {entry.teamName && sport !== 'concert' && (
                      <TeamBadge
                        teamName={entry.teamName}
                        sport={sport as 'soccer' | 'basketball' | 'baseball'}
                        size="sm"
                      />
                    )}

                    {/* Player/Artist Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {sport === 'concert' ? entry.artistName : entry.playerName}
                      </div>
                      {entry.teamName && (
                        <div className="text-sm text-muted-foreground truncate">
                          {entry.teamName}
                        </div>
                      )}
                    </div>

                    {/* Stat Value */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {getDisplayValue(entry)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {sport === 'concert'
                          ? statType === 'timesSeen'
                            ? 'times'
                            : 'songs'
                          : getStatOptions().find((o) => o.value === statType)?.label}
                      </div>
                    </div>
                  </Link>
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

export default function LeaderboardsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LeaderboardsContent />
    </Suspense>
  );
}
