'use client';

// MatchSearch Component - Search for sports matches via external APIs
// 📚 Library Research Agent: Uses Football-Data.org, balldontlie.io, MLB Stats API
// ✅ Code Quality Agent: Proper loading states, error handling, type safety

import { useState, useEffect } from 'react';
import { Search, Calendar, Loader2, ChevronRight, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { TeamBadge, MatchupBadges } from '@/components/shared/TeamBadge';

// Types for different sport matches
export interface SoccerMatchResult {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId?: number;
  awayTeamId?: number;
  homeTeamCrest?: string;
  awayTeamCrest?: string;
  homeScore: number | null;
  awayScore: number | null;
  competition: string;
  venue: string | null;
  status: string;
}

export interface BasketballGameResult {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId?: number;
  awayTeamId?: number;
  homeScore: number;
  awayScore: number;
  status: string;
}

export interface BaseballGameResult {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId?: number;
  awayTeamId?: number;
  homeScore: number | null;
  awayScore: number | null;
  venue: string | null;
  status: string;
}

export type SportType = 'soccer' | 'basketball' | 'baseball';
export type MatchResult = SoccerMatchResult | BasketballGameResult | BaseballGameResult;

// Player appearance types for each sport - KEY STATS ONLY
export interface SoccerPlayerAppearance {
  playerId: number;
  playerName: string;
  team: 'home' | 'away';
  goals: number;
  assists: number;
}

export interface BasketballPlayerAppearance {
  playerId: number;
  playerName: string;
  team: 'home' | 'away';
  points: number;
}

export interface BaseballPlayerAppearance {
  playerId: number;
  playerName: string;
  team: 'home' | 'away';
  homeRuns: number;
  rbis: number;
}

export type PlayerAppearance = SoccerPlayerAppearance | BasketballPlayerAppearance | BaseballPlayerAppearance;

interface MatchSearchProps {
  sportType: SportType;
  onMatchSelect: (match: MatchResult) => void;
  onPlayersLoaded?: (players: PlayerAppearance[]) => void;
}

export function MatchSearch({ sportType, onMatchSelect, onPlayersLoaded }: MatchSearchProps) {
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [results, setResults] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const debouncedQuery = useDebounce(query, 400);

  // Set default date range (last 30 days to today)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    setDateTo(today.toISOString().split('T')[0]);
    setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  // Search when query or dates change
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const searchMatches = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const endpoint = getSearchEndpoint(sportType);
        const params = new URLSearchParams();
        
        if (sportType === 'soccer') {
          params.append('q', debouncedQuery);
        } else if (sportType === 'basketball') {
          params.append('team', debouncedQuery);
        } else if (sportType === 'baseball') {
          params.append('team', debouncedQuery);
        }
        
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);

        const response = await fetch(`${endpoint}?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to search matches');
        }

        const matches = transformResults(sportType, data.data);
        setResults(matches);
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchMatches();
  }, [debouncedQuery, dateFrom, dateTo, sportType]);

  // Get search endpoint based on sport type
  const getSearchEndpoint = (sport: SportType): string => {
    switch (sport) {
      case 'soccer':
        return '/api/football/search';
      case 'basketball':
        return '/api/basketball/search';
      case 'baseball':
        return '/api/baseball/search';
    }
  };

  // Transform API results to common format
  const transformResults = (sport: SportType, data: unknown): MatchResult[] => {
    if (!Array.isArray(data)) return [];

    switch (sport) {
      case 'soccer':
        return data.map((match: Record<string, unknown>) => ({
          id: match.id as number,
          date: match.utcDate as string,
          homeTeam: (match.homeTeam as Record<string, unknown>)?.name as string || 'Unknown',
          awayTeam: (match.awayTeam as Record<string, unknown>)?.name as string || 'Unknown',
          homeTeamId: (match.homeTeam as Record<string, unknown>)?.id as number | undefined,
          awayTeamId: (match.awayTeam as Record<string, unknown>)?.id as number | undefined,
          homeTeamCrest: (match.homeTeam as Record<string, unknown>)?.crest as string | undefined,
          awayTeamCrest: (match.awayTeam as Record<string, unknown>)?.crest as string | undefined,
          homeScore: ((match.score as Record<string, unknown>)?.fullTime as Record<string, unknown>)?.home as number | null,
          awayScore: ((match.score as Record<string, unknown>)?.fullTime as Record<string, unknown>)?.away as number | null,
          competition: (match.competition as Record<string, unknown>)?.name as string || '',
          venue: match.venue as string | null,
          status: match.status as string,
        }));
      
      case 'basketball':
        return data.map((game: Record<string, unknown>) => ({
          id: game.id as number,
          date: game.date as string,
          homeTeam: (game.home_team as Record<string, unknown>)?.full_name as string || 'Unknown',
          awayTeam: (game.visitor_team as Record<string, unknown>)?.full_name as string || 'Unknown',
          homeTeamId: (game.home_team as Record<string, unknown>)?.id as number | undefined,
          awayTeamId: (game.visitor_team as Record<string, unknown>)?.id as number | undefined,
          homeScore: game.home_team_score as number,
          awayScore: game.visitor_team_score as number,
          status: game.status as string,
        }));
      
      case 'baseball':
        return data.map((game: Record<string, unknown>) => {
          const homeTeamObj = ((game.teams as Record<string, unknown>)?.home as Record<string, unknown>)?.team as Record<string, unknown> | undefined;
          const awayTeamObj = ((game.teams as Record<string, unknown>)?.away as Record<string, unknown>)?.team as Record<string, unknown> | undefined;
          return {
            id: game.gamePk as number,
            date: game.gameDate as string,
            homeTeam: homeTeamObj?.name as string || 'Unknown',
            awayTeam: awayTeamObj?.name as string || 'Unknown',
            homeTeamId: homeTeamObj?.id as number | undefined,
            awayTeamId: awayTeamObj?.id as number | undefined,
            homeScore: ((game.teams as Record<string, unknown>)?.home as Record<string, unknown>)?.score as number | null,
            awayScore: ((game.teams as Record<string, unknown>)?.away as Record<string, unknown>)?.score as number | null,
            venue: (game.venue as Record<string, unknown>)?.name as string || 'Unknown',
            status: ((game.status as Record<string, unknown>)?.detailedState as string) || 'Unknown',
          };
        });
      
      default:
        return [];
    }
  };

  // Handle match selection - fetch detailed data
  const handleSelectMatch = async (match: MatchResult) => {
    setIsLoadingDetails(true);
    
    try {
      // Fetch match details with player stats
      const detailEndpoint = getDetailEndpoint(sportType, match.id);
      const response = await fetch(detailEndpoint);
      const data = await response.json();

      if (!response.ok) {
        // If details fail, still select the match but without player data
        console.warn('Could not load match details:', data.error);
        onMatchSelect(match);
      } else {
        // Pass match info
        onMatchSelect(match);
        
        // Pass player appearances if callback provided
        if (onPlayersLoaded && data.data?.players) {
          onPlayersLoaded(data.data.players);
        }
      }
      
      // Collapse search after selection
      setIsExpanded(false);
      setResults([]);
      setQuery('');
    } catch (err) {
      console.error('Failed to fetch match details:', err);
      // Still select the match
      onMatchSelect(match);
      setIsExpanded(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Get detail endpoint based on sport type
  const getDetailEndpoint = (sport: SportType, matchId: number): string => {
    switch (sport) {
      case 'soccer':
        return `/api/football/match/${matchId}`;
      case 'basketball':
        return `/api/basketball/game/${matchId}`;
      case 'baseball':
        return `/api/baseball/game/${matchId}`;
    }
  };

  // Format date for display
  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Get sport-specific label
  const getSportLabel = (): string => {
    switch (sportType) {
      case 'soccer':
        return 'Football Match';
      case 'basketball':
        return 'Basketball Game';
      case 'baseball':
        return 'Baseball Game';
    }
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
            <Search className="h-5 w-5 text-primary" />
            <span className="font-semibold">Search {getSportLabel()}</span>
          </div>
          <ChevronRight
            className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </button>

        {/* Search Form - Expandable */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Team Search */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Search by Team Name
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Enter team name (e.g., ${sportType === 'soccer' ? 'Manchester United' : sportType === 'basketball' ? 'Lakers' : 'Yankees'})`}
                  className="pr-10"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  From Date
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  To Date
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Searching...</span>
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
              <div className="space-y-2 max-h-80 overflow-y-auto">
                <p className="text-sm text-muted-foreground">
                  Found {results.length} match{results.length !== 1 ? 'es' : ''}
                </p>
                {results.map((match) => {
                  // Extract crest URLs for soccer matches
                  const homeTeamCrest = 'homeTeamCrest' in match ? match.homeTeamCrest : undefined;
                  const awayTeamCrest = 'awayTeamCrest' in match ? match.awayTeamCrest : undefined;
                  const homeTeamId = 'homeTeamId' in match ? match.homeTeamId : undefined;
                  const awayTeamId = 'awayTeamId' in match ? match.awayTeamId : undefined;

                  return (
                    <button
                      key={match.id}
                      type="button"
                      onClick={() => handleSelectMatch(match)}
                      disabled={isLoadingDetails}
                      className="w-full p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors text-left disabled:opacity-50"
                    >
                      <div className="flex justify-between items-center gap-2">
                        {/* Home Team with Badge */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <TeamBadge
                            teamName={match.homeTeam}
                            sport={sportType}
                            externalId={homeTeamId}
                            logoUrl={homeTeamCrest}
                            size="sm"
                          />
                          <span className="font-medium truncate">{match.homeTeam}</span>
                        </div>

                        {/* Score */}
                        <div className="flex-shrink-0 text-center px-2">
                          {match.homeScore !== null && match.awayScore !== null ? (
                            <span className="text-lg font-mono font-bold">
                              {match.homeScore} - {match.awayScore}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">vs</span>
                          )}
                        </div>

                        {/* Away Team with Badge */}
                        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                          <span className="font-medium truncate">{match.awayTeam}</span>
                          <TeamBadge
                            teamName={match.awayTeam}
                            sport={sportType}
                            externalId={awayTeamId}
                            logoUrl={awayTeamCrest}
                            size="sm"
                          />
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 text-center">
                        {formatDate(match.date)}
                        {sportType === 'soccer' && 'competition' in match && match.competition && (
                          <span className="ml-2">• {match.competition}</span>
                        )}
                        {'venue' in match && match.venue && (
                          <span className="ml-2">• {match.venue}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* No Results */}
            {!isLoading && query.length >= 2 && results.length === 0 && !error && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No matches found for "{query}"</p>
                <p className="text-sm mt-1">Try a different team name or date range</p>
              </div>
            )}

            {/* Loading Details Overlay */}
            {isLoadingDetails && (
              <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span>Loading match details...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MatchSearch;

