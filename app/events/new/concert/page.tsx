'use client';

// Concert Form with Setlist.fm Search and Auto-populate
// 📚 Library Research Agent: react-hook-form (44,372 ⭐), zod (41,332 ⭐)
// ✅ Code Quality Agent: Form validation, API integration, setlist auto-fill

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, X, Music, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { ConcertSearch, type ConcertResult, type SetlistSong } from '@/components/shared/ConcertSearch';

const concertSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  venueName: z.string().min(1, 'Venue name is required'),
  venueCity: z.string().min(1, 'City is required'),
  venueCountry: z.string().min(1, 'Country is required'),
  artistName: z.string().min(1, 'Artist name is required'),
  tourName: z.string().optional(),
  openingActs: z.string().optional(),
  notes: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  externalSetlistId: z.string().optional(),
});

type ConcertFormData = z.infer<typeof concertSchema>;

interface LocalSetlistSong {
  songName: string;
  isEncore: boolean;
  isCover: boolean;
  coverArtist?: string;
}

export default function ConcertFormPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setlist, setSetlist] = useState<LocalSetlistSong[]>([]);
  const [newSong, setNewSong] = useState('');
  const [venueCoords, setVenueCoords] = useState<{ lat?: number; lng?: number }>({});

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ConcertFormData>({
    resolver: zodResolver(concertSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });

  // Handle concert selection from search
  const handleConcertSelect = (concert: ConcertResult) => {
    // Auto-fill form fields
    setValue('artistName', concert.artistName);
    setValue('venueName', concert.venueName);
    setValue('venueCity', concert.venueCity);
    setValue('venueCountry', concert.venueCountry);
    setValue('externalSetlistId', concert.id);
    
    if (concert.tourName) {
      setValue('tourName', concert.tourName);
    }
    
    // Parse date from dd-MM-yyyy format
    if (concert.eventDate) {
      const [day, month, year] = concert.eventDate.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      setValue('date', date.toISOString().split('T')[0]);
    }
    
    // Store venue coordinates from Setlist.fm
    if (concert.latitude && concert.longitude) {
      setVenueCoords({ lat: concert.latitude, lng: concert.longitude });
    } else {
      setVenueCoords({});
    }

    // Load setlist
    const allSongs: LocalSetlistSong[] = [
      ...concert.songs.map((s: SetlistSong) => ({
        songName: s.name,
        isEncore: false,
        isCover: s.isCover,
        coverArtist: s.coverArtist,
      })),
      ...concert.encoreSongs.map((s: SetlistSong) => ({
        songName: s.name,
        isEncore: true,
        isCover: s.isCover,
        coverArtist: s.coverArtist,
      })),
    ];
    setSetlist(allSongs);
  };

  const addSong = (isEncore: boolean = false) => {
    if (newSong.trim()) {
      setSetlist([...setlist, { songName: newSong.trim(), isEncore, isCover: false }]);
      setNewSong('');
    }
  };

  const removeSong = (index: number) => {
    setSetlist(setlist.filter((_, i) => i !== index));
  };

  const toggleEncore = (index: number) => {
    const updated = [...setlist];
    updated[index].isEncore = !updated[index].isEncore;
    setSetlist(updated);
  };

  const onSubmit = async (data: ConcertFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        openingActs: data.openingActs ? data.openingActs.split(',').map((s) => s.trim()) : [],
        venueLatitude: venueCoords.lat,
        venueLongitude: venueCoords.lng,
        setlist: setlist.map((song, index) => ({
          songName: song.songName,
          order: index + 1,
          isEncore: song.isEncore,
          isCover: song.isCover,
          coverArtist: song.coverArtist,
        })),
      };

      const response = await fetch('/api/events/concert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create event');
      }

      router.push('/events');
      router.refresh();
    } catch (error) {
      console.error('Submit error:', error);
      alert(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group songs by encore status for display
  const mainSetSongs = setlist.filter((s) => !s.isEncore);
  const encoreSongs = setlist.filter((s) => s.isEncore);

  return (
    <div className="min-h-screen pb-20">
      <Header title="Log Concert" />

      <main className="px-4 py-6 max-w-2xl mx-auto">
        <Link
          href="/events/new"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to event types
        </Link>

        {/* Concert Search */}
        <ConcertSearch onConcertSelect={handleConcertSelect} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <Input type="date" {...register('date')} error={errors.date?.message} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Artist / Band</label>
            <Input {...register('artistName')} placeholder="Artist or band name" error={errors.artistName?.message} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tour Name (Optional)</label>
            <Input {...register('tourName')} placeholder="e.g., The Eras Tour" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Opening Acts (Optional)</label>
            <Input {...register('openingActs')} placeholder="Comma-separated names" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Venue</label>
              <Input {...register('venueName')} placeholder="Venue name" error={errors.venueName?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <Input {...register('venueCity')} placeholder="City" error={errors.venueCity?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <Input {...register('venueCountry')} placeholder="Country" error={errors.venueCountry?.message} />
            </div>
          </div>

          {/* Setlist Builder */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Music className="h-5 w-5 text-purple-400" />
                  Setlist ({setlist.length} songs)
                </h3>
              </div>
              
              {/* Add Song Input */}
              <div className="flex gap-2">
                <Input
                  value={newSong}
                  onChange={(e) => setNewSong(e.target.value)}
                  placeholder="Add a song..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSong())}
                />
                <Button type="button" variant="secondary" onClick={() => addSong()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Main Set */}
              {mainSetSongs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Main Set</h4>
                  {mainSetSongs.map((song, idx) => {
                    const globalIndex = setlist.findIndex(
                      (s) => s === song
                    );
                    return (
                      <div
                        key={globalIndex}
                        className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground w-6">{idx + 1}.</span>
                        <span className="flex-1">{song.songName}</span>
                        {song.isCover && song.coverArtist && (
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                            {song.coverArtist} cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleEncore(globalIndex)}
                          className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                        >
                          → Encore
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSong(globalIndex)}
                          className="p-1 hover:bg-destructive/20 rounded"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Encore */}
              {encoreSongs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <h4 className="text-sm font-medium text-purple-400">Encore</h4>
                  {encoreSongs.map((song, idx) => {
                    const globalIndex = setlist.findIndex(
                      (s) => s === song
                    );
                    return (
                      <div
                        key={globalIndex}
                        className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/10"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-purple-400 w-6">E{idx + 1}.</span>
                        <span className="flex-1">{song.songName}</span>
                        {song.isCover && song.coverArtist && (
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                            {song.coverArtist} cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleEncore(globalIndex)}
                          className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground hover:bg-secondary/80"
                        >
                          → Main
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSong(globalIndex)}
                          className="p-1 hover:bg-destructive/20 rounded"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick Add Encore */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSong(true)}
                disabled={!newSong.trim()}
                className="border-purple-500/30 text-purple-400"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add as Encore
              </Button>

              {setlist.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Search for a concert above to auto-fill the setlist, or add songs manually
                </p>
              )}
            </CardContent>
          </Card>

          <div>
            <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
            <textarea
              {...register('notes')}
              className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Your experience, who you went with, favorite moments..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rating (Optional)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue('rating', star)}
                  className="text-2xl transition-transform hover:scale-110"
                >
                  {star <= (watch('rating') || 0) ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Save Concert
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
