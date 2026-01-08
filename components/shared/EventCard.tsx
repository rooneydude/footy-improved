'use client';

// Event Card Component
// ✅ Code Quality Agent: Premium reusable event display card

import Link from 'next/link';
import { MapPin, Calendar, Star, ChevronRight } from 'lucide-react';
import { cn, getEventEmoji, formatRelativeDate, formatShortDate } from '@/lib/utils';
import type { EventWithRelations } from '@/types';

interface EventCardProps {
  event: EventWithRelations;
  index?: number;
}

// Get gradient colors for each event type
function getEventGradient(type: string): string {
  const gradients: Record<string, string> = {
    SOCCER: 'from-green-500/15 via-emerald-500/10 to-transparent',
    BASKETBALL: 'from-orange-500/15 via-amber-500/10 to-transparent',
    BASEBALL: 'from-red-500/15 via-rose-500/10 to-transparent',
    TENNIS: 'from-yellow-500/15 via-lime-500/10 to-transparent',
    CONCERT: 'from-purple-500/15 via-violet-500/10 to-transparent',
  };
  return gradients[type] || 'from-gray-500/15 to-transparent';
}

function getEventBorderColor(type: string): string {
  const borders: Record<string, string> = {
    SOCCER: 'border-green-500/30 hover:border-green-500/50',
    BASKETBALL: 'border-orange-500/30 hover:border-orange-500/50',
    BASEBALL: 'border-red-500/30 hover:border-red-500/50',
    TENNIS: 'border-yellow-500/30 hover:border-yellow-500/50',
    CONCERT: 'border-purple-500/30 hover:border-purple-500/50',
  };
  return borders[type] || 'border-border';
}

function getScoreBadgeColor(type: string): string {
  const colors: Record<string, string> = {
    SOCCER: 'bg-green-500/20 text-green-300',
    BASKETBALL: 'bg-orange-500/20 text-orange-300',
    BASEBALL: 'bg-red-500/20 text-red-300',
    TENNIS: 'bg-yellow-500/20 text-yellow-300',
    CONCERT: 'bg-purple-500/20 text-purple-300',
  };
  return colors[type] || 'bg-gray-500/20 text-gray-300';
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const emoji = getEventEmoji(event.type);
  const gradient = getEventGradient(event.type);
  const borderColor = getEventBorderColor(event.type);
  const scoreBadgeColor = getScoreBadgeColor(event.type);

  // Get event title and score based on type
  let title = '';
  let score = '';

  switch (event.type) {
    case 'SOCCER':
      if (event.soccerMatch) {
        title = `${event.soccerMatch.homeTeam} vs ${event.soccerMatch.awayTeam}`;
        score = `${event.soccerMatch.homeScore} - ${event.soccerMatch.awayScore}`;
      }
      break;
    case 'BASKETBALL':
      if (event.basketballGame) {
        title = `${event.basketballGame.homeTeam} vs ${event.basketballGame.awayTeam}`;
        score = `${event.basketballGame.homeScore} - ${event.basketballGame.awayScore}`;
      }
      break;
    case 'BASEBALL':
      if (event.baseballGame) {
        title = `${event.baseballGame.homeTeam} vs ${event.baseballGame.awayTeam}`;
        score = `${event.baseballGame.homeScore} - ${event.baseballGame.awayScore}`;
      }
      break;
    case 'TENNIS':
      if (event.tennisMatch) {
        title = `${event.tennisMatch.player1.name} vs ${event.tennisMatch.player2.name}`;
        score = event.tennisMatch.score;
      }
      break;
    case 'CONCERT':
      if (event.concert) {
        title = event.concert.artist.name;
        score = event.concert.tourName || '';
      }
      break;
  }

  return (
    <Link
      href={`/events/${event.id}`}
      className={cn(
        'block relative overflow-hidden rounded-2xl border p-5 transition-all duration-300',
        borderColor,
        'hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5',
        'animate-card-in'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Gradient background */}
      <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)} />

      {/* Content */}
      <div className="relative flex items-start gap-4">
        {/* Large emoji */}
        <div className="flex-shrink-0">
          <span className="text-5xl block">{emoji}</span>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-bold text-lg truncate pr-6">{title || 'Event'}</h3>

          {/* Score badge */}
          {score && (
            <span
              className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-mono font-bold mt-2',
                scoreBadgeColor
              )}
            >
              {score}
            </span>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{formatRelativeDate(event.date)}</span>
            </span>
            <span className="flex items-center gap-1.5 truncate">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{event.venue.name}</span>
            </span>
          </div>

          {/* Rating */}
          {event.rating && (
            <div className="flex items-center gap-1 mt-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i < event.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-muted/40'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Arrow indicator */}
        <div className="absolute top-1/2 right-2 -translate-y-1/2">
          <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
        </div>
      </div>
    </Link>
  );
}


