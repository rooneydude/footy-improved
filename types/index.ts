// TypeScript Type Definitions
// ✅ Code Quality Agent: Comprehensive types with strict typing

import type { 
  Event, 
  Venue, 
  Player, 
  Artist,
  SoccerMatch,
  BasketballGame,
  BaseballGame,
  TennisMatch,
  Concert,
  SoccerAppearance,
  BasketballAppearance,
  BaseballAppearance,
  TennisAppearance,
  SetlistItem,
  Media,
  Achievement,
  UserAchievement,
  User,
} from '@prisma/client';

// Re-export Prisma types
export type {
  Event,
  Venue,
  Player,
  Artist,
  SoccerMatch,
  BasketballGame,
  BaseballGame,
  TennisMatch,
  Concert,
  SoccerAppearance,
  BasketballAppearance,
  BaseballAppearance,
  TennisAppearance,
  SetlistItem,
  Media,
  Achievement,
  UserAchievement,
  User,
};

// Event types enum
export type EventType = 'SOCCER' | 'BASKETBALL' | 'BASEBALL' | 'TENNIS' | 'CONCERT';

// Extended Event type with relations
export type EventWithRelations = Event & {
  venue: Venue;
  media: Media[];
  soccerMatch?: SoccerMatchWithAppearances | null;
  basketballGame?: BasketballGameWithAppearances | null;
  baseballGame?: BaseballGameWithAppearances | null;
  tennisMatch?: TennisMatchWithAppearances | null;
  concert?: ConcertWithDetails | null;
};

// Sport-specific types with relations
export type SoccerMatchWithAppearances = SoccerMatch & {
  appearances: (SoccerAppearance & { player: Player })[];
};

export type BasketballGameWithAppearances = BasketballGame & {
  appearances: (BasketballAppearance & { player: Player })[];
};

export type BaseballGameWithAppearances = BaseballGame & {
  appearances: (BaseballAppearance & { player: Player })[];
};

export type TennisMatchWithAppearances = TennisMatch & {
  player1: Player;
  player2: Player;
  winner?: Player | null;
  appearances: (TennisAppearance & { player: Player })[];
};

export type ConcertWithDetails = Concert & {
  artist: Artist;
  setlist: SetlistItem[];
};

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form input types
export interface EventFormInput {
  date: Date;
  venueId?: string;
  venueName?: string;
  venueCity?: string;
  venueCountry?: string;
  notes?: string;
  rating?: number;
  companions?: string[];
}

export interface SoccerFormInput extends EventFormInput {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  competition?: string;
  externalMatchId?: string;
  appearances?: SoccerAppearanceInput[];
}

// Soccer appearance inputs
export interface SoccerAppearanceInput {
  playerName: string;
  goals?: number;
  assists?: number;
  yellowCard?: boolean;
  redCard?: boolean;
  cleanSheet?: boolean;
}

export interface BasketballFormInput extends EventFormInput {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  competition?: string;
  externalGameId?: string;
  appearances?: BasketballAppearanceInput[];
}

export interface BasketballAppearanceInput {
  playerName: string;
  points?: number;
}

export interface BaseballFormInput extends EventFormInput {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  competition?: string;
  externalGameId?: string;
  appearances?: BaseballAppearanceInput[];
}

export interface BaseballAppearanceInput {
  playerName: string;
  homeRuns?: number;
  rbis?: number;
}

export interface TennisFormInput extends EventFormInput {
  player1Name: string;
  player2Name: string;
  winnerName?: string;
  score: string;
  tournament?: string;
  round?: string;
}

export interface ConcertFormInput extends EventFormInput {
  artistName: string;
  tourName?: string;
  openingActs?: string[];
  setlist?: SetlistItemInput[];
}

export interface SetlistItemInput {
  songName: string;
  order: number;
  isEncore?: boolean;
  notes?: string;
}

// Stats types
export interface UserStats {
  totalEvents: number;
  eventsByType: Record<EventType, number>;
  uniqueVenues: number;
  uniqueCountries: number;
  totalGoalsWitnessed: number;
  totalPointsWitnessed: number;
  totalHomeRunsWitnessed: number;
  totalConcerts: number;
  favoriteVenue?: Venue;
  favoriteArtist?: Artist;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  value: number;
  photoUrl?: string;
  team?: string;
}

// Achievement types
export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  criteria: AchievementCriteria;
}

export interface AchievementCriteria {
  type: string;
  threshold?: number;
  eventType?: EventType;
  [key: string]: unknown;
}

// Year in Review types
export interface YearReview {
  year: number;
  totalEvents: number;
  eventsByType: Record<EventType, number>;
  topVenues: { venue: Venue; count: number }[];
  topPlayers: LeaderboardEntry[];
  topArtists: { artist: Artist; count: number }[];
  monthlyBreakdown: { month: number; count: number }[];
  achievements: Achievement[];
  highlights: EventWithRelations[];
}

// NextAuth session extension
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
