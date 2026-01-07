'use client';

// Player Profile Page
// 📚 Library Research Agent: React for UI
// ✅ Code Quality Agent: Type safety, loading states, error handling

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  User,
  Calendar,
  MapPin,
  Trophy,
  Target,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface PlayerProfile {
  player: {
    id: string;
    name: string;
    team: string | null;
    nationality: string | null;
    position: string | null;
    externalId: number | null;
  };
  totalStats: {
    goals: number;
    assists: number;
    points: number;
    rebounds: number;
    hits: number;
    homeRuns: number;
    rbis: number;
    appearances: number;
  };
  appearances: Array<{
    id: string;
    goals: number | null;
    assists: number | null;
    points: number | null;
    rebounds: number | null;
    hits: number | null;
    homeRuns: number | null;
    event: {
      id: string;
      date: string;
      type: string;
      venue: { name: string; city: string } | null;
      soccerMatch: { homeTeam: string; awayTeam: string; homeScore: number; awayScore: number } | null;
      basketballGame: { homeTeam: string; awayTeam: string; homeScore: number; awayScore: number } | null;
      baseballGame: { homeTeam: string; awayTeam: string; homeScore: number; awayScore: number } | null;
    };
  }>;
}

export default function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/stats/players/${resolvedParams.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch profile');
        }

        setProfile(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <Header title="Player Profile" />
        <main className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <BottomNav />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen pb-20">
        <Header title="Player Profile" />
        <main className="px-4 py-20 text-center">
          <p className="text-destructive">{error || 'Player not found'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-primary hover:underline"
          >
            Go Back
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Determine sport type from appearances
  const sportType = profile.appearances[0]?.event.type || 'SOCCER';
  const isSoccer = sportType === 'SOCCER';
  const isBasketball = sportType === 'BASKETBALL';
  const isBaseball = sportType === 'BASEBALL';

  return (
    <div className="min-h-screen pb-20">
      <Header title={profile.player.name} />

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/stats/leaderboards"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leaderboards
        </Link>

        {/* Player Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{profile.player.name}</h1>
                {profile.player.team && (
                  <p className="text-muted-foreground">{profile.player.team}</p>
                )}
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  {profile.player.position && (
                    <span>{profile.player.position}</span>
                  )}
                  {profile.player.nationality && (
                    <span>🌍 {profile.player.nationality}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Your Stats with This Player
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-secondary/30 text-center">
                <div className="text-3xl font-bold text-primary">
                  {profile.totalStats.appearances}
                </div>
                <div className="text-sm text-muted-foreground">Times Seen</div>
              </div>

              {isSoccer && (
                <>
                  <div className="p-4 rounded-lg bg-secondary/30 text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {profile.totalStats.goals}
                    </div>
                    <div className="text-sm text-muted-foreground">Goals</div>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 text-center">
                    <div className="text-3xl font-bold text-blue-400">
                      {profile.totalStats.assists}
                    </div>
                    <div className="text-sm text-muted-foreground">Assists</div>
                  </div>
                </>
              )}

              {isBasketball && (
                <>
                  <div className="p-4 rounded-lg bg-secondary/30 text-center">
                    <div className="text-3xl font-bold text-orange-400">
                      {profile.totalStats.points}
                    </div>
                    <div className="text-sm text-muted-foreground">Points</div>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 text-center">
                    <div className="text-3xl font-bold text-blue-400">
                      {profile.totalStats.rebounds}
                    </div>
                    <div className="text-sm text-muted-foreground">Rebounds</div>
                  </div>
                </>
              )}

              {isBaseball && (
                <>
                  <div className="p-4 rounded-lg bg-secondary/30 text-center">
                    <div className="text-3xl font-bold text-red-400">
                      {profile.totalStats.homeRuns}
                    </div>
                    <div className="text-sm text-muted-foreground">Home Runs</div>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {profile.totalStats.hits}
                    </div>
                    <div className="text-sm text-muted-foreground">Hits</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appearances List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Events Attended
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.appearances.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No appearances recorded
              </p>
            ) : (
              <div className="space-y-3">
                {profile.appearances.map((app) => {
                  const match =
                    app.event.soccerMatch ||
                    app.event.basketballGame ||
                    app.event.baseballGame;

                  return (
                    <Link
                      key={app.id}
                      href={`/events/${app.event.id}`}
                      className="block p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          {match && (
                            <div className="font-medium">
                              {match.homeTeam} vs {match.awayTeam}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(app.event.date).toLocaleDateString()}
                            {app.event.venue && (
                              <>
                                <span>•</span>
                                <MapPin className="h-3 w-3" />
                                {app.event.venue.name}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Stats for this event */}
                        <div className="flex gap-3 text-sm">
                          {isSoccer && (
                            <>
                              {(app.goals || 0) > 0 && (
                                <span className="text-green-400">
                                  ⚽ {app.goals}
                                </span>
                              )}
                              {(app.assists || 0) > 0 && (
                                <span className="text-blue-400">
                                  🎯 {app.assists}
                                </span>
                              )}
                            </>
                          )}
                          {isBasketball && (
                            <>
                              {(app.points || 0) > 0 && (
                                <span className="text-orange-400">
                                  {app.points} pts
                                </span>
                              )}
                              {(app.rebounds || 0) > 0 && (
                                <span className="text-blue-400">
                                  {app.rebounds} reb
                                </span>
                              )}
                            </>
                          )}
                          {isBaseball && (
                            <>
                              {(app.homeRuns || 0) > 0 && (
                                <span className="text-red-400">
                                  {app.homeRuns} HR
                                </span>
                              )}
                              {(app.hits || 0) > 0 && (
                                <span className="text-green-400">
                                  {app.hits} H
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      {match && (
                        <div className="mt-2 text-right font-mono font-bold">
                          {match.homeScore} - {match.awayScore}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

