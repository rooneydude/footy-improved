// Achievement Definitions
// ✅ Code Quality Agent: Comprehensive achievement system with clear criteria
// 🎓 Learning Agent: 30+ achievements across events, geography, sports, concerts, and special categories

import type { AchievementDefinition, EventType } from '@/types';

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // ============================================
  // Event Milestones
  // ============================================
  {
    id: 'first-memory',
    name: 'First Memory',
    description: 'Log your first event',
    icon: '🎉',
    tier: 'BRONZE',
    criteria: { type: 'total_events', threshold: 1 },
  },
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Log 10 events',
    icon: '🌟',
    tier: 'BRONZE',
    criteria: { type: 'total_events', threshold: 10 },
  },
  {
    id: 'dedicated-fan',
    name: 'Dedicated Fan',
    description: 'Log 50 events',
    icon: '💪',
    tier: 'SILVER',
    criteria: { type: 'total_events', threshold: 50 },
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Log 100 events',
    icon: '💯',
    tier: 'GOLD',
    criteria: { type: 'total_events', threshold: 100 },
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Log 500 events',
    icon: '👑',
    tier: 'PLATINUM',
    criteria: { type: 'total_events', threshold: 500 },
  },

  // ============================================
  // Geographic Achievements
  // ============================================
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Attend events at 5 different venues',
    icon: '🗺️',
    tier: 'BRONZE',
    criteria: { type: 'unique_venues', threshold: 5 },
  },
  {
    id: 'world-traveler',
    name: 'World Traveler',
    description: 'Attend events in 5 different countries',
    icon: '✈️',
    tier: 'SILVER',
    criteria: { type: 'unique_countries', threshold: 5 },
  },
  {
    id: 'globe-trotter',
    name: 'Globe Trotter',
    description: 'Attend events in 10 different countries',
    icon: '🌍',
    tier: 'GOLD',
    criteria: { type: 'unique_countries', threshold: 10 },
  },
  {
    id: 'home-ground',
    name: 'Home Ground',
    description: 'Attend 10 events at the same venue',
    icon: '🏠',
    tier: 'SILVER',
    criteria: { type: 'same_venue_events', threshold: 10 },
  },
  {
    id: 'city-dweller',
    name: 'City Dweller',
    description: 'Attend events in 10 different cities',
    icon: '🏙️',
    tier: 'SILVER',
    criteria: { type: 'unique_cities', threshold: 10 },
  },

  // ============================================
  // Soccer Achievements
  // ============================================
  {
    id: 'goal-witness',
    name: 'Goal Witness',
    description: 'Witness 50 goals',
    icon: '⚽',
    tier: 'BRONZE',
    criteria: { type: 'goals_witnessed', threshold: 50, eventType: 'SOCCER' as EventType },
  },
  {
    id: 'goal-machine',
    name: 'Goal Machine',
    description: 'Witness 100 goals',
    icon: '🥅',
    tier: 'SILVER',
    criteria: { type: 'goals_witnessed', threshold: 100, eventType: 'SOCCER' as EventType },
  },
  {
    id: 'clean-sheet-club',
    name: 'Clean Sheet Club',
    description: 'Witness 10 clean sheets',
    icon: '🧤',
    tier: 'SILVER',
    criteria: { type: 'clean_sheets', threshold: 10, eventType: 'SOCCER' as EventType },
  },
  {
    id: 'red-mist',
    name: 'Red Mist',
    description: 'Witness a red card',
    icon: '🟥',
    tier: 'BRONZE',
    criteria: { type: 'red_cards', threshold: 1, eventType: 'SOCCER' as EventType },
  },
  {
    id: 'soccer-regular',
    name: 'Soccer Regular',
    description: 'Attend 25 soccer matches',
    icon: '⚽',
    tier: 'SILVER',
    criteria: { type: 'events_by_type', threshold: 25, eventType: 'SOCCER' as EventType },
  },

  // ============================================
  // Basketball Achievements
  // ============================================
  {
    id: 'points-machine',
    name: 'Points Machine',
    description: 'Witness 1000 points scored',
    icon: '🏀',
    tier: 'SILVER',
    criteria: { type: 'points_witnessed', threshold: 1000, eventType: 'BASKETBALL' as EventType },
  },
  {
    id: 'triple-double-witness',
    name: 'Triple Double Witness',
    description: 'Witness a triple-double performance',
    icon: '🔥',
    tier: 'GOLD',
    criteria: { type: 'triple_double', threshold: 1, eventType: 'BASKETBALL' as EventType },
  },
  {
    id: 'basketball-regular',
    name: 'Basketball Regular',
    description: 'Attend 25 basketball games',
    icon: '🏀',
    tier: 'SILVER',
    criteria: { type: 'events_by_type', threshold: 25, eventType: 'BASKETBALL' as EventType },
  },

  // ============================================
  // Baseball Achievements
  // ============================================
  {
    id: 'home-run-hunter',
    name: 'Home Run Hunter',
    description: 'Witness 25 home runs',
    icon: '⚾',
    tier: 'SILVER',
    criteria: { type: 'home_runs', threshold: 25, eventType: 'BASEBALL' as EventType },
  },
  {
    id: 'grand-slam-witness',
    name: 'Grand Slam Witness',
    description: 'Witness a grand slam',
    icon: '💥',
    tier: 'GOLD',
    criteria: { type: 'grand_slam', threshold: 1, eventType: 'BASEBALL' as EventType },
  },
  {
    id: 'baseball-regular',
    name: 'Baseball Regular',
    description: 'Attend 25 baseball games',
    icon: '⚾',
    tier: 'SILVER',
    criteria: { type: 'events_by_type', threshold: 25, eventType: 'BASEBALL' as EventType },
  },

  // ============================================
  // Tennis Achievements
  // ============================================
  {
    id: 'tennis-fan',
    name: 'Tennis Fan',
    description: 'Attend 10 tennis matches',
    icon: '🎾',
    tier: 'BRONZE',
    criteria: { type: 'events_by_type', threshold: 10, eventType: 'TENNIS' as EventType },
  },
  {
    id: 'grand-slam-fan',
    name: 'Grand Slam Fan',
    description: 'Attend matches at all 4 Grand Slam tournaments',
    icon: '🏆',
    tier: 'PLATINUM',
    criteria: { type: 'grand_slam_tournaments', threshold: 4, eventType: 'TENNIS' as EventType },
  },

  // ============================================
  // Concert Achievements
  // ============================================
  {
    id: 'concert-goer',
    name: 'Concert Goer',
    description: 'Attend 10 concerts',
    icon: '🎵',
    tier: 'BRONZE',
    criteria: { type: 'events_by_type', threshold: 10, eventType: 'CONCERT' as EventType },
  },
  {
    id: 'encore',
    name: 'Encore',
    description: 'Attend 50 concerts',
    icon: '🎤',
    tier: 'SILVER',
    criteria: { type: 'events_by_type', threshold: 50, eventType: 'CONCERT' as EventType },
  },
  {
    id: 'superfan',
    name: 'Superfan',
    description: 'See the same artist 5 times',
    icon: '❤️',
    tier: 'SILVER',
    criteria: { type: 'same_artist', threshold: 5, eventType: 'CONCERT' as EventType },
  },
  {
    id: 'festival-season',
    name: 'Festival Season',
    description: 'Attend 3 festivals in one year',
    icon: '🎪',
    tier: 'GOLD',
    criteria: { type: 'festivals_in_year', threshold: 3, eventType: 'CONCERT' as EventType },
  },
  {
    id: 'setlist-collector',
    name: 'Setlist Collector',
    description: 'Log complete setlists for 10 concerts',
    icon: '📝',
    tier: 'SILVER',
    criteria: { type: 'complete_setlists', threshold: 10, eventType: 'CONCERT' as EventType },
  },

  // ============================================
  // Special Achievements
  // ============================================
  {
    id: 'triple-header',
    name: 'Triple Header',
    description: 'Attend 3 events in one day',
    icon: '⚡',
    tier: 'GOLD',
    criteria: { type: 'events_same_day', threshold: 3 },
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Attend events every month for 6 months',
    icon: '📅',
    tier: 'GOLD',
    criteria: { type: 'monthly_streak', threshold: 6 },
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Attend an event that ends after midnight',
    icon: '🦉',
    tier: 'BRONZE',
    criteria: { type: 'late_night', threshold: 1 },
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Be first to log an event at a venue',
    icon: '🐦',
    tier: 'BRONZE',
    criteria: { type: 'first_at_venue', threshold: 1 },
  },
  {
    id: 'variety-pack',
    name: 'Variety Pack',
    description: 'Attend all 5 event types',
    icon: '🎨',
    tier: 'SILVER',
    criteria: { type: 'all_event_types', threshold: 5 },
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Attend events with 10 different companions',
    icon: '🦋',
    tier: 'SILVER',
    criteria: { type: 'unique_companions', threshold: 10 },
  },
  {
    id: 'solo-adventurer',
    name: 'Solo Adventurer',
    description: 'Attend 10 events alone',
    icon: '🧑',
    tier: 'BRONZE',
    criteria: { type: 'solo_events', threshold: 10 },
  },
];

// Helper functions
export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getAchievementsByTier(tier: AchievementDefinition['tier']): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((a) => a.tier === tier);
}

export function getAchievementsBySport(eventType: EventType): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((a) => a.criteria.eventType === eventType);
}

export function getAllAchievements(): AchievementDefinition[] {
  return ACHIEVEMENTS;
}

// Achievement tiers ordered by value
export const TIER_ORDER: Record<AchievementDefinition['tier'], number> = {
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
};
