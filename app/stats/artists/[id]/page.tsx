'use client';

// Artist Profile Page
// 📚 Library Research Agent: React for UI
// ✅ Code Quality Agent: Type safety, loading states, error handling

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Music,
  Calendar,
  MapPin,
  Mic,
  Loader2,
  ArrowLeft,
  Heart,
} from 'lucide-react';
import Link from 'next/link';

interface ArtistProfile {
  artist: {
    id: string;
    name: string;
    mbid: string | null;
    genres: string | null;
  };
  totalStats: {
    concerts: number;
    totalSongsHeard: number;
    uniqueSongs: number;
  };
  topSongs: Array<{ songName: string; count: number }>;
  concerts: Array<{
    id: string;
    tourName: string | null;
    event: {
      id: string;
      date: string;
      venue: { name: string; city: string; country: string } | null;
    };
    setlist: Array<{
      id: string;
      songName: string;
      order: number;
      isEncore: boolean;
    }>;
  }>;
}

export default function ArtistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/stats/artists/${resolvedParams.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch profile');
        }

        setProfile(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <Header title="Artist Profile" />
        <main className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <BottomNav />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen pb-20">
        <Header title="Artist Profile" />
        <main className="px-4 py-20 text-center">
          <p className="text-destructive">{error || 'Artist not found'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-primary hover:underline"
          >
            Go Back
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header title={profile.artist.name} />

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/stats/leaderboards?sport=concert"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leaderboards
        </Link>

        {/* Artist Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Mic className="h-8 w-8 text-purple-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{profile.artist.name}</h1>
                {profile.artist.genres && (
                  <p className="text-muted-foreground">
                    {profile.artist.genres}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Your Stats with This Artist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-secondary/30 text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {profile.totalStats.concerts}
                </div>
                <div className="text-sm text-muted-foreground">Times Seen</div>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30 text-center">
                <div className="text-3xl font-bold text-pink-400">
                  {profile.totalStats.totalSongsHeard}
                </div>
                <div className="text-sm text-muted-foreground">Songs Heard</div>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30 text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {profile.totalStats.uniqueSongs}
                </div>
                <div className="text-sm text-muted-foreground">Unique Songs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Songs */}
        {profile.topSongs.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5 text-purple-400" />
                Most Heard Songs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profile.topSongs.slice(0, 10).map((song, index) => (
                  <div
                    key={song.songName}
                    className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20"
                  >
                    <div className="w-6 text-center font-bold text-muted-foreground">
                      {index + 1}.
                    </div>
                    <div className="flex-1">{song.songName}</div>
                    <div className="text-purple-400 font-bold">
                      {song.count}x
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Concerts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Concerts Attended
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.concerts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No concerts recorded
              </p>
            ) : (
              <div className="space-y-4">
                {profile.concerts.map((concert) => (
                  <Link
                    key={concert.id}
                    href={`/events/${concert.event.id}`}
                    className="block p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-purple-400">
                          {concert.tourName || `${profile.artist.name} Live`}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(concert.event.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        {concert.event.venue && (
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <MapPin className="h-3 w-3" />
                            {concert.event.venue.name}, {concert.event.venue.city}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-pink-400">
                          {concert.setlist.length}
                        </div>
                        <div className="text-xs text-muted-foreground">songs</div>
                      </div>
                    </div>

                    {/* Setlist Preview */}
                    {concert.setlist.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="text-xs text-muted-foreground mb-1">
                          Setlist Preview:
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {concert.setlist.slice(0, 5).map((song, i) => (
                            <span key={song.id}>
                              {song.songName}
                              {i < Math.min(4, concert.setlist.length - 1) && ' • '}
                            </span>
                          ))}
                          {concert.setlist.length > 5 && (
                            <span> +{concert.setlist.length - 5} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

