'use client';

// ConcertSearch Component - Search for concerts via Setlist.fm API
// 📚 Library Research Agent: Uses Setlist.fm API for concert/setlist data
// ✅ Code Quality Agent: Proper loading states, error handling, type safety

import { useState, useEffect } from 'react';
import { Search, Calendar, Loader2, ChevronRight, X, Music } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

// Types for concert/setlist data
export interface SetlistSong {
  name: string;
  order: number;
  isEncore: boolean;
  isCover: boolean;
  coverArtist?: string;
  isTape: boolean;
  notes?: string;
}

export interface ConcertResult {
  id: string;
  artistName: string;
  artistMbid: string;
  venueName: string;
  venueCity: string;
  venueCountry: string;
  latitude?: number;
  longitude?: number;
  eventDate: string;
  tourName?: string;
  songs: SetlistSong[];
  encoreSongs: SetlistSong[];
  totalSongs: number;
}

interface ConcertSearchProps {
  onConcertSelect: (concert: ConcertResult) => void;
}

export function ConcertSearch({ onConcertSelect }: ConcertSearchProps) {
  const [artistQuery, setArtistQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [year, setYear] = useState('');
  const [results, setResults] = useState<ConcertResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const debouncedArtist = useDebounce(artistQuery, 400);

  // Search when artist query changes
  useEffect(() => {
    if (!debouncedArtist || debouncedArtist.length < 2) {
      setResults([]);
      return;
    }

    const searchConcerts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append('artist', debouncedArtist);
        if (cityQuery) params.append('city', cityQuery);
        if (year) params.append('year', year);

        const response = await fetch(`/api/concerts/search?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to search concerts');
        }

        setResults(data.data?.setlists || []);
      } catch (err) {
        console.error('Concert search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchConcerts();
  }, [debouncedArtist, cityQuery, year]);

  // Handle concert selection
  const handleSelectConcert = (concert: ConcertResult) => {
    onConcertSelect(concert);
    setIsExpanded(false);
    setResults([]);
    setArtistQuery('');
  };

  // Format date for display (Setlist.fm uses dd-MM-yyyy format)
  const formatDate = (dateStr: string): string => {
    try {
      // Parse dd-MM-yyyy format
      const [day, month, yearPart] = dateStr.split('-');
      const date = new Date(parseInt(yearPart), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Get year options (last 30 years)
  const yearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= currentYear - 30; y--) {
      years.push(y);
    }
    return years;
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        {/* Header - Expandable */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-purple-400" />
            <span className="font-semibold">Search Concert / Setlist</span>
          </div>
          <ChevronRight
            className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </button>

        {/* Search Form - Expandable */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Artist Search */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Artist / Band Name *
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={artistQuery}
                  onChange={(e) => setArtistQuery(e.target.value)}
                  placeholder="Enter artist name (e.g., Coldplay, Taylor Swift)"
                  className="pr-10"
                />
                {artistQuery && (
                  <button
                    type="button"
                    onClick={() => setArtistQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* City and Year Filters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  City (Optional)
                </label>
                <Input
                  type="text"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  placeholder="e.g., London, New York"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Year (Optional)
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">All Years</option>
                  {yearOptions().map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                <span className="ml-2 text-muted-foreground">Searching concerts...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Results */}
            {!isLoading && results.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <p className="text-sm text-muted-foreground">
                  Found {results.length} concert{results.length !== 1 ? 's' : ''}
                </p>
                {results.map((concert) => (
                  <button
                    key={concert.id}
                    type="button"
                    onClick={() => handleSelectConcert(concert)}
                    className="w-full p-4 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors text-left"
                  >
                    <div className="space-y-2">
                      {/* Artist and Date */}
                      <div className="flex justify-between items-start">
                        <div className="font-semibold text-purple-400">
                          {concert.artistName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(concert.eventDate)}
                        </div>
                      </div>
                      
                      {/* Venue */}
                      <div className="text-sm">
                        {concert.venueName} • {concert.venueCity}, {concert.venueCountry}
                      </div>
                      
                      {/* Tour Name */}
                      {concert.tourName && (
                        <div className="text-sm text-muted-foreground italic">
                          {concert.tourName}
                        </div>
                      )}
                      
                      {/* Setlist Preview */}
                      {concert.totalSongs > 0 && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <div className="text-xs text-muted-foreground mb-1">
                            Setlist ({concert.totalSongs} songs):
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {concert.songs.slice(0, 3).map((song, i) => (
                              <span key={song.order}>
                                {song.name}
                                {i < 2 && i < concert.songs.length - 1 && ' • '}
                              </span>
                            ))}
                            {concert.songs.length > 3 && (
                              <span> ... +{concert.songs.length - 3} more</span>
                            )}
                          </div>
                          {concert.encoreSongs.length > 0 && (
                            <div className="text-xs text-purple-400 mt-1">
                              + {concert.encoreSongs.length} encore song{concert.encoreSongs.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && artistQuery.length >= 2 && results.length === 0 && !error && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No concerts found for "{artistQuery}"</p>
                <p className="text-sm mt-1">Try a different artist name or remove filters</p>
              </div>
            )}

            {/* API Note */}
            <div className="text-xs text-muted-foreground text-center">
              Powered by Setlist.fm
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ConcertSearch;

