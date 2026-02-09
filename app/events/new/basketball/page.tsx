'use client';

// Basketball Game Form with API Search and Player Stats
// 📚 Library Research Agent: react-hook-form (44,372 ⭐), zod (41,332 ⭐)
// ✅ Code Quality Agent: Form validation, API integration, player stats

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { MatchSearch, type MatchResult, type BasketballGameResult, type BasketballPlayerAppearance, type PlayerAppearance } from '@/components/shared/MatchSearch';
import { PlayerStatsEditor, type BasketballPlayer, type Player } from '@/components/events/PlayerStatsEditor';
import { TeamBadge } from '@/components/shared/TeamBadge';

const basketballSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  venueName: z.string().min(1, 'Venue name is required'),
  venueCity: z.string().min(1, 'City is required'),
  venueCountry: z.string().min(1, 'Country is required'),
  homeTeam: z.string().min(1, 'Home team is required'),
  awayTeam: z.string().min(1, 'Away team is required'),
  homeScore: z.coerce.number().min(0),
  awayScore: z.coerce.number().min(0),
  competition: z.string().optional(),
  notes: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  externalGameId: z.number().optional(),
});

type BasketballFormData = z.infer<typeof basketballSchema>;

export default function BasketballFormPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [players, setPlayers] = useState<BasketballPlayer[]>([]);
  const [teamIds, setTeamIds] = useState<{
    homeId?: number;
    awayId?: number;
  }>({});

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BasketballFormData>({
    resolver: zodResolver(basketballSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      homeScore: 0,
      awayScore: 0,
      venueCountry: 'USA', // Default for NBA
    },
  });

  const homeScore = watch('homeScore');
  const awayScore = watch('awayScore');
  const homeTeam = watch('homeTeam');
  const awayTeam = watch('awayTeam');

  // Handle game selection from search
  const handleMatchSelect = (result: MatchResult) => {
    const match = result as BasketballGameResult;
    // Auto-fill form fields
    setValue('homeTeam', match.homeTeam);
    setValue('awayTeam', match.awayTeam);
    setValue('homeScore', match.homeScore ?? 0);
    setValue('awayScore', match.awayScore ?? 0);
    setValue('externalGameId', match.id);
    
    // Store team IDs for badge display
    setTeamIds({
      homeId: match.homeTeamId,
      awayId: match.awayTeamId,
    });
    
    // Set date
    if (match.date) {
      const date = new Date(match.date);
      setValue('date', date.toISOString().split('T')[0]);
    }
  };

  // Handle players loaded from API
  const handlePlayersLoaded = (loadedPlayers: PlayerAppearance[]) => {
    const basketballPlayers = loadedPlayers as BasketballPlayerAppearance[];
    const formattedPlayers: BasketballPlayer[] = basketballPlayers.map((p) => ({
      id: p.playerId,
      name: p.playerName,
      team: p.team,
      points: p.points || 0,
      rebounds: p.rebounds || 0,
      assists: p.assists || 0,
    }));
    setPlayers(formattedPlayers);
  };

  const onSubmit = async (data: BasketballFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        appearances: players.map((p) => ({
          playerName: p.name,
          externalId: p.id,
          team: p.team,
          points: p.points,
          rebounds: p.rebounds,
          assists: p.assists,
        })),
      };

      const response = await fetch('/api/events/basketball', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create event');
      }

      router.push('/events');
      router.refresh();
    } catch (error) {
      console.error('Submit error:', error);
      alert(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Header title="Log Basketball Game" />

      <main className="px-4 py-6 max-w-2xl mx-auto">
        <Link
          href="/events/new"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to event types
        </Link>

        {/* API Search */}
        <MatchSearch
          sportType="basketball"
          onMatchSelect={handleMatchSelect}
          onPlayersLoaded={handlePlayersLoaded}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <Input type="date" {...register('date')} error={errors.date?.message} />
          </div>

          {/* Teams and Score */}
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Team Badges Display */}
              {(homeTeam || awayTeam) && (
                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="flex items-center gap-2">
                    <TeamBadge
                      teamName={homeTeam || 'Home'}
                      sport="basketball"
                      externalId={teamIds.homeId}
                      size="lg"
                    />
                    {homeTeam && <span className="text-sm font-medium hidden sm:inline">{homeTeam}</span>}
                  </div>
                  <span className="text-3xl font-mono font-bold">
                    {homeScore} - {awayScore}
                  </span>
                  <div className="flex items-center gap-2">
                    {awayTeam && <span className="text-sm font-medium hidden sm:inline">{awayTeam}</span>}
                    <TeamBadge
                      teamName={awayTeam || 'Away'}
                      sport="basketball"
                      externalId={teamIds.awayId}
                      size="lg"
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-5 gap-4 items-end">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Home Team</label>
                  <Input {...register('homeTeam')} placeholder="Home team" error={errors.homeTeam?.message} />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setValue('homeScore', Math.max(0, homeScore - 1))}
                    className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-xl font-mono font-bold w-20 text-center">
                    {homeScore} - {awayScore}
                  </span>
                  <button
                    type="button"
                    onClick={() => setValue('awayScore', awayScore + 1)}
                    className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Away Team</label>
                  <Input {...register('awayTeam')} placeholder="Away team" error={errors.awayTeam?.message} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <button
                    type="button"
                    onClick={() => setValue('homeScore', homeScore + 2)}
                    className="w-full py-2 px-4 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors"
                  >
                    + Home 2pts
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setValue('awayScore', awayScore + 2)}
                    className="w-full py-2 px-4 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors"
                  >
                    + Away 2pts
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competition */}
          <div>
            <label className="block text-sm font-medium mb-2">League / Competition (Optional)</label>
            <Input {...register('competition')} placeholder="e.g., NBA, EuroLeague" />
          </div>

          {/* Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Arena</label>
              <Input {...register('venueName')} placeholder="Arena name" error={errors.venueName?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <Input {...register('venueCity')} placeholder="City" error={errors.venueCity?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <Input {...register('venueCountry')} placeholder="Country" error={errors.venueCountry?.message} />
            </div>
          </div>

          {/* Player Stats Editor */}
          <PlayerStatsEditor
            sportType="basketball"
            homeTeamName={homeTeam || 'Home Team'}
            awayTeamName={awayTeam || 'Away Team'}
            players={players}
            onPlayersChange={(players) => setPlayers(players as BasketballPlayer[])}
          />

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
            <textarea
              {...register('notes')}
              className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Any memorable moments, big plays, etc."
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">Rating (Optional)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue('rating', star)}
                  className="text-2xl transition-transform hover:scale-110"
                >
                  {star <= (watch('rating') || 0) ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Save Game
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
