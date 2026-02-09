// Events Timeline Page
// ✅ Code Quality Agent: Server component with filtering and search

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, X } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { EventCard } from '@/components/shared/EventCard';
import {
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
        const [homeTeam, awayTeam] = await Promise.all([
          prisma.team.findFirst({
            where: { name: event.soccerMatch.homeTeam, sport: 'SOCCER' },
          }),
          prisma.team.findFirst({
            where: { name: event.soccerMatch.awayTeam, sport: 'SOCCER' },
          }),
        ]);
        
        if (homeTeam?.logoUrl) {
          logos.home = homeTeam.logoUrl;
        } else if (homeTeam?.externalId) {
          logos.home = `https://crests.football-data.org/${homeTeam.externalId}.png`;
        }
        
        if (awayTeam?.logoUrl) {
          logos.away = awayTeam.logoUrl;
        } else if (awayTeam?.externalId) {
          logos.away = `https://crests.football-data.org/${awayTeam.externalId}.png`;
        }
      }
      break;
    case 'BASKETBALL':
      if (event.basketballGame) {
        logos.home = getNBATeamLogo(event.basketballGame.homeTeam);
        logos.away = getNBATeamLogo(event.basketballGame.awayTeam);
      }
      break;
    case 'BASEBALL':
      if (event.baseballGame) {
        logos.home = getMLBTeamLogo(event.baseballGame.homeTeam);
        logos.away = getMLBTeamLogo(event.baseballGame.awayTeam);
      }
      break;
    case 'CONCERT':
      if (event.concert?.artist) {
        logos.artist = event.concert.artist.photoUrl;
      }
      break;
  }

  return logos;
}

// Search form component (client-side for form submission)
function SearchForm({ defaultValue, typeFilter, yearFilter }: { 
  defaultValue?: string; 
  typeFilter?: string;
  yearFilter?: number;
}) {
  return (
    <form method="GET" className="relative">
      {/* Preserve existing filters */}
      {typeFilter && <input type="hidden" name="type" value={typeFilter.toLowerCase()} />}
      {yearFilter && <input type="hidden" name="year" value={yearFilter} />}
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          name="search"
          defaultValue={defaultValue}
          placeholder="Search teams, venues, artists..."
          className="w-full h-10 pl-10 pr-10 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {defaultValue && (
          <Link
            href={`/events${typeFilter ? `?type=${typeFilter.toLowerCase()}` : ''}${yearFilter ? `${typeFilter ? '&' : '?'}year=${yearFilter}` : ''}`}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Link>
        )}
      </div>
    </form>
  );
}

interface EventsPageProps {
  searchParams: Promise<{ type?: string; year?: string; search?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const params = await searchParams;
  const typeFilter = params.type?.toUpperCase();
  const yearFilter = params.year ? parseInt(params.year, 10) : undefined;
  const searchQuery = params.search?.trim();

  // Build where clause
  const where: Record<string, unknown> = { userId: session.user.id };
  if (typeFilter && ['SOCCER', 'BASKETBALL', 'BASEBALL', 'TENNIS', 'CONCERT'].includes(typeFilter)) {
    where.type = typeFilter;
  }
  if (yearFilter) {
    where.date = {
      gte: new Date(`${yearFilter}-01-01`),
      lt: new Date(`${yearFilter + 1}-01-01`),
    };
  }

  // Add search filter using OR across multiple fields
  if (searchQuery) {
    where.OR = [
      { venue: { name: { contains: searchQuery, mode: 'insensitive' } } },
      { venue: { city: { contains: searchQuery, mode: 'insensitive' } } },
      { soccerMatch: { homeTeam: { contains: searchQuery, mode: 'insensitive' } } },
      { soccerMatch: { awayTeam: { contains: searchQuery, mode: 'insensitive' } } },
      { soccerMatch: { competition: { contains: searchQuery, mode: 'insensitive' } } },
      { basketballGame: { homeTeam: { contains: searchQuery, mode: 'insensitive' } } },
      { basketballGame: { awayTeam: { contains: searchQuery, mode: 'insensitive' } } },
      { baseballGame: { homeTeam: { contains: searchQuery, mode: 'insensitive' } } },
      { baseballGame: { awayTeam: { contains: searchQuery, mode: 'insensitive' } } },
      { tennisMatch: { player1: { name: { contains: searchQuery, mode: 'insensitive' } } } },
      { tennisMatch: { player2: { name: { contains: searchQuery, mode: 'insensitive' } } } },
      { concert: { artist: { name: { contains: searchQuery, mode: 'insensitive' } } } },
      { concert: { tourName: { contains: searchQuery, mode: 'insensitive' } } },
      { notes: { contains: searchQuery, mode: 'insensitive' } },
    ];
  }

  const events = await prisma.event.findMany({
    where,
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
  });

  // Get available years for filter
  const years = await prisma.event.findMany({
    where: { userId: session.user.id },
    select: { date: true },
    distinct: ['date'],
  });
  const availableYears = [...new Set(years.map((e) => new Date(e.date).getFullYear()))].sort((a, b) => b - a);

  // Get total count for display
  const totalCount = await prisma.event.count({
    where: { userId: session.user.id },
  });

  // Fetch logos for all events
  const eventLogos = await Promise.all(
    events.map((event) => getEventLogos(event as EventWithRelations))
  );

  const hasFilters = typeFilter || yearFilter || searchQuery;

  return (
    <div className="min-h-screen pb-20">
      <Header title="Events" />

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-4">
        {/* Search Input */}
        <SearchForm 
          defaultValue={searchQuery} 
          typeFilter={typeFilter} 
          yearFilter={yearFilter} 
        />

        {/* Type Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Link
            href={`/events${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}${yearFilter ? `${searchQuery ? '&' : '?'}year=${yearFilter}` : ''}`}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              !typeFilter ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            All
          </Link>
          {['Soccer', 'Basketball', 'Baseball', 'Tennis', 'Concert'].map((type) => (
            <Link
              key={type}
              href={`/events?type=${type.toLowerCase()}${yearFilter ? `&year=${yearFilter}` : ''}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                typeFilter === type.toUpperCase()
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {type}
            </Link>
          ))}
        </div>

        {/* Year Filter */}
        {availableYears.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-sm text-muted-foreground">Year:</span>
            <Link
              href={`/events${typeFilter ? `?type=${typeFilter.toLowerCase()}` : ''}${searchQuery ? `${typeFilter ? '&' : '?'}search=${encodeURIComponent(searchQuery)}` : ''}`}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                !yearFilter ? 'bg-secondary' : 'hover:bg-secondary/50'
              }`}
            >
              All
            </Link>
            {availableYears.map((year) => (
              <Link
                key={year}
                href={`/events?${typeFilter ? `type=${typeFilter.toLowerCase()}&` : ''}year=${year}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  yearFilter === year ? 'bg-secondary' : 'hover:bg-secondary/50'
                }`}
              >
                {year}
              </Link>
            ))}
          </div>
        )}

        {/* Results Count and Clear Filters */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {events.length} {events.length === 1 ? 'event' : 'events'}
            {hasFilters && ` (of ${totalCount} total)`}
          </span>
          {hasFilters && (
            <Link
              href="/events"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Clear all filters
            </Link>
          )}
        </div>

        {/* Events List */}
        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event, index) => (
              <EventCard 
                key={event.id} 
                event={event as EventWithRelations} 
                index={index}
                logos={eventLogos[index]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl border border-dashed border-border">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-muted-foreground mb-4">
              {hasFilters ? 'No events match your filters' : 'No events logged yet'}
            </p>
            {hasFilters ? (
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                Clear filters
              </Link>
            ) : (
              <Link
                href="/events/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Event
              </Link>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
