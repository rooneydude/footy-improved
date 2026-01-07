// Events Timeline Page
// ✅ Code Quality Agent: Server component with filtering

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Filter } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { EventCard } from '@/components/shared/EventCard';
import type { EventWithRelations } from '@/types';

interface EventsPageProps {
  searchParams: Promise<{ type?: string; year?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const params = await searchParams;
  const typeFilter = params.type?.toUpperCase();
  const yearFilter = params.year ? parseInt(params.year, 10) : undefined;

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

  return (
    <div className="min-h-screen pb-20">
      <Header title="Events" />

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Link
            href="/events"
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              !typeFilter ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            All
          </Link>
          {['Soccer', 'Basketball', 'Baseball', 'Tennis', 'Concert'].map((type) => (
            <Link
              key={type}
              href={`/events?type=${type.toLowerCase()}${yearFilter ? `&year=${yearFilter}` : ''}`}
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
              href={`/events${typeFilter ? `?type=${typeFilter.toLowerCase()}` : ''}`}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                !yearFilter ? 'bg-secondary' : 'hover:bg-secondary/50'
              }`}
            >
              All
            </Link>
            {availableYears.map((year) => (
              <Link
                key={year}
                href={`/events?${typeFilter ? `type=${typeFilter.toLowerCase()}&` : ''}year=${year}`}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  yearFilter === year ? 'bg-secondary' : 'hover:bg-secondary/50'
                }`}
              >
                {year}
              </Link>
            ))}
          </div>
        )}

        {/* Events List */}
        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event as EventWithRelations} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl border border-dashed border-border">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-muted-foreground mb-4">
              {typeFilter || yearFilter ? 'No events match your filters' : 'No events logged yet'}
            </p>
            <Link
              href="/events/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </Link>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
