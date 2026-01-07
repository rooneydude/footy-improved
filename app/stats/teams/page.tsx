'use client';

// Team Stats Page
// 📚 Library Research Agent: React for UI
// ✅ Code Quality Agent: Type safety, loading states, error handling

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { TeamBadge } from '@/components/shared/TeamBadge';

interface TeamStatsEntry {
  teamName: string;
  sport: 'soccer' | 'basketball' | 'baseball';
  logoUrl?: string;
  externalId?: number;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  goalsFor: number;
  goalsAgainst: number;
  pointsFor?: number;
  pointsAgainst?: number;
}

function TeamStatsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [year, setYear] = useState<string>(searchParams.get('year') || '');
  const [teamStats, setTeamStats] = useState<TeamStatsEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch team stats
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (year) params.append('year', year);

        const response = await fetch(`/api/stats/teams?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch team stats');
        }

        setTeamStats(data.data || []);
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
    router.replace(`/stats/teams?${params}`, { scroll: false });
  }, [year, router]);

  // Get years for filter
  const yearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - i);
  };

  // Calculate win percentage
  const getWinPercentage = (team: TeamStatsEntry): number => {
    if (team.totalGames === 0) return 0;
    return Math.round((team.wins / team.totalGames) * 100);
  };

  // Get record display
  const getRecordDisplay = (team: TeamStatsEntry): string => {
    if (team.draws > 0) {
      return `${team.wins}-${team.draws}-${team.losses}`;
    }
    return `${team.wins}-${team.losses}`;
  };

  return (
    <div className="min-h-screen pb-20">
      <Header title="Team Stats" />

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

        {/* Team Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Teams You've Watched
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">{error}</div>
            ) : teamStats.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No team data yet</p>
                <p className="text-sm mt-1">
                  Start logging sports events to see team statistics
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {teamStats.map((team, index) => (
                  <div
                    key={`${team.teamName}-${team.sport}`}
                    className="p-4 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <TeamBadge
                          teamName={team.teamName}
                          sport={team.sport}
                          logoUrl={team.logoUrl}
                          externalId={team.externalId}
                          size="lg"
                        />
                        <div>
                          <h3 className="font-semibold text-lg">{team.teamName}</h3>
                          <div className="text-sm text-muted-foreground mt-1">
                            {team.totalGames} game{team.totalGames !== 1 ? 's' : ''} attended
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold font-mono">
                          {getRecordDisplay(team)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getWinPercentage(team)}% win rate
                        </div>
                      </div>
                    </div>

                    {/* Win/Loss Bar */}
                    <div className="mt-4">
                      <div className="flex h-3 rounded-full overflow-hidden bg-secondary">
                        {team.wins > 0 && (
                          <div
                            className="bg-green-500"
                            style={{
                              width: `${(team.wins / team.totalGames) * 100}%`,
                            }}
                          />
                        )}
                        {team.draws > 0 && (
                          <div
                            className="bg-yellow-500"
                            style={{
                              width: `${(team.draws / team.totalGames) * 100}%`,
                            }}
                          />
                        )}
                        {team.losses > 0 && (
                          <div
                            className="bg-red-500"
                            style={{
                              width: `${(team.losses / team.totalGames) * 100}%`,
                            }}
                          />
                        )}
                      </div>
                      <div className="flex justify-between mt-1 text-xs">
                        <span className="text-green-400 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {team.wins} W
                        </span>
                        {team.draws > 0 && (
                          <span className="text-yellow-400 flex items-center gap-1">
                            <Minus className="h-3 w-3" />
                            {team.draws} D
                          </span>
                        )}
                        <span className="text-red-400 flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          {team.losses} L
                        </span>
                      </div>
                    </div>

                    {/* Points/Goals */}
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div className="p-2 rounded bg-secondary/50 text-center">
                        <div className="font-bold text-green-400">
                          {team.pointsFor || team.goalsFor}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {team.pointsFor ? 'Points For' : 'Goals For'}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-secondary/50 text-center">
                        <div className="font-bold text-red-400">
                          {team.pointsAgainst || team.goalsAgainst}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {team.pointsAgainst ? 'Points Against' : 'Goals Against'}
                        </div>
                      </div>
                    </div>
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

export default function TeamStatsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <TeamStatsContent />
    </Suspense>
  );
}
