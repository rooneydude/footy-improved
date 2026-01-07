// balldontlie.io NBA API Client
// 📚 Library Research Agent: Using balldontlie.io REST API
// API Docs: https://www.balldontlie.io/home.html#introduction
// ✅ Code Quality Agent: Proper error handling, type safety

const API_BASE = 'https://api.balldontlie.io/v1';

// Types for API responses
export interface NBAGame {
  id: number;
  date: string;
  season: number;
  status: string;
  period: number;
  time: string;
  postseason: boolean;
  home_team: NBATeam;
  visitor_team: NBATeam;
  home_team_score: number;
  visitor_team_score: number;
}

export interface NBATeam {
  id: number;
  conference: string;
  division: string;
  city: string;
  name: string;
  full_name: string;
  abbreviation: string;
}

export interface NBAPlayer {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  height: string;
  weight: string;
  jersey_number: string;
  college: string;
  country: string;
  draft_year: number | null;
  draft_round: number | null;
  draft_number: number | null;
  team: NBATeam;
}

export interface NBAStats {
  id: number;
  game: NBAGame;
  player: NBAPlayer;
  team: NBATeam;
  min: string;
  fgm: number;
  fga: number;
  fg_pct: number;
  fg3m: number;
  fg3a: number;
  fg3_pct: number;
  ftm: number;
  fta: number;
  ft_pct: number;
  oreb: number;
  dreb: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  turnover: number;
  pf: number;
  pts: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total_count: number;
    next_cursor: number | null;
    per_page: number;
  };
}

// Helper to fetch from API with error handling
async function fetchFromApi<T>(endpoint: string): Promise<T> {
  const apiKey = process.env.BALLDONTLIE_API_KEY;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    headers['Authorization'] = apiKey;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw new Error(`BallDontLie API error: ${response.status}`);
  }

  return response.json();
}

// Search for games by team and date
export async function searchGames(
  teamName?: string,
  dateFrom?: string,
  dateTo?: string
): Promise<NBAGame[]> {
  const params = new URLSearchParams();
  
  if (dateFrom) {
    params.append('start_date', dateFrom);
  }
  if (dateTo) {
    params.append('end_date', dateTo);
  }
  
  const data = await fetchFromApi<PaginatedResponse<NBAGame>>(
    `/games?${params}`
  );
  
  let games = data.data;
  
  // Filter by team name if provided
  if (teamName) {
    const lowerQuery = teamName.toLowerCase();
    games = games.filter(
      (game) =>
        game.home_team.name.toLowerCase().includes(lowerQuery) ||
        game.home_team.city.toLowerCase().includes(lowerQuery) ||
        game.home_team.full_name.toLowerCase().includes(lowerQuery) ||
        game.visitor_team.name.toLowerCase().includes(lowerQuery) ||
        game.visitor_team.city.toLowerCase().includes(lowerQuery) ||
        game.visitor_team.full_name.toLowerCase().includes(lowerQuery)
    );
  }
  
  return games;
}

// Get game details by ID
export async function getGameDetails(gameId: number): Promise<NBAGame> {
  const data = await fetchFromApi<{ data: NBAGame }>(`/games/${gameId}`);
  return data.data;
}

// Get stats for a specific game
export async function getGameStats(gameId: number): Promise<NBAStats[]> {
  const data = await fetchFromApi<PaginatedResponse<NBAStats>>(
    `/stats?game_ids[]=${gameId}&per_page=100`
  );
  return data.data;
}

// Search for players
export async function searchPlayers(query: string): Promise<NBAPlayer[]> {
  const data = await fetchFromApi<PaginatedResponse<NBAPlayer>>(
    `/players?search=${encodeURIComponent(query)}`
  );
  return data.data;
}

// Get player by ID
export async function getPlayer(playerId: number): Promise<NBAPlayer> {
  const data = await fetchFromApi<{ data: NBAPlayer }>(`/players/${playerId}`);
  return data.data;
}

// Process game stats into player appearances
export interface BasketballAppearance {
  playerId: number;
  playerName: string;
  teamName: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  minutes: string;
}

export function processGameStats(stats: NBAStats[], homeTeamId: number): {
  homeStats: BasketballAppearance[];
  awayStats: BasketballAppearance[];
} {
  const homeStats: BasketballAppearance[] = [];
  const awayStats: BasketballAppearance[] = [];
  
  for (const stat of stats) {
    const appearance: BasketballAppearance = {
      playerId: stat.player.id,
      playerName: `${stat.player.first_name} ${stat.player.last_name}`,
      teamName: stat.team.full_name,
      points: stat.pts,
      rebounds: stat.reb,
      assists: stat.ast,
      steals: stat.stl,
      blocks: stat.blk,
      turnovers: stat.turnover,
      minutes: stat.min,
    };
    
    // Determine if home or away based on team
    if (stat.team.id === homeTeamId) {
      homeStats.push(appearance);
    } else {
      awayStats.push(appearance);
    }
  }
  
  // Sort by points descending
  homeStats.sort((a, b) => b.points - a.points);
  awayStats.sort((a, b) => b.points - a.points);
  
  return { homeStats, awayStats };
}
