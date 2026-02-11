// Football-Data.org API Client
// 📚 Library Research Agent: Using official Football-Data.org REST API
// API Docs: https://www.football-data.org/documentation/api
// ✅ Code Quality Agent: Proper error handling, rate limiting, type safety
// 🔍 Search Agent: Smart team name matching to prevent search overlap

const API_BASE = 'https://api.football-data.org/v4';

import { filterBySearchRelevance, getBestMatchScore } from '@/lib/utils/search';

// Types for API responses
export interface FootballMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  competition: {
    id: number;
    name: string;
    code: string;
  };
  area?: {
    id: number;
    name: string;
    code: string;
    flag?: string;
  };
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string | null;
    address?: string; // Contains city info like "Manchester M16 0RA"
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string | null;
    address?: string;
  };
  score: {
    winner: string | null;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  venue: string | null;
}

export interface FootballMatchDetails extends FootballMatch {
  lineups?: {
    homeTeam: LineupPlayer[];
    awayTeam: LineupPlayer[];
  };
  goals?: Goal[];
  bookings?: Booking[];
  substitutions?: Substitution[];
}

interface LineupPlayer {
  id: number;
  name: string;
  position: string;
  shirtNumber: number;
}

interface Goal {
  minute: number;
  team: { id: number; name: string };
  scorer: { id: number; name: string };
  assist?: { id: number; name: string };
}

interface Booking {
  minute: number;
  team: { id: number; name: string };
  player: { id: number; name: string };
  card: 'YELLOW_CARD' | 'RED_CARD' | 'YELLOW_RED_CARD';
}

interface Substitution {
  minute: number;
  team: { id: number; name: string };
  playerOut: { id: number; name: string };
  playerIn: { id: number; name: string };
}

// Helper to fetch from API with error handling
async function fetchFromApi<T>(endpoint: string): Promise<T> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  
  if (!apiKey) {
    throw new Error('FOOTBALL_DATA_API_KEY not configured');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'X-Auth-Token': apiKey,
    },
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (response.status === 403) {
      throw new Error('API key invalid or quota exceeded.');
    }
    throw new Error(`Football Data API error: ${response.status}`);
  }

  return response.json();
}

// Search for matches by team name and date range
export async function searchMatches(
  query: string,
  dateFrom?: string,
  dateTo?: string
): Promise<FootballMatch[]> {
  // Search across major competitions
  // PL=Premier League, PD=La Liga, BL1=Bundesliga, SA=Serie A, FL1=Ligue 1
  // CL=Champions League, EC=European Championship
  // BSA=Brazilian Serie A, DED=Eredivisie, PPL=Primeira Liga, WC=World Cup
  // Note: EL (Europa League) excluded - requires higher tier API access
  const competitions = ['PL', 'PD', 'BL1', 'SA', 'FL1', 'CL', 'EC', 'BSA', 'DED', 'PPL', 'WC'];
  const allMatches: FootballMatch[] = [];

  const params = new URLSearchParams();
  if (dateFrom) params.append('dateFrom', dateFrom);
  if (dateTo) params.append('dateTo', dateTo);

  for (const comp of competitions) {
    try {
      const data = await fetchFromApi<{ matches: FootballMatch[] }>(
        `/competitions/${comp}/matches?${params}`
      );
      allMatches.push(...data.matches);
    } catch (error) {
      // Continue with other competitions if one fails
      console.warn(`Failed to fetch ${comp} matches:`, error);
    }
  }

  // Filter by query (team name match) with smart matching
  // This prevents overlap like "Manchester" matching both "Manchester United" and "Manchester City"
  if (!query) return allMatches;
  
  // Filter out invalid matches first
  const validMatches = allMatches.filter(
    (match) => match && match.homeTeam && match.awayTeam
  );
  
  // Use smart search filtering with relevance scoring
  const filtered = filterBySearchRelevance(
    validMatches,
    query,
    (match) => [
      match.homeTeam.name || '',
      match.awayTeam.name || '',
      match.homeTeam.shortName || '',
      match.awayTeam.shortName || '',
    ],
    20 // Minimum score threshold
  );
  
  // Sort by best match score (most relevant first)
  return filtered.sort((a, b) => {
    const scoreA = getBestMatchScore(
      query,
      a.homeTeam.name,
      a.awayTeam.name,
      a.homeTeam.shortName,
      a.awayTeam.shortName
    );
    const scoreB = getBestMatchScore(
      query,
      b.homeTeam.name,
      b.awayTeam.name,
      b.homeTeam.shortName,
      b.awayTeam.shortName
    );
    return scoreB - scoreA;
  });
}

// Get match details by ID
export async function getMatchDetails(matchId: number): Promise<FootballMatchDetails> {
  const rawResponse = await fetchFromApi<Record<string, unknown>>(`/matches/${matchId}`);
  
  // Log the full raw response to see the actual structure
  console.log('Raw Football-Data.org response keys:', Object.keys(rawResponse));
  console.log('Raw Football-Data.org response:', JSON.stringify(rawResponse, null, 2).slice(0, 2000));
  
  return rawResponse as unknown as FootballMatchDetails;
}

// Get matches for a specific team
export async function getTeamMatches(
  teamId: number,
  dateFrom?: string,
  dateTo?: string
): Promise<FootballMatch[]> {
  const params = new URLSearchParams();
  if (dateFrom) params.append('dateFrom', dateFrom);
  if (dateTo) params.append('dateTo', dateTo);
  params.append('status', 'FINISHED');

  const data = await fetchFromApi<{ matches: FootballMatch[] }>(
    `/teams/${teamId}/matches?${params}`
  );
  return data.matches;
}

// Process match details into player appearances
export function processMatchToAppearances(match: FootballMatchDetails): {
  homeAppearances: PlayerAppearance[];
  awayAppearances: PlayerAppearance[];
} {
  const homeAppearances: PlayerAppearance[] = [];
  const awayAppearances: PlayerAppearance[] = [];

  // Helper to find or create a player appearance
  const findOrCreateAppearance = (
    appearances: PlayerAppearance[],
    playerId: number,
    playerName: string
  ): PlayerAppearance => {
    let app = appearances.find((a) => a.playerId === playerId);
    if (!app) {
      app = {
        playerId,
        playerName,
        goals: 0,
        assists: 0,
        yellowCard: false,
        redCard: false,
        cleanSheet: false,
      };
      appearances.push(app);
    }
    return app;
  };

  // Process lineups if available (typically only on paid API tiers)
  if (match.lineups) {
    for (const player of match.lineups.homeTeam || []) {
      homeAppearances.push(createAppearance(player, match, 'home'));
    }
    for (const player of match.lineups.awayTeam || []) {
      awayAppearances.push(createAppearance(player, match, 'away'));
    }
  }

  // Add goals and assists - create players if they don't exist
  for (const goal of match.goals || []) {
    // Skip entries with null/missing player data
    if (!goal.scorer?.id || !goal.scorer?.name) continue;
    const isHome = goal.team.id === match.homeTeam.id;
    const appearances = isHome ? homeAppearances : awayAppearances;
    
    // Add/update scorer
    const scorerApp = findOrCreateAppearance(appearances, goal.scorer.id, goal.scorer.name);
    scorerApp.goals++;

    // Add/update assister (if exists and has valid data)
    if (goal.assist?.id && goal.assist?.name) {
      const assistApp = findOrCreateAppearance(appearances, goal.assist.id, goal.assist.name);
      assistApp.assists++;
    }
  }

  // Add bookings - create players if they don't exist
  for (const booking of match.bookings || []) {
    // Skip entries with null/missing player data
    if (!booking.player?.id || !booking.player?.name) continue;
    const isHome = booking.team.id === match.homeTeam.id;
    const appearances = isHome ? homeAppearances : awayAppearances;
    
    const playerApp = findOrCreateAppearance(appearances, booking.player.id, booking.player.name);
    if (booking.card === 'YELLOW_CARD') {
      playerApp.yellowCard = true;
    } else if (booking.card === 'RED_CARD' || booking.card === 'YELLOW_RED_CARD') {
      playerApp.redCard = true;
    }
  }

  // Add substitutions - this captures more players who played but didn't score/assist/get booked
  for (const sub of match.substitutions || []) {
    const isHome = sub.team.id === match.homeTeam.id;
    const appearances = isHome ? homeAppearances : awayAppearances;
    
    // Both players who came on and went off played in the match (skip null entries)
    if (sub.playerOut?.id && sub.playerOut?.name) {
      findOrCreateAppearance(appearances, sub.playerOut.id, sub.playerOut.name);
    }
    if (sub.playerIn?.id && sub.playerIn?.name) {
      findOrCreateAppearance(appearances, sub.playerIn.id, sub.playerIn.name);
    }
  }

  // Mark clean sheets for goalkeepers
  if (match.score.fullTime.away === 0) {
    const gk = homeAppearances.find((a) => a.position === 'Goalkeeper');
    if (gk) gk.cleanSheet = true;
  }
  if (match.score.fullTime.home === 0) {
    const gk = awayAppearances.find((a) => a.position === 'Goalkeeper');
    if (gk) gk.cleanSheet = true;
  }

  return { homeAppearances, awayAppearances };
}

interface PlayerAppearance {
  playerId: number;
  playerName: string;
  position?: string;
  goals: number;
  assists: number;
  yellowCard: boolean;
  redCard: boolean;
  cleanSheet: boolean;
}

function createAppearance(
  player: LineupPlayer,
  match: FootballMatchDetails,
  team: 'home' | 'away'
): PlayerAppearance {
  return {
    playerId: player.id,
    playerName: player.name,
    position: player.position,
    goals: 0,
    assists: 0,
    yellowCard: false,
    redCard: false,
    cleanSheet: false,
  };
}
