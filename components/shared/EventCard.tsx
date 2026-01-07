'use client';

// Event Card Component
// ✅ Code Quality Agent: Reusable event display card

import Link from 'next/link';
import { MapPin, Calendar, Star } from 'lucide-react';
import { cn, getEventEmoji, getEventBgColor, formatShortDate } from '@/lib/utils';
import type { EventWithRelations } from '@/types';

interface EventCardProps {
  event: EventWithRelations;
}

export function EventCard({ event }: EventCardProps) {
  const emoji = getEventEmoji(event.type);
  const bgColor = getEventBgColor(event.type);

  // Get event title based on type
  let title = '';
  let subtitle = '';

  switch (event.type) {
    case 'SOCCER':
      if (event.soccerMatch) {
        title = `${event.soccerMatch.homeTeam} vs ${event.soccerMatch.awayTeam}`;
        subtitle = `${event.soccerMatch.homeScore} - ${event.soccerMatch.awayScore}`;
      }
      break;
    case 'BASKETBALL':
      if (event.basketballGame) {
        title = `${event.basketballGame.homeTeam} vs ${event.basketballGame.awayTeam}`;
        subtitle = `${event.basketballGame.homeScore} - ${event.basketballGame.awayScore}`;
      }
      break;
    case 'BASEBALL':
      if (event.baseballGame) {
        title = `${event.baseballGame.homeTeam} vs ${event.baseballGame.awayTeam}`;
        subtitle = `${event.baseballGame.homeScore} - ${event.baseballGame.awayScore}`;
      }
      break;
    case 'TENNIS':
      if (event.tennisMatch) {
        title = `${event.tennisMatch.player1.name} vs ${event.tennisMatch.player2.name}`;
        subtitle = event.tennisMatch.score;
      }
      break;
    case 'CONCERT':
      if (event.concert) {
        title = event.concert.artist.name;
        subtitle = event.concert.tourName || 'Concert';
      }
      break;
  }

  return (
    <Link
      href={`/events/${event.id}`}
      className={cn(
        'block rounded-xl border border-border p-4 transition-all duration-200',
        bgColor,
        'hover:border-border/60'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{emoji}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{title || 'Event'}</h3>
          {subtitle && (
            <p className="text-lg font-mono font-bold text-foreground/80">{subtitle}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatShortDate(event.date)}
            </span>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{event.venue.name}</span>
            </span>
          </div>
          {event.rating && (
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3.5 w-3.5',
                    i < event.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-muted'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}


