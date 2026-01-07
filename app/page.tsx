// Home Page / Dashboard
// ✅ Code Quality Agent: Server component with data fetching

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Calendar, BarChart3, Trophy, MapPin } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { EventCard } from '@/components/shared/EventCard';
import { getEventEmoji } from '@/lib/utils';
import type { EventWithRelations } from '@/types';

// Quick add buttons for event types
const quickAddItems = [
  { type: 'soccer', emoji: '⚽', label: 'Soccer', href: '/events/new/soccer' },
  { type: 'basketball', emoji: '🏀', label: 'Basketball', href: '/events/new/basketball' },
  { type: 'baseball', emoji: '⚾', label: 'Baseball', href: '/events/new/baseball' },
  { type: 'tennis', emoji: '🎾', label: 'Tennis', href: '/events/new/tennis' },
  { type: 'concert', emoji: '🎵', label: 'Concert', href: '/events/new/concert' },
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Fetch user stats and recent events
  const [stats, recentEvents] = await Promise.all([
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
  ]);

  const totalEvents = stats.reduce((sum, s) => sum + s._count.type, 0);
  const eventsByType: Record<string, number> = {};
  stats.forEach((s) => {
    eventsByType[s.type] = s._count.type;
  });

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-8">
        {/* Welcome Section */}
        <section>
          <h1 className="text-2xl font-bold">
            Welcome back, {session.user.name?.split(' ')[0] || 'Fan'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {totalEvents === 0
              ? 'Start tracking your live experiences'
              : `You've logged ${totalEvents} event${totalEvents === 1 ? '' : 's'}`}
          </p>
        </section>

        {/* Quick Add Section */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Quick Add</h2>
          <div className="grid grid-cols-5 gap-2">
            {quickAddItems.map((item) => (
              <Link
                key={item.type}
                href={item.href}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border border-border hover:bg-card-hover transition-colors"
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Stats Overview */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Your Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/events"
              className="p-4 rounded-xl bg-card border border-border hover:bg-card-hover transition-colors"
            >
              <Calendar className="h-5 w-5 text-primary mb-2" />
              <p className="stat-number">{totalEvents}</p>
              <p className="text-sm text-muted-foreground">Total Events</p>
            </Link>
            <Link
              href="/stats"
              className="p-4 rounded-xl bg-card border border-border hover:bg-card-hover transition-colors"
            >
              <BarChart3 className="h-5 w-5 text-green-500 mb-2" />
              <p className="stat-number">{eventsByType.SOCCER || 0}</p>
              <p className="text-sm text-muted-foreground">Matches</p>
            </Link>
            <Link
              href="/achievements"
              className="p-4 rounded-xl bg-card border border-border hover:bg-card-hover transition-colors"
            >
              <Trophy className="h-5 w-5 text-yellow-500 mb-2" />
              <p className="stat-number">{eventsByType.CONCERT || 0}</p>
              <p className="text-sm text-muted-foreground">Concerts</p>
            </Link>
            <Link
              href="/map"
              className="p-4 rounded-xl bg-card border border-border hover:bg-card-hover transition-colors"
            >
              <MapPin className="h-5 w-5 text-purple-500 mb-2" />
              <p className="stat-number">-</p>
              <p className="text-sm text-muted-foreground">Venues</p>
            </Link>
          </div>
        </section>

        {/* Recent Events */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Events</h2>
            <Link
              href="/events"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {recentEvents.length > 0 ? (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <EventCard key={event.id} event={event as EventWithRelations} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl border border-dashed border-border">
              <p className="text-4xl mb-3">📅</p>
              <p className="text-muted-foreground mb-4">No events logged yet</p>
              <Link
                href="/events/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Your First Event
              </Link>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
