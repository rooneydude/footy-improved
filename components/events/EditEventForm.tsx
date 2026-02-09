'use client';

// Edit Event Form Component
// ✅ Code Quality Agent: Client component for event editing

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Star, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

// Event type from Prisma
type EventType = 'SOCCER' | 'BASKETBALL' | 'BASEBALL' | 'TENNIS' | 'CONCERT';

interface EventData {
  id: string;
  type: EventType;
  date: string;
  notes: string | null;
  rating: number | null;
  companions: string[];
  venue: {
    name: string;
    city: string;
  };
  soccerMatch?: {
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    competition: string | null;
  } | null;
  basketballGame?: {
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    competition: string | null;
  } | null;
  baseballGame?: {
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    competition: string | null;
  } | null;
  tennisMatch?: {
    player1: { name: string };
    player2: { name: string };
    score: string;
    tournament: string | null;
    round: string | null;
  } | null;
  concert?: {
    artist: { name: string };
    tourName: string | null;
  } | null;
}

interface EditEventFormProps {
  event: EventData;
}

export function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [date, setDate] = useState(event.date.split('T')[0]);
  const [venueName, setVenueName] = useState(event.venue.name);
  const [venueCity, setVenueCity] = useState(event.venue.city);
  const [notes, setNotes] = useState(event.notes || '');
  const [rating, setRating] = useState(event.rating || 0);
  const [companions, setCompanions] = useState<string[]>(event.companions || []);
  const [newCompanion, setNewCompanion] = useState('');

  // Sport-specific state
  const [homeScore, setHomeScore] = useState(
    event.soccerMatch?.homeScore ??
    event.basketballGame?.homeScore ??
    event.baseballGame?.homeScore ??
    0
  );
  const [awayScore, setAwayScore] = useState(
    event.soccerMatch?.awayScore ??
    event.basketballGame?.awayScore ??
    event.baseballGame?.awayScore ??
    0
  );
  const [tennisScore, setTennisScore] = useState(event.tennisMatch?.score || '');
  const [tourName, setTourName] = useState(event.concert?.tourName || '');

  const isSportMatch = ['SOCCER', 'BASKETBALL', 'BASEBALL'].includes(event.type);

  const handleAddCompanion = () => {
    if (newCompanion.trim() && !companions.includes(newCompanion.trim())) {
      setCompanions([...companions, newCompanion.trim()]);
      setNewCompanion('');
    }
  };

  const handleRemoveCompanion = (index: number) => {
    setCompanions(companions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        date: new Date(date).toISOString(),
        venueName,
        venueCity,
        notes: notes || null,
        rating: rating || null,
        companions,
      };

      // Add sport-specific fields
      if (isSportMatch) {
        payload.homeScore = homeScore;
        payload.awayScore = awayScore;
      }
      if (event.type === 'TENNIS') {
        payload.score = tennisScore;
      }
      if (event.type === 'CONCERT') {
        payload.tourName = tourName || null;
      }

      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update event');
      }

      // Redirect back to event detail
      router.push(`/events/${event.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get display info based on event type
  const getMatchInfo = () => {
    if (event.soccerMatch) {
      return {
        homeTeam: event.soccerMatch.homeTeam,
        awayTeam: event.soccerMatch.awayTeam,
        competition: event.soccerMatch.competition,
      };
    }
    if (event.basketballGame) {
      return {
        homeTeam: event.basketballGame.homeTeam,
        awayTeam: event.basketballGame.awayTeam,
        competition: event.basketballGame.competition,
      };
    }
    if (event.baseballGame) {
      return {
        homeTeam: event.baseballGame.homeTeam,
        awayTeam: event.baseballGame.awayTeam,
        competition: event.baseballGame.competition,
      };
    }
    return null;
  };

  const matchInfo = getMatchInfo();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error display */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      {/* Event type badge - read only */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Event Type:</span>
        <span className="px-3 py-1 rounded-full bg-secondary text-sm">
          {event.type.charAt(0) + event.type.slice(1).toLowerCase()}
        </span>
      </div>

      {/* Match info - read only (teams can't be changed) */}
      {matchInfo && (
        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Match</p>
          <p className="font-semibold">{matchInfo.homeTeam} vs {matchInfo.awayTeam}</p>
          {matchInfo.competition && (
            <p className="text-sm text-muted-foreground">{matchInfo.competition}</p>
          )}
        </div>
      )}

      {event.type === 'TENNIS' && event.tennisMatch && (
        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Match</p>
          <p className="font-semibold">
            {event.tennisMatch.player1.name} vs {event.tennisMatch.player2.name}
          </p>
          {event.tennisMatch.tournament && (
            <p className="text-sm text-muted-foreground">
              {event.tennisMatch.tournament}
              {event.tennisMatch.round && ` - ${event.tennisMatch.round}`}
            </p>
          )}
        </div>
      )}

      {event.type === 'CONCERT' && event.concert && (
        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Artist</p>
          <p className="font-semibold">{event.concert.artist.name}</p>
        </div>
      )}

      {/* Date */}
      <div>
        <label className="block text-sm font-medium mb-2">Date</label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {/* Venue */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Venue Name</label>
          <Input
            type="text"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <Input
            type="text"
            value={venueCity}
            onChange={(e) => setVenueCity(e.target.value)}
          />
        </div>
      </div>

      {/* Scores for sport matches */}
      {isSportMatch && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {matchInfo?.homeTeam || 'Home'} Score
            </label>
            <Input
              type="number"
              min="0"
              value={homeScore}
              onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {matchInfo?.awayTeam || 'Away'} Score
            </label>
            <Input
              type="number"
              min="0"
              value={awayScore}
              onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      )}

      {/* Tennis score */}
      {event.type === 'TENNIS' && (
        <div>
          <label className="block text-sm font-medium mb-2">Score</label>
          <Input
            type="text"
            value={tennisScore}
            onChange={(e) => setTennisScore(e.target.value)}
            placeholder="e.g., 6-4, 3-6, 7-5"
          />
        </div>
      )}

      {/* Concert tour name */}
      {event.type === 'CONCERT' && (
        <div>
          <label className="block text-sm font-medium mb-2">Tour Name</label>
          <Input
            type="text"
            value={tourName}
            onChange={(e) => setTourName(e.target.value)}
            placeholder="e.g., World Tour 2026"
          />
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(rating === star ? 0 : star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'h-8 w-8 transition-colors',
                  star <= rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-muted/40 hover:text-muted'
                )}
              />
            </button>
          ))}
          {rating > 0 && (
            <button
              type="button"
              onClick={() => setRating(0)}
              className="ml-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Companions */}
      <div>
        <label className="block text-sm font-medium mb-2">Companions</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {companions.map((companion, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm"
            >
              {companion}
              <button
                type="button"
                onClick={() => handleRemoveCompanion(index)}
                className="hover:text-red-400 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            value={newCompanion}
            onChange={(e) => setNewCompanion(e.target.value)}
            placeholder="Add companion..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCompanion();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddCompanion}
            className="px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-2">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Any memorable moments, thoughts about the event..."
        />
      </div>

      {/* Submit button */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
