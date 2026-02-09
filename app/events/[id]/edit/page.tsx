// Edit Event Page
// ✅ Code Quality Agent: Server component wrapper with client form

import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { EditEventForm } from '@/components/events/EditEventForm';

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      venue: true,
      soccerMatch: true,
      basketballGame: true,
      baseballGame: true,
      tennisMatch: {
        include: {
          player1: true,
          player2: true,
        },
      },
      concert: {
        include: {
          artist: true,
        },
      },
    },
  });

  if (!event || event.userId !== session.user.id) {
    notFound();
  }

  // Transform to the format expected by the form
  const eventData = {
    id: event.id,
    type: event.type,
    date: event.date.toISOString(),
    notes: event.notes,
    rating: event.rating,
    companions: event.companions,
    venue: {
      name: event.venue.name,
      city: event.venue.city,
    },
    soccerMatch: event.soccerMatch ? {
      homeTeam: event.soccerMatch.homeTeam,
      awayTeam: event.soccerMatch.awayTeam,
      homeScore: event.soccerMatch.homeScore,
      awayScore: event.soccerMatch.awayScore,
      competition: event.soccerMatch.competition,
    } : null,
    basketballGame: event.basketballGame ? {
      homeTeam: event.basketballGame.homeTeam,
      awayTeam: event.basketballGame.awayTeam,
      homeScore: event.basketballGame.homeScore,
      awayScore: event.basketballGame.awayScore,
      competition: event.basketballGame.competition,
    } : null,
    baseballGame: event.baseballGame ? {
      homeTeam: event.baseballGame.homeTeam,
      awayTeam: event.baseballGame.awayTeam,
      homeScore: event.baseballGame.homeScore,
      awayScore: event.baseballGame.awayScore,
      competition: event.baseballGame.competition,
    } : null,
    tennisMatch: event.tennisMatch ? {
      player1: { name: event.tennisMatch.player1.name },
      player2: { name: event.tennisMatch.player2.name },
      score: event.tennisMatch.score,
      tournament: event.tennisMatch.tournament,
      round: event.tennisMatch.round,
    } : null,
    concert: event.concert ? {
      artist: { name: event.concert.artist.name },
      tourName: event.concert.tourName,
    } : null,
  };

  return (
    <div className="min-h-screen pb-20">
      <Header title="Edit Event" />

      <main className="px-4 py-6 max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href={`/events/${id}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Event
        </Link>

        {/* Edit form */}
        <div className="rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold mb-6">Edit Event Details</h2>
          <EditEventForm event={eventData} />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
