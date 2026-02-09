// Home Page / Dashboard
// ✅ Code Quality Agent: Server component with data fetching

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, BarChart3, Trophy, MapPin, Sparkles } from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { EventCard } from '@/components/shared/EventCard';
import { StreakHighlight } from '@/components/shared/StreakHighlight';
import {
  getTeamLogoUrl,
  getNBATeamLogo,
  getMLBTeamLogo,
} from '@/lib/api/team-logos';
import type { EventWithRelations } from '@/types';

// Helper to get logos for an event
async function getEventLogos(
  event: EventWithRelations
): Promise<{ home?: string | null; away?: string | null; artist?: string | null }> {
  const logos: { home?: string | null; away?: string | null; artist?: string | null } = {};

  switch (event.type) {
    case 'SOCCER':
      if (event.soccerMatch) {
        // Try to find teams in database first
        const [homeTeam, awayTeam] = await Promise.all([
          prisma.team.findFirst({
            where: { name: event.soccerMatch.homeTeam, sport: 'SOCCER' },
          }),
          prisma.team.findFirst({
            where: { name: event.soccerMatch.awayTeam, sport: 'SOCCER' },
          }),
        ]);
        
        // Use logoUrl if available, otherwise generate from externalId
        if (homeTeam?.logoUrl) {
          logos.home = homeTeam.logoUrl;
        } else if (homeTeam?.externalId) {
          // Generate Football-Data.org crest URL from external ID
          logos.home = `https://crests.football-data.org/${homeTeam.externalId}.png`;
        }
        // If team not in database, logos.home stays undefined (fallback to initials)
        
        if (awayTeam?.logoUrl) {
          logos.away = awayTeam.logoUrl;
        } else if (awayTeam?.externalId) {
          logos.away = `https://crests.football-data.org/${awayTeam.externalId}.png`;
        }
      }
      break;
    case 'BASKETBALL':
      if (event.basketballGame) {
        // NBA logos use static mappings - always try to get them
        logos.home = getNBATeamLogo(event.basketballGame.homeTeam);
        logos.away = getNBATeamLogo(event.basketballGame.awayTeam);
      }
      break;
    case 'BASEBALL':
      if (event.baseballGame) {
        // MLB logos use static mappings - always try to get them
        logos.home = getMLBTeamLogo(event.baseballGame.homeTeam);
        logos.away = getMLBTeamLogo(event.baseballGame.awayTeam);
      }
      break;
    case 'TENNIS':
      // Tennis uses player initials fallback in TeamLogo component
      break;
    case 'CONCERT':
      if (event.concert?.artist) {
        logos.artist = event.concert.artist.photoUrl;
      }
      break;
  }

  return logos;
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const now = new Date();

  // Fetch user stats, recent events, and monthly streak
  const [stats, recentEvents, eventsThisMonth, venueCount] = await Promise.all([
    prisma.event.groupBy({
      by: ['type'],
      where: { userId: session.user.id },
      _count: { type: true },
    }),
    prisma.event.findMany({
      where: { userId: session.user.id },
      include: {
        venue: true,
        soccerMatch: true,
        basketballGame: true,
        baseballGame: true,
        tennisMatch: { include: { player1: true, player2: true } },
        concert: { include: { artist: true } },
        media: true,
      },
      orderBy: { date: 'desc' },
      take: 5,
    }),
    prisma.event.count({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
      },
    }),
    prisma.venue.count({
      where: {
        events: {
          some: { userId: session.user.id },
        },
      },
    }),
  ]);

  // Fetch logos for all events
  const eventLogos = await Promise.all(
    recentEvents.map((event) => getEventLogos(event as EventWithRelations))
  );

  const totalEvents = stats.reduce((sum, s) => sum + s._count.type, 0);
  const eventsByType: Record<string, number> = {};
  stats.forEach((s) => {
    eventsByType[s.type] = s._count.type;
  });

  const firstName = session.user.name?.split(' ')[0];

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Streak Highlight */}
        <StreakHighlight count={eventsThisMonth} userName={firstName} />

        {/* Compact Stats Row */}
        <section>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            <Link
              href="/events"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/60 border border-border/50 hover:bg-card hover:border-border transition-all flex-shrink-0"
            >
              <Calendar className="h-4 w-4 text-primary" />
              <span className="stat-number-compact">{totalEvents}</span>
              <span className="text-xs text-muted-foreground">events</span>
            </Link>
            <Link
              href="/stats"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/60 border border-border/50 hover:bg-card hover:border-border transition-all flex-shrink-0"
            >
              <BarChart3 className="h-4 w-4 text-green-500" />
              <span className="stat-number-compact">{eventsByType.SOCCER || 0}</span>
              <span className="text-xs text-muted-foreground">matches</span>
            </Link>
            <Link
              href="/stats"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/60 border border-border/50 hover:bg-card hover:border-border transition-all flex-shrink-0"
            >
              <Trophy className="h-4 w-4 text-purple-500" />
              <span className="stat-number-compact">{eventsByType.CONCERT || 0}</span>
              <span className="text-xs text-muted-foreground">concerts</span>
            </Link>
            <Link
              href="/map"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/60 border border-border/50 hover:bg-card hover:border-border transition-all flex-shrink-0"
            >
              <MapPin className="h-4 w-4 text-orange-500" />
              <span className="stat-number-compact">{venueCount}</span>
              <span className="text-xs text-muted-foreground">venues</span>
            </Link>
          </div>
        </section>

        {/* Recent Events */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent Events</h2>
            {recentEvents.length > 0 && (
              <Link
                href="/events"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View all
              </Link>
            )}
          </div>
          {recentEvents.length > 0 ? (
            <div className="space-y-3">
              {recentEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event as EventWithRelations}
                  index={index}
                  logos={eventLogos[index]}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border/50 bg-card/30">
              <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events yet</h3>
              <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                Tap the + button below to log your first live experience
              </p>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
