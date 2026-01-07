// New Event Type Selector
// ✅ Code Quality Agent: Clear navigation to event forms

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

const eventTypes = [
  {
    type: 'soccer',
    emoji: '⚽',
    label: 'Soccer Match',
    description: 'Log a football/soccer match with lineups and stats',
    href: '/events/new/soccer',
    color: 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20',
  },
  {
    type: 'basketball',
    emoji: '🏀',
    label: 'Basketball Game',
    description: 'Track NBA or basketball games with box scores',
    href: '/events/new/basketball',
    color: 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20',
  },
  {
    type: 'baseball',
    emoji: '⚾',
    label: 'Baseball Game',
    description: 'Log MLB or baseball games with player stats',
    href: '/events/new/baseball',
    color: 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20',
  },
  {
    type: 'tennis',
    emoji: '🎾',
    label: 'Tennis Match',
    description: 'Record tennis matches with scores and players',
    href: '/events/new/tennis',
    color: 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20',
  },
  {
    type: 'concert',
    emoji: '🎵',
    label: 'Concert',
    description: 'Track concerts with setlists and artist info',
    href: '/events/new/concert',
    color: 'bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20',
  },
];

export default async function NewEventPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen pb-20">
      <Header title="New Event" />

      <main className="px-4 py-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Log an Event</h1>
        <p className="text-muted-foreground mb-6">
          Choose the type of event you want to log
        </p>

        <div className="space-y-3">
          {eventTypes.map((event) => (
            <Link
              key={event.type}
              href={event.href}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${event.color}`}
            >
              <span className="text-4xl">{event.emoji}</span>
              <div className="flex-1">
                <h2 className="font-semibold">{event.label}</h2>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
