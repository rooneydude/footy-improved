// Event Detail Page
// ✅ Code Quality Agent: Server component with full event details

import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Star, 
  Users, 
  Edit, 
  Trash2,
  Trophy,
  Target,
  Music,
  Clock
} from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { TeamLogo, ArtistPhoto } from '@/components/shared/TeamLogo';
import { DeleteEventButton } from '@/components/events/DeleteEventButton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

// Get gradient colors for each event type
function getEventGradient(type: string): string {
  const gradients: Record<string, string> = {
    SOCCER: 'from-green-500/20 via-emerald-500/10 to-transparent',
    BASKETBALL: 'from-orange-500/20 via-amber-500/10 to-transparent',
    BASEBALL: 'from-red-500/20 via-rose-500/10 to-transparent',
    TENNIS: 'from-yellow-500/20 via-lime-500/10 to-transparent',
    CONCERT: 'from-purple-500/20 via-violet-500/10 to-transparent',
  };
  return gradients[type] || 'from-gray-500/20 to-transparent';
}

function getAccentColor(type: string): string {
  const colors: Record<string, string> = {
    SOCCER: 'text-green-400',
    BASKETBALL: 'text-orange-400',
    BASEBALL: 'text-red-400',
    TENNIS: 'text-yellow-400',
    CONCERT: 'text-purple-400',
  };
  return colors[type] || 'text-gray-400';
}

function getEventIcon(type: string): string {
  const icons: Record<string, string> = {
    SOCCER: '⚽',
    BASKETBALL: '🏀',
    BASEBALL: '⚾',
    TENNIS: '🎾',
    CONCERT: '🎤',
  };
  return icons[type] || '📅';
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      venue: true,
      media: true,
      soccerMatch: {
        include: {
          appearances: {
            include: { player: true },
            orderBy: { goals: 'desc' },
          },
        },
      },
      basketballGame: {
        include: {
          appearances: {
            include: { player: true },
            orderBy: { points: 'desc' },
          },
        },
      },
      baseballGame: {
        include: {
          appearances: {
            include: { player: true },
            orderBy: { homeRuns: 'desc' },
          },
        },
      },
      tennisMatch: {
        include: {
          player1: true,
          player2: true,
          winner: true,
          appearances: {
            include: { player: true },
          },
        },
      },
      concert: {
        include: {
          artist: true,
          setlist: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!event || event.userId !== session.user.id) {
    notFound();
  }

  const gradient = getEventGradient(event.type);
  const accentColor = getAccentColor(event.type);
  const eventIcon = getEventIcon(event.type);

  return (
    <div className="min-h-screen pb-20">
      <Header title="Event Details" />

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Navigation and actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>
          
          <div className="flex items-center gap-2">
            <Link
              href={`/events/${event.id}/edit`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
            <DeleteEventButton eventId={event.id} eventType={event.type} />
          </div>
        </div>

        {/* Main event card */}
        <div className={cn('relative overflow-hidden rounded-2xl border border-border p-6', 'bg-gradient-to-br', gradient)}>
          {/* Event type badge */}
          <div className="flex items-center justify-between mb-6">
            <span className={cn('text-4xl')}>{eventIcon}</span>
            <span className={cn('text-sm font-medium px-3 py-1 rounded-full bg-background/50', accentColor)}>
              {event.type.charAt(0) + event.type.slice(1).toLowerCase()}
            </span>
          </div>

          {/* Sport match display */}
          {event.type === 'SOCCER' && event.soccerMatch && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <TeamLogo teamName={event.soccerMatch.homeTeam} size="xl" sport="SOCCER" />
                  <span className="font-semibold text-lg">{event.soccerMatch.homeTeam}</span>
                </div>
                <div className="text-center">
                  <span className="text-4xl font-mono font-bold">
                    {event.soccerMatch.homeScore} - {event.soccerMatch.awayScore}
                  </span>
                  {event.soccerMatch.competition && (
                    <p className="text-sm text-muted-foreground mt-1">{event.soccerMatch.competition}</p>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2">
                  <TeamLogo teamName={event.soccerMatch.awayTeam} size="xl" sport="SOCCER" />
                  <span className="font-semibold text-lg">{event.soccerMatch.awayTeam}</span>
                </div>
              </div>
            </div>
          )}

          {event.type === 'BASKETBALL' && event.basketballGame && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <TeamLogo teamName={event.basketballGame.homeTeam} size="xl" sport="BASKETBALL" />
                  <span className="font-semibold text-lg">{event.basketballGame.homeTeam}</span>
                </div>
                <div className="text-center">
                  <span className="text-4xl font-mono font-bold">
                    {event.basketballGame.homeScore} - {event.basketballGame.awayScore}
                  </span>
                  {event.basketballGame.competition && (
                    <p className="text-sm text-muted-foreground mt-1">{event.basketballGame.competition}</p>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2">
                  <TeamLogo teamName={event.basketballGame.awayTeam} size="xl" sport="BASKETBALL" />
                  <span className="font-semibold text-lg">{event.basketballGame.awayTeam}</span>
                </div>
              </div>
            </div>
          )}

          {event.type === 'BASEBALL' && event.baseballGame && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <TeamLogo teamName={event.baseballGame.homeTeam} size="xl" sport="BASEBALL" />
                  <span className="font-semibold text-lg">{event.baseballGame.homeTeam}</span>
                </div>
                <div className="text-center">
                  <span className="text-4xl font-mono font-bold">
                    {event.baseballGame.homeScore} - {event.baseballGame.awayScore}
                  </span>
                  {event.baseballGame.competition && (
                    <p className="text-sm text-muted-foreground mt-1">{event.baseballGame.competition}</p>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2">
                  <TeamLogo teamName={event.baseballGame.awayTeam} size="xl" sport="BASEBALL" />
                  <span className="font-semibold text-lg">{event.baseballGame.awayTeam}</span>
                </div>
              </div>
            </div>
          )}

          {event.type === 'TENNIS' && event.tennisMatch && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <TeamLogo teamName={event.tennisMatch.player1.name} size="xl" sport="TENNIS" />
                  <span className={cn('font-semibold text-lg', event.tennisMatch.winnerId === event.tennisMatch.player1Id && 'text-green-400')}>
                    {event.tennisMatch.player1.name}
                    {event.tennisMatch.winnerId === event.tennisMatch.player1Id && ' 🏆'}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-mono font-bold">
                    {event.tennisMatch.score}
                  </span>
                  {event.tennisMatch.tournament && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.tennisMatch.tournament}
                      {event.tennisMatch.round && ` - ${event.tennisMatch.round}`}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2">
                  <TeamLogo teamName={event.tennisMatch.player2.name} size="xl" sport="TENNIS" />
                  <span className={cn('font-semibold text-lg', event.tennisMatch.winnerId === event.tennisMatch.player2Id && 'text-green-400')}>
                    {event.tennisMatch.player2.name}
                    {event.tennisMatch.winnerId === event.tennisMatch.player2Id && ' 🏆'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {event.type === 'CONCERT' && event.concert && (
            <div className="text-center space-y-4">
              <ArtistPhoto 
                photoUrl={event.concert.artist.photoUrl} 
                artistName={event.concert.artist.name} 
                size="2xl" 
              />
              <div>
                <h2 className="text-2xl font-bold">{event.concert.artist.name}</h2>
                {event.concert.tourName && (
                  <p className={cn('text-lg', accentColor)}>{event.concert.tourName}</p>
                )}
                {event.concert.openingActs && event.concert.openingActs.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Opening acts: {event.concert.openingActs.join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Event meta info */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Calendar className={cn('h-5 w-5', accentColor)} />
              <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className={cn('h-5 w-5', accentColor)} />
              <span>{event.venue.name}, {event.venue.city}</span>
            </div>
            {event.companions && event.companions.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className={cn('h-5 w-5', accentColor)} />
                <span>{event.companions.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Rating */}
          {event.rating && (
            <div className="flex items-center justify-center gap-1 mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-6 w-6',
                    i < event.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-muted/40'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        {event.notes && (
          <div className="rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{event.notes}</p>
          </div>
        )}

        {/* Key player stats (goals, assists, cards - not full lineups) */}
        {event.type === 'SOCCER' && event.soccerMatch?.appearances && event.soccerMatch.appearances.length > 0 && (
          <div className="rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Key Stats
            </h3>
            <div className="space-y-3">
              {event.soccerMatch.appearances.map((app) => (
                <div key={app.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="font-medium">{app.player.name}</span>
                  <div className="flex items-center gap-3 text-sm">
                    {app.goals > 0 && <span className="text-green-400">⚽ {app.goals}</span>}
                    {app.assists > 0 && <span className="text-blue-400">🅰️ {app.assists}</span>}
                    {app.yellowCard && <span>🟨</span>}
                    {app.redCard && <span>🟥</span>}
                    {app.cleanSheet && <span>🧤</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {event.type === 'BASKETBALL' && event.basketballGame?.appearances && event.basketballGame.appearances.length > 0 && (
          <div className="rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Key Stats
            </h3>
            <div className="space-y-3">
              {event.basketballGame.appearances.map((app) => (
                <div key={app.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="font-medium">{app.player.name}</span>
                  <div className="flex items-center gap-3 text-sm">
                    {app.points > 0 && <span className="text-orange-400">{app.points} PTS</span>}
                    {app.rebounds > 0 && <span className="text-blue-400">{app.rebounds} REB</span>}
                    {app.assists > 0 && <span className="text-green-400">{app.assists} AST</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {event.type === 'BASEBALL' && event.baseballGame?.appearances && event.baseballGame.appearances.length > 0 && (
          <div className="rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Key Stats
            </h3>
            <div className="space-y-3">
              {event.baseballGame.appearances.map((app) => (
                <div key={app.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="font-medium">{app.player.name}</span>
                  <div className="flex items-center gap-3 text-sm">
                    {app.homeRuns > 0 && <span className="text-red-400">💥 {app.homeRuns} HR</span>}
                    {app.hits > 0 && <span className="text-blue-400">{app.hits} H</span>}
                    {app.rbis > 0 && <span className="text-green-400">{app.rbis} RBI</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Setlist for concerts */}
        {event.type === 'CONCERT' && event.concert?.setlist && event.concert.setlist.length > 0 && (
          <div className="rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Music className="h-5 w-5" />
              Setlist
            </h3>
            <div className="space-y-2">
              {event.concert.setlist.map((item, index) => (
                <div 
                  key={item.id} 
                  className={cn(
                    'flex items-center gap-3 py-2 border-b border-border/50 last:border-0',
                    item.isEncore && 'bg-purple-500/10 rounded-lg px-2 -mx-2'
                  )}
                >
                  <span className="text-muted-foreground text-sm w-6">{index + 1}.</span>
                  <span className="flex-1 font-medium">
                    {item.songName}
                    {item.isEncore && <span className="text-purple-400 text-sm ml-2">(Encore)</span>}
                  </span>
                  {item.notes && <span className="text-sm text-muted-foreground">{item.notes}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media */}
        {event.media && event.media.length > 0 && (
          <div className="rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-4">Photos & Media</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {event.media.map((item) => (
                <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.url} 
                    alt={item.caption || 'Event photo'} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
