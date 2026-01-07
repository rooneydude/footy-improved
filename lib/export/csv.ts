// CSV Export Utility
// ✅ Code Quality Agent: Proper CSV formatting with escaping

import type { EventWithRelations } from '@/types';

// Escape CSV field value
function escapeField(value: unknown): string {
  if (value === null || value === undefined) return '';
  
  const str = String(value);
  
  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

// CSV headers for events
const EVENT_HEADERS = [
  'ID',
  'Type',
  'Date',
  'Venue Name',
  'Venue City',
  'Venue Country',
  'Rating',
  'Companions',
  'Notes',
  'Home Team',
  'Away Team',
  'Home Score',
  'Away Score',
  'Competition',
  'Artist',
  'Tour Name',
];

export function generateEventsCsv(events: EventWithRelations[]): string {
  const rows: string[] = [];
  
  // Header row
  rows.push(EVENT_HEADERS.map(escapeField).join(','));
  
  // Data rows
  for (const event of events) {
    let homeTeam = '';
    let awayTeam = '';
    let homeScore = '';
    let awayScore = '';
    let competition = '';
    let artist = '';
    let tourName = '';
    
    if (event.soccerMatch) {
      homeTeam = event.soccerMatch.homeTeam;
      awayTeam = event.soccerMatch.awayTeam;
      homeScore = String(event.soccerMatch.homeScore);
      awayScore = String(event.soccerMatch.awayScore);
      competition = event.soccerMatch.competition || '';
    } else if (event.basketballGame) {
      homeTeam = event.basketballGame.homeTeam;
      awayTeam = event.basketballGame.awayTeam;
      homeScore = String(event.basketballGame.homeScore);
      awayScore = String(event.basketballGame.awayScore);
      competition = event.basketballGame.competition || '';
    } else if (event.baseballGame) {
      homeTeam = event.baseballGame.homeTeam;
      awayTeam = event.baseballGame.awayTeam;
      homeScore = String(event.baseballGame.homeScore);
      awayScore = String(event.baseballGame.awayScore);
      competition = event.baseballGame.competition || '';
    } else if (event.tennisMatch) {
      homeTeam = event.tennisMatch.player1.name;
      awayTeam = event.tennisMatch.player2.name;
      homeScore = event.tennisMatch.score;
      competition = event.tennisMatch.tournament || '';
    } else if (event.concert) {
      artist = event.concert.artist.name;
      tourName = event.concert.tourName || '';
    }
    
    const row = [
      event.id,
      event.type,
      event.date.toISOString().split('T')[0],
      event.venue.name,
      event.venue.city,
      event.venue.country,
      event.rating ?? '',
      event.companions.join('; '),
      event.notes ?? '',
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      competition,
      artist,
      tourName,
    ].map(escapeField).join(',');
    
    rows.push(row);
  }
  
  return rows.join('\n');
}

// Soccer appearances CSV
const SOCCER_HEADERS = [
  'Event Date',
  'Venue',
  'Match',
  'Player',
  'Goals',
  'Assists',
  'Yellow Card',
  'Red Card',
  'Clean Sheet',
];

export function generateSoccerAppearancesCsv(events: EventWithRelations[]): string {
  const rows: string[] = [];
  rows.push(SOCCER_HEADERS.map(escapeField).join(','));
  
  for (const event of events) {
    if (!event.soccerMatch) continue;
    
    const match = `${event.soccerMatch.homeTeam} vs ${event.soccerMatch.awayTeam}`;
    
    for (const app of event.soccerMatch.appearances) {
      const row = [
        event.date.toISOString().split('T')[0],
        event.venue.name,
        match,
        app.player.name,
        app.goals,
        app.assists,
        app.yellowCard ? 'Yes' : 'No',
        app.redCard ? 'Yes' : 'No',
        app.cleanSheet ? 'Yes' : 'No',
      ].map(escapeField).join(',');
      
      rows.push(row);
    }
  }
  
  return rows.join('\n');
}

// Concert setlists CSV
const SETLIST_HEADERS = [
  'Event Date',
  'Venue',
  'Artist',
  'Song',
  'Order',
  'Is Encore',
];

export function generateSetlistsCsv(events: EventWithRelations[]): string {
  const rows: string[] = [];
  rows.push(SETLIST_HEADERS.map(escapeField).join(','));
  
  for (const event of events) {
    if (!event.concert) continue;
    
    for (const song of event.concert.setlist) {
      const row = [
        event.date.toISOString().split('T')[0],
        event.venue.name,
        event.concert.artist.name,
        song.songName,
        song.order,
        song.isEncore ? 'Yes' : 'No',
      ].map(escapeField).join(',');
      
      rows.push(row);
    }
  }
  
  return rows.join('\n');
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
