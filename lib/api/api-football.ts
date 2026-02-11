// API-Football Client
// 📚 Library Research Agent: Using API-Football for extended competition coverage
// API Docs: https://www.api-football.com/documentation-v3
// Covers: Europa League, Copa America, MLS, domestic cups, and 1200+ leagues
// ✅ Code Quality Agent: Proper error handling, rate limiting, type safety
// 🔍 Search Agent: Smart team name matching to prevent search overlap
//
// AUTHENTICATION:
// - Direct API-Football (api-football.com): Set API_FOOTBALL_KEY, uses x-apisports-key header
// - RapidAPI: Set RAPIDAPI_KEY, uses x-rapidapi-key + x-rapidapi-host headers

const API_BASE_DIRECT = 'https://v3.football.api-sports.io';
const API_BASE_RAPIDAPI = 'https://v3.football.api-sports.io';

import { filterBySearchRelevance, getBestMatchScore } from '@/lib/utils/search';

// Re-export compatible types from football-data for seamless integration
export interface ApiFootballMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  competition: {
    id: number;
    name: string;
    code: string;
  };
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string | null;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string | null;
  };
  score: {
    winner: string | null;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  venue: string | null;
}

export interface ApiFootballMatchDetails extends ApiFootballMatch {
  lineups?: {
    homeTeam: LineupPlayer[];
    awayTeam: LineupPlayer[];
  };
  goals?: Goal[];
  bookings?: Booking[];
  substitutions?: Substitution[];
  statistics?: TeamStatistics[];
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

interface TeamStatistics {
  team: { id: number; name: string };
  statistics: Array<{ type: string; value: string | number | null }>;
}

// API-Football raw response types
interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    venue: { name: string; city: string } | null;
    status: { short: string; long: string };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    round: string;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
  };
}

interface ApiFootballEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
}

interface ApiFootballLineup {
  team: { id: number; name: string; logo: string };
  formation: string;
  startXI: Array<{ player: { id: number; name: string; number: number; pos: string } }>;
  substitutes: Array<{ player: { id: number; name: string; number: number; pos: string } }>;
}

// Helper to fetch from API-Football with error handling
// Supports both direct API-Football and RapidAPI authentication
async function fetchFromApiFootball<T>(endpoint: string): Promise<T> {
  const directApiKey = process.env.API_FOOTBALL_KEY;
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  
  if (!directApiKey && !rapidApiKey) {
    throw new Error('API_FOOTBALL_KEY or RAPIDAPI_KEY not configured');
  }

  // Determine which authentication to use
  const useRapidApi = !directApiKey && rapidApiKey;
  const apiKey = directApiKey || rapidApiKey;
  const apiBase = useRapidApi ? API_BASE_RAPIDAPI : API_BASE_DIRECT;
  
  const headers: Record<string, string> = useRapidApi
    ? {
        'x-rapidapi-key': apiKey!,
        'x-rapidapi-host': 'v3.football.api-sports.io',
      }
    : {
        'x-apisports-key': apiKey!,
      };

  console.log(`[API-Football] Fetching: ${apiBase}${endpoint}`);
  console.log(`[API-Football] Using ${useRapidApi ? 'RapidAPI' : 'Direct API'} authentication`);

  const response = await fetch(`${apiBase}${endpoint}`, {
    headers,
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    console.error(`[API-Football] HTTP Error: ${response.status} ${response.statusText}`);
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (response.status === 403 || response.status === 401) {
      throw new Error(`API key invalid or unauthorized. Using ${useRapidApi ? 'RapidAPI' : 'Direct API'} auth. Check your ${useRapidApi ? 'RAPIDAPI_KEY' : 'API_FOOTBALL_KEY'}.`);
    }
    throw new Error(`API-Football error: ${response.status}`);
  }

  const data = await response.json();
  
  // API-Football wraps responses in { response: [...] }
  if (data.errors && Object.keys(data.errors).length > 0) {
    console.error(`[API-Football] API Error:`, data.errors);
    throw new Error(`API-Football error: ${JSON.stringify(data.errors)}`);
  }

  console.log(`[API-Football] Success: Got ${data.response?.length || 0} results`);
  return data;
}

// Competition IDs for leagues not covered by football-data.org
// These are API-Football league IDs
const EXTENDED_COMPETITIONS: Record<string, number> = {
  // Top 5 European Leagues (also searched via API-Football for historical data)
  'PL': 39,     // Premier League (England)
  'PD': 140,    // La Liga (Spain)
  'BL1': 78,    // Bundesliga (Germany)
  'SA': 135,    // Serie A (Italy)
  'FL1': 61,    // Ligue 1 (France)
  
  // European Club Competitions
  'CL': 2,      // Champions League
  'EL': 3,      // Europa League
  'ECL': 848,   // Europa Conference League
  'USC': 531,   // UEFA Super Cup
  
  // International / FIFA
  'CWC': 15,    // FIFA Club World Cup
  'WC': 1,      // World Cup
  'EC': 4,      // European Championship
  'CA': 9,      // Copa America
  'GC': 22,     // Gold Cup (CONCACAF)
  'AFCON': 6,   // Africa Cup of Nations
  'AC': 16,     // Asian Cup
  
  // Domestic Cups (Top 5 leagues)
  'FAC': 45,    // FA Cup (England)
  'EFL': 46,    // EFL Cup (England)
  'CDR': 143,   // Copa del Rey (Spain)
  'DFB': 81,    // DFB Pokal (Germany)
  'CIF': 137,   // Coppa Italia (Italy)
  'CDF': 66,    // Coupe de France (France)
  
  // Americas
  'MLS': 253,   // MLS (USA)
  'LMX': 262,   // Liga MX (Mexico)
  'CL_CONMEBOL': 13, // Copa Libertadores
  'CS': 11,     // Copa Sudamericana
  
  // Other major leagues
  'SPL': 179,   // Scottish Premiership
  'JPL': 88,    // Belgian Pro League
  'SL': 203,    // Super Lig (Turkey)
  'RPL': 235,   // Russian Premier League
};

// Convert API-Football fixture to our standard format with null safety
function convertFixture(fixture: ApiFootballFixture): ApiFootballMatch | null {
  // Skip fixtures with missing essential data
  if (!fixture?.teams?.home?.name || !fixture?.teams?.away?.name) {
    return null;
  }

  const winner = fixture.teams.home.winner 
    ? 'HOME_TEAM' 
    : fixture.teams.away.winner 
      ? 'AWAY_TEAM' 
      : fixture.goals?.home === fixture.goals?.away && fixture.goals?.home !== null 
        ? 'DRAW' 
        : null;

  const homeName = fixture.teams.home.name || 'Unknown';
  const awayName = fixture.teams.away.name || 'Unknown';

  return {
    id: fixture.fixture?.id || 0,
    utcDate: fixture.fixture?.date || new Date().toISOString(),
    status: mapStatus(fixture.fixture?.status?.short || 'NS'),
    matchday: extractMatchday(fixture.league?.round || ''),
    competition: {
      id: fixture.league?.id || 0,
      name: fixture.league?.name || 'Unknown',
      code: getCompetitionCode(fixture.league?.id || 0),
    },
    homeTeam: {
      id: fixture.teams.home.id || 0,
      name: homeName,
      shortName: homeName.split(' ')[0] || homeName,
      tla: homeName.substring(0, 3).toUpperCase(),
      crest: fixture.teams.home.logo || null,
    },
    awayTeam: {
      id: fixture.teams.away.id || 0,
      name: awayName,
      shortName: awayName.split(' ')[0] || awayName,
      tla: awayName.substring(0, 3).toUpperCase(),
      crest: fixture.teams.away.logo || null,
    },
    score: {
      winner,
      fullTime: {
        home: fixture.score?.fulltime?.home ?? null,
        away: fixture.score?.fulltime?.away ?? null,
      },
      halfTime: {
        home: fixture.score?.halftime?.home ?? null,
        away: fixture.score?.halftime?.away ?? null,
      },
    },
    venue: fixture.fixture?.venue?.name || null,
  };
}

// Map API-Football status to football-data.org format
function mapStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'TBD': 'SCHEDULED',
    'NS': 'SCHEDULED',
    '1H': 'IN_PLAY',
    'HT': 'PAUSED',
    '2H': 'IN_PLAY',
    'ET': 'IN_PLAY',
    'P': 'IN_PLAY',
    'FT': 'FINISHED',
    'AET': 'FINISHED',
    'PEN': 'FINISHED',
    'BT': 'IN_PLAY',
    'SUSP': 'SUSPENDED',
    'INT': 'SUSPENDED',
    'PST': 'POSTPONED',
    'CANC': 'CANCELLED',
    'ABD': 'CANCELLED',
    'AWD': 'AWARDED',
    'WO': 'AWARDED',
  };
  return statusMap[status] || 'SCHEDULED';
}

// Extract matchday from round string
function extractMatchday(round: string): number | null {
  const match = round.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

// Get competition code from league ID
function getCompetitionCode(leagueId: number): string {
  for (const [code, id] of Object.entries(EXTENDED_COMPETITIONS)) {
    if (id === leagueId) return code;
  }
  return `L${leagueId}`;
}

// Competitions that use calendar year seasons (Jan-Dec)
// Most American leagues use calendar year
// Competitions that use calendar-year seasons (season=2021 means 2021 matches)
// as opposed to European leagues that use cross-year seasons (season=2023 means Aug 2023 - May 2024)
const CALENDAR_YEAR_COMPETITIONS = [
  // Americas leagues
  'MLS', 'LMX',
  // International tournaments (played within a single calendar year)
  'WC', 'EC', 'CA', 'GC', 'AFCON', 'AC',
  // FIFA club tournaments
  'CWC', 'USC',
];

// Get the correct season for a competition based on the search date
// European competitions: season=2023 means Aug 2023 - May 2024
// American competitions: season=2024 means Jan 2024 - Dec 2024
function getSeasonForCompetition(compCode: string, dateFrom?: string): number {
  const searchDate = dateFrom ? new Date(dateFrom) : new Date();
  const searchYear = searchDate.getFullYear();
  const searchMonth = searchDate.getMonth() + 1; // 1-12
  
  // For calendar year competitions (MLS, Liga MX), use the year directly
  // MLS 2025 season runs Feb-Dec 2025
  if (CALENDAR_YEAR_COMPETITIONS.includes(compCode)) {
    return searchYear;
  }
  
  // For European/cross-year competitions:
  // - If searching Jan-July, the season started the previous year
  // - If searching Aug-Dec, the season started this year
  // Example: May 2024 → season 2023 (2023-24 season)
  //          October 2024 → season 2024 (2024-25 season)
  //          Feb 2026 → season 2025 (2025-26 season)
  const season = searchMonth <= 7 ? searchYear - 1 : searchYear;
  
  return season;
}

// Search matches in extended competitions
export async function searchExtendedMatches(
  query: string,
  dateFrom?: string,
  dateTo?: string,
  competitions?: string[]
): Promise<ApiFootballMatch[]> {
  const allMatches: ApiFootballMatch[] = [];
  
  // Use specified competitions or default to major leagues + extended
  // Priority: Top 5 European leagues, CL, EL, major cups, MLS
  const defaultComps = ['PL', 'PD', 'BL1', 'SA', 'FL1', 'CL', 'EL', 'FAC', 'CDR', 'DFB', 'MLS'];
  const competitionsToSearch = competitions || defaultComps;
  
  for (const compCode of competitionsToSearch) {
    const leagueId = EXTENDED_COMPETITIONS[compCode];
    if (!leagueId) continue;

    // Get the correct season for this competition type
    const season = getSeasonForCompetition(compCode, dateFrom);

    try {
      let endpoint = `/fixtures?league=${leagueId}&season=${season}`;
      
      // Add date filters if provided
      if (dateFrom) endpoint += `&from=${dateFrom}`;
      if (dateTo) endpoint += `&to=${dateTo}`;

      const data = await fetchFromApiFootball<{ response: ApiFootballFixture[] }>(endpoint);
      
      for (const fixture of data.response || []) {
        const converted = convertFixture(fixture);
        if (converted) {
          allMatches.push(converted);
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch ${compCode} matches from API-Football:`, error);
    }
  }

  // Filter by query (team name match) with smart matching
  // This prevents overlap like "Manchester" matching both "Manchester United" and "Manchester City"
  if (!query) return allMatches;
  
  // Filter out invalid matches first
  const validMatches = allMatches.filter((match) => match);
  
  // Use smart search filtering with relevance scoring
  const filtered = filterBySearchRelevance(
    validMatches,
    query,
    (match) => [
      match.homeTeam?.name || '',
      match.awayTeam?.name || '',
      match.homeTeam?.shortName || '',
      match.awayTeam?.shortName || '',
    ],
    20 // Minimum score threshold
  );
  
  // Sort by best match score (most relevant first)
  return filtered.sort((a, b) => {
    const scoreA = getBestMatchScore(
      query,
      a.homeTeam?.name,
      a.awayTeam?.name,
      a.homeTeam?.shortName,
      a.awayTeam?.shortName
    );
    const scoreB = getBestMatchScore(
      query,
      b.homeTeam?.name,
      b.awayTeam?.name,
      b.homeTeam?.shortName,
      b.awayTeam?.shortName
    );
    return scoreB - scoreA;
  });
}

// Get match details with full stats from API-Football
export async function getExtendedMatchDetails(fixtureId: number): Promise<ApiFootballMatchDetails> {
  // Fetch fixture, events, lineups, and statistics in parallel
  const [fixtureData, eventsData, lineupsData, statsData] = await Promise.all([
    fetchFromApiFootball<{ response: ApiFootballFixture[] }>(`/fixtures?id=${fixtureId}`),
    fetchFromApiFootball<{ response: ApiFootballEvent[] }>(`/fixtures/events?fixture=${fixtureId}`),
    fetchFromApiFootball<{ response: ApiFootballLineup[] }>(`/fixtures/lineups?fixture=${fixtureId}`),
    fetchFromApiFootball<{ response: TeamStatistics[] }>(`/fixtures/statistics?fixture=${fixtureId}`),
  ]);

  const fixture = fixtureData.response[0];
  if (!fixture) {
    throw new Error(`Fixture ${fixtureId} not found`);
  }

  const baseMatch = convertFixture(fixture);
  if (!baseMatch) {
    throw new Error(`Fixture ${fixtureId} has invalid data`);
  }
  
  // Convert events to goals, bookings, substitutions
  const goals: Goal[] = [];
  const bookings: Booking[] = [];
  const substitutions: Substitution[] = [];

  for (const event of eventsData.response || []) {
    // Skip events where player data is null/missing (API sometimes returns null player IDs)
    if (event.type === 'Goal') {
      if (!event.player.id || !event.player.name) continue;
      goals.push({
        minute: event.time.elapsed,
        team: { id: event.team.id, name: event.team.name },
        scorer: { id: event.player.id, name: event.player.name },
        assist: event.assist?.id && event.assist?.name
          ? { id: event.assist.id, name: event.assist.name }
          : undefined,
      });
    } else if (event.type === 'Card') {
      if (!event.player.id || !event.player.name) continue; // Skip cards with null players
      bookings.push({
        minute: event.time.elapsed,
        team: { id: event.team.id, name: event.team.name },
        player: { id: event.player.id, name: event.player.name },
        card: event.detail === 'Yellow Card' ? 'YELLOW_CARD' : 
              event.detail === 'Red Card' ? 'RED_CARD' : 'YELLOW_RED_CARD',
      });
    } else if (event.type === 'subst') {
      if (!event.player.id || !event.player.name) continue;
      substitutions.push({
        minute: event.time.elapsed,
        team: { id: event.team.id, name: event.team.name },
        playerOut: { id: event.player.id, name: event.player.name },
        playerIn: event.assist?.id && event.assist?.name
          ? { id: event.assist.id, name: event.assist.name }
          : { id: 0, name: '' },
      });
    }
  }

  // Convert lineups
  const homeLineup = lineupsData.response?.find(l => l.team.id === fixture.teams.home.id);
  const awayLineup = lineupsData.response?.find(l => l.team.id === fixture.teams.away.id);

  const lineups = {
    homeTeam: (homeLineup?.startXI || []).map(p => ({
      id: p.player.id,
      name: p.player.name,
      position: p.player.pos || 'Unknown',
      shirtNumber: p.player.number,
    })),
    awayTeam: (awayLineup?.startXI || []).map(p => ({
      id: p.player.id,
      name: p.player.name,
      position: p.player.pos || 'Unknown',
      shirtNumber: p.player.number,
    })),
  };

  return {
    ...baseMatch,
    lineups,
    goals,
    bookings,
    substitutions,
    statistics: statsData.response,
  };
}

// Search for a team across all extended competitions
export async function searchTeamInExtended(teamName: string): Promise<{ id: number; name: string; logo: string }[]> {
  const data = await fetchFromApiFootball<{
    response: Array<{ team: { id: number; name: string; logo: string } }>;
  }>(`/teams?search=${encodeURIComponent(teamName)}`);

  return (data.response || []).map(t => t.team);
}

// Get available extended competitions
export function getExtendedCompetitions(): Array<{ code: string; id: number; name: string }> {
  const competitionNames: Record<string, string> = {
    // Top 5 European Leagues
    'PL': 'Premier League',
    'PD': 'La Liga',
    'BL1': 'Bundesliga',
    'SA': 'Serie A',
    'FL1': 'Ligue 1',
    // European Competitions
    'CL': 'UEFA Champions League',
    'EL': 'UEFA Europa League',
    'ECL': 'UEFA Conference League',
    'USC': 'UEFA Super Cup',
    // International
    'CWC': 'FIFA Club World Cup',
    'WC': 'FIFA World Cup',
    'EC': 'UEFA European Championship',
    'CA': 'Copa America',
    'GC': 'CONCACAF Gold Cup',
    'AFCON': 'Africa Cup of Nations',
    'AC': 'AFC Asian Cup',
    // Domestic Cups
    'FAC': 'FA Cup',
    'EFL': 'EFL Cup',
    'CDR': 'Copa del Rey',
    'DFB': 'DFB Pokal',
    'CIF': 'Coppa Italia',
    'CDF': 'Coupe de France',
    // Americas
    'MLS': 'MLS',
    'LMX': 'Liga MX',
    'CL_CONMEBOL': 'Copa Libertadores',
    'CS': 'Copa Sudamericana',
    // Other
    'SPL': 'Scottish Premiership',
    'JPL': 'Belgian Pro League',
    'SL': 'Super Lig',
    'RPL': 'Russian Premier League',
  };

  return Object.entries(EXTENDED_COMPETITIONS).map(([code, id]) => ({
    code,
    id,
    name: competitionNames[code] || code,
  }));
}

// Check if API-Football is configured (supports both direct and RapidAPI)
export function isApiFootballConfigured(): boolean {
  const configured = !!(process.env.API_FOOTBALL_KEY || process.env.RAPIDAPI_KEY);
  if (!configured) {
    console.log('[API-Football] Not configured - set API_FOOTBALL_KEY or RAPIDAPI_KEY');
  }
  return configured;
}

