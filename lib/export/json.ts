// JSON Export Utility
// ✅ Code Quality Agent: Comprehensive data export with proper formatting

import type { EventWithRelations } from '@/types';

export interface ExportData {
  exportedAt: string;
  version: string;
  user: {
    id: string;
    name?: string;
    email?: string;
  };
  stats: {
    totalEvents: number;
    eventsByType: Record<string, number>;
    uniqueVenues: number;
    uniqueCountries: number;
  };
  events: ExportedEvent[];
  achievements: ExportedAchievement[];
}

export interface ExportedEvent {
  id: string;
  type: string;
  date: string;
  venue: {
    name: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  rating?: number;
  companions: string[];
  notes?: string;
  // Sport-specific data
  sportData?: Record<string, unknown>;
  // Simplified setlist for concerts
  setlist?: { song: string; isEncore: boolean }[];
}

export interface ExportedAchievement {
  id: string;
  name: string;
  unlockedAt: string;
}

export function formatEventForExport(event: EventWithRelations): ExportedEvent {
  const exportedEvent: ExportedEvent = {
    id: event.id,
    type: event.type,
    date: event.date.toISOString(),
    venue: {
      name: event.venue.name,
      city: event.venue.city,
      country: event.venue.country,
      latitude: event.venue.latitude ?? undefined,
      longitude: event.venue.longitude ?? undefined,
    },
    rating: event.rating ?? undefined,
    companions: event.companions,
    notes: event.notes ?? undefined,
  };

  // Add sport-specific data
  if (event.soccerMatch) {
    exportedEvent.sportData = {
      homeTeam: event.soccerMatch.homeTeam,
      awayTeam: event.soccerMatch.awayTeam,
      homeScore: event.soccerMatch.homeScore,
      awayScore: event.soccerMatch.awayScore,
      competition: event.soccerMatch.competition,
      appearances: event.soccerMatch.appearances.map((a) => ({
        player: a.player.name,
        goals: a.goals,
        assists: a.assists,
        yellowCard: a.yellowCard,
        redCard: a.redCard,
        cleanSheet: a.cleanSheet,
      })),
    };
  }

  if (event.basketballGame) {
    exportedEvent.sportData = {
      homeTeam: event.basketballGame.homeTeam,
      awayTeam: event.basketballGame.awayTeam,
      homeScore: event.basketballGame.homeScore,
      awayScore: event.basketballGame.awayScore,
      competition: event.basketballGame.competition,
      appearances: event.basketballGame.appearances.map((a) => ({
        player: a.player.name,
        points: a.points,
        rebounds: a.rebounds,
        assists: a.assists,
      })),
    };
  }

  if (event.baseballGame) {
    exportedEvent.sportData = {
      homeTeam: event.baseballGame.homeTeam,
      awayTeam: event.baseballGame.awayTeam,
      homeScore: event.baseballGame.homeScore,
      awayScore: event.baseballGame.awayScore,
      competition: event.baseballGame.competition,
      appearances: event.baseballGame.appearances.map((a) => ({
        player: a.player.name,
        homeRuns: a.homeRuns,
        hits: a.hits,
        rbis: a.rbis,
      })),
    };
  }

  if (event.tennisMatch) {
    exportedEvent.sportData = {
      player1: event.tennisMatch.player1.name,
      player2: event.tennisMatch.player2.name,
      winner: event.tennisMatch.winner?.name,
      score: event.tennisMatch.score,
      tournament: event.tennisMatch.tournament,
      round: event.tennisMatch.round,
    };
  }

  if (event.concert) {
    exportedEvent.sportData = {
      artist: event.concert.artist.name,
      tourName: event.concert.tourName,
      openingActs: event.concert.openingActs,
    };
    exportedEvent.setlist = event.concert.setlist.map((s) => ({
      song: s.songName,
      isEncore: s.isEncore,
    }));
  }

  return exportedEvent;
}

export function generateExportJson(
  events: EventWithRelations[],
  user: { id: string; name?: string | null; email?: string | null },
  achievements: { id: string; name: string; unlockedAt: Date }[]
): ExportData {
  // Calculate stats
  const eventsByType: Record<string, number> = {};
  const uniqueVenues = new Set<string>();
  const uniqueCountries = new Set<string>();

  for (const event of events) {
    eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    uniqueVenues.add(event.venueId);
    uniqueCountries.add(event.venue.country);
  }

  return {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    user: {
      id: user.id,
      name: user.name ?? undefined,
      email: user.email ?? undefined,
    },
    stats: {
      totalEvents: events.length,
      eventsByType,
      uniqueVenues: uniqueVenues.size,
      uniqueCountries: uniqueCountries.size,
    },
    events: events.map(formatEventForExport),
    achievements: achievements.map((a) => ({
      id: a.id,
      name: a.name,
      unlockedAt: a.unlockedAt.toISOString(),
    })),
  };
}

export function downloadJson(data: ExportData, filename: string = 'footytracker-export.json'): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
