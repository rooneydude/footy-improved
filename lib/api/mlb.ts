// MLB Stats API Client
// 📚 Library Research Agent: Using official MLB Stats API (free, no key required)
// API Docs: https://statsapi.mlb.com/docs
// ✅ Code Quality Agent: Proper error handling, type safety
// 🔍 Search Agent: Smart team name matching to prevent search overlap

const API_BASE = 'https://statsapi.mlb.com/api/v1';

import { filterBySearchRelevance, getBestMatchScore } from '@/lib/utils/search';

// Types for API responses
export interface MLBGame {
  gamePk: number;
  gameDate: string;
  gameType: string;
  status: {
    abstractGameState: string;
    codedGameState: string;
    detailedState: string;
    statusCode: string;
  };
  teams: {
    away: MLBGameTeam;
    home: MLBGameTeam;
  };
  venue: {
    id: number;
    name: string;
    link: string;
  };
}

interface MLBGameTeam {
  score?: number;
  team: {
    id: number;
    name: string;
    link: string;
  };
  isWinner?: boolean;
}

export interface MLBTeam {
  id: number;
  name: string;
  teamName: string;
  locationName: string;
  abbreviation: string;
  league: { id: number; name: string };
  division: { id: number; name: string };
  venue: { id: number; name: string };
}

export interface MLBPlayer {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  primaryNumber?: string;
  birthDate: string;
  currentTeam?: { id: number; name: string };
  primaryPosition: { code: string; name: string; type: string };
  batSide: { code: string; description: string };
  pitchHand: { code: string; description: string };
}

export interface MLBBoxScore {
  teams: {
    away: MLBTeamBoxScore;
    home: MLBTeamBoxScore;
  };
}

interface MLBTeamBoxScore {
  team: { id: number; name: string };
  teamStats: {
    batting: MLBBattingStats;
    pitching: MLBPitchingStats;
  };
  players: Record<string, MLBPlayerBoxScore>;
}

interface MLBBattingStats {
  runs: number;
  hits: number;
  homeRuns: number;
  rbi: number;
  strikeOuts: number;
  baseOnBalls: number;
}

interface MLBPitchingStats {
  runs: number;
  hits: number;
  homeRuns: number;
  strikeOuts: number;
  baseOnBalls: number;
  earnedRuns: number;
}

interface MLBPlayerBoxScore {
  person: { id: number; fullName: string };
  position: { code: string; name: string };
  stats: {
    batting?: {
      runs: number;
      hits: number;
      homeRuns: number;
      rbi: number;
      strikeOuts: number;
      baseOnBalls: number;
      atBats: number;
    };
    pitching?: {
      inningsPitched: string;
      hits: number;
      runs: number;
      earnedRuns: number;
      strikeOuts: number;
      baseOnBalls: number;
      homeRuns: number;
    };
  };
}

// Helper to fetch from API with error handling
async function fetchFromApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`MLB API error: ${response.status}`);
  }

  return response.json();
}

// Search for games by date range
export async function searchGames(
  dateFrom: string,
  dateTo: string,
  teamName?: string
): Promise<MLBGame[]> {
  const data = await fetchFromApi<{ dates: { games: MLBGame[] }[] }>(
    `/schedule?sportId=1&startDate=${dateFrom}&endDate=${dateTo}`
  );
  
  let games: MLBGame[] = [];
  for (const date of data.dates || []) {
    games.push(...(date.games || []));
  }
  
  // Filter by team name if provided with smart matching
  // This prevents overlap like "New York" matching both "Yankees" and "Mets"
  if (teamName) {
    games = filterBySearchRelevance(
      games,
      teamName,
      (game) => [
        game.teams.home.team.name,
        game.teams.away.team.name,
      ],
      20 // Minimum score threshold
    );
    
    // Sort by best match score (most relevant first)
    games.sort((a, b) => {
      const scoreA = getBestMatchScore(
        teamName,
        a.teams.home.team.name,
        a.teams.away.team.name
      );
      const scoreB = getBestMatchScore(
        teamName,
        b.teams.home.team.name,
        b.teams.away.team.name
      );
      return scoreB - scoreA;
    });
  }
  
  return games;
}

// Get game details (box score)
export async function getGameBoxScore(gamePk: number): Promise<MLBBoxScore> {
  const data = await fetchFromApi<MLBBoxScore>(
    `/game/${gamePk}/boxscore`
  );
  return data;
}

// Get game details
export async function getGameDetails(gamePk: number): Promise<MLBGame> {
  const data = await fetchFromApi<{ dates: { games: MLBGame[] }[] }>(
    `/schedule?gamePk=${gamePk}`
  );
  
  if (!data.dates?.[0]?.games?.[0]) {
    throw new Error('Game not found');
  }
  
  return data.dates[0].games[0];
}

// Get all teams
export async function getTeams(): Promise<MLBTeam[]> {
  const data = await fetchFromApi<{ teams: MLBTeam[] }>(
    '/teams?sportId=1'
  );
  return data.teams;
}

// Search for player
export async function searchPlayers(query: string): Promise<MLBPlayer[]> {
  const data = await fetchFromApi<{ people: MLBPlayer[] }>(
    `/people/search?names=${encodeURIComponent(query)}`
  );
  return data.people || [];
}

// Process box score into player appearances
export interface BaseballAppearance {
  playerId: number;
  playerName: string;
  teamName: string;
  position: string;
  hits: number;
  homeRuns: number;
  rbis: number;
  runs: number;
  atBats: number;
  strikeOuts: number;
  walks: number;
}

export function processBoxScore(boxScore: MLBBoxScore): {
  homeStats: BaseballAppearance[];
  awayStats: BaseballAppearance[];
} {
  const homeStats: BaseballAppearance[] = [];
  const awayStats: BaseballAppearance[] = [];
  
  // Process home team
  for (const [, playerData] of Object.entries(boxScore.teams.home.players)) {
    if (playerData.stats.batting && playerData.stats.batting.atBats > 0) {
      homeStats.push({
        playerId: playerData.person.id,
        playerName: playerData.person.fullName,
        teamName: boxScore.teams.home.team.name,
        position: playerData.position.name,
        hits: playerData.stats.batting.hits,
        homeRuns: playerData.stats.batting.homeRuns,
        rbis: playerData.stats.batting.rbi,
        runs: playerData.stats.batting.runs,
        atBats: playerData.stats.batting.atBats,
        strikeOuts: playerData.stats.batting.strikeOuts,
        walks: playerData.stats.batting.baseOnBalls,
      });
    }
  }
  
  // Process away team
  for (const [, playerData] of Object.entries(boxScore.teams.away.players)) {
    if (playerData.stats.batting && playerData.stats.batting.atBats > 0) {
      awayStats.push({
        playerId: playerData.person.id,
        playerName: playerData.person.fullName,
        teamName: boxScore.teams.away.team.name,
        position: playerData.position.name,
        hits: playerData.stats.batting.hits,
        homeRuns: playerData.stats.batting.homeRuns,
        rbis: playerData.stats.batting.rbi,
        runs: playerData.stats.batting.runs,
        atBats: playerData.stats.batting.atBats,
        strikeOuts: playerData.stats.batting.strikeOuts,
        walks: playerData.stats.batting.baseOnBalls,
      });
    }
  }
  
  // Sort by hits descending
  homeStats.sort((a, b) => b.hits - a.hits || b.homeRuns - a.homeRuns);
  awayStats.sort((a, b) => b.hits - a.hits || b.homeRuns - a.homeRuns);
  
  return { homeStats, awayStats };
}
