// Team Name Normalization
// Consolidates team names from different APIs (Football-Data.org, API-Football)
// Example: "Manchester United FC" and "Manchester United" → "Manchester United"

// Common suffixes to strip from team names
const SUFFIXES_TO_STRIP = [
  / FC$/i,
  / CF$/i,
  / SC$/i,
  / AC$/i,
  / AS$/i,
  / BC$/i,
  / SL$/i,
  / RC$/i,
  / CD$/i,
  / SD$/i,
  / SE$/i,
  / SK$/i,
  / IF$/i,
  / BK$/i,
  / FK$/i,
  / SV$/i,
  / VfB$/i,
  / VfL$/i,
  / TSG$/i,
  / SSC$/i,
  / BSC$/i,
];

// Known aliases: different APIs use different names for the same team
// Key is the alternate name, value is the canonical name
const TEAM_ALIASES: Record<string, string> = {
  // English
  'Manchester United FC': 'Manchester United',
  'Manchester City FC': 'Manchester City',
  'Arsenal FC': 'Arsenal',
  'Chelsea FC': 'Chelsea',
  'Liverpool FC': 'Liverpool',
  'Tottenham Hotspur FC': 'Tottenham Hotspur',
  'Newcastle United FC': 'Newcastle United',
  'Aston Villa FC': 'Aston Villa',
  'West Ham United FC': 'West Ham United',
  'Brighton & Hove Albion FC': 'Brighton & Hove Albion',
  'Crystal Palace FC': 'Crystal Palace',
  'Everton FC': 'Everton',
  'Fulham FC': 'Fulham',
  'Brentford FC': 'Brentford',
  'Wolverhampton Wanderers FC': 'Wolverhampton Wanderers',
  'Wolves': 'Wolverhampton Wanderers',
  'AFC Bournemouth': 'Bournemouth',
  'Bournemouth FC': 'Bournemouth',
  'Nottingham Forest FC': 'Nottingham Forest',
  'Ipswich Town FC': 'Ipswich Town',
  'Leicester City FC': 'Leicester City',
  'Southampton FC': 'Southampton',
  'Leeds United FC': 'Leeds United',
  'Spurs': 'Tottenham Hotspur',

  // Spanish
  'FC Barcelona': 'Barcelona',
  'Real Madrid CF': 'Real Madrid',
  'Club Atlético de Madrid': 'Atletico Madrid',
  'Atlético de Madrid': 'Atletico Madrid',
  'Atlético Madrid': 'Atletico Madrid',
  'Real Sociedad de Fútbol': 'Real Sociedad',
  'Athletic Club': 'Athletic Bilbao',
  'Villarreal CF': 'Villarreal',
  'Real Betis Balompié': 'Real Betis',
  'Sevilla FC': 'Sevilla',
  'Valencia CF': 'Valencia',

  // German
  'FC Bayern München': 'Bayern Munich',
  'Bayern München': 'Bayern Munich',
  'Borussia Dortmund': 'Borussia Dortmund',
  'RB Leipzig': 'RB Leipzig',
  'Bayer 04 Leverkusen': 'Bayer Leverkusen',
  'VfB Stuttgart': 'Stuttgart',
  'Eintracht Frankfurt': 'Eintracht Frankfurt',
  'VfL Wolfsburg': 'Wolfsburg',
  'SC Freiburg': 'Freiburg',
  'TSG 1899 Hoffenheim': 'Hoffenheim',
  '1. FC Union Berlin': 'Union Berlin',
  'Borussia Mönchengladbach': 'Borussia Monchengladbach',

  // Italian
  'FC Internazionale Milano': 'Inter Milan',
  'Inter': 'Inter Milan',
  'AC Milan': 'AC Milan',
  'Juventus FC': 'Juventus',
  'SSC Napoli': 'Napoli',
  'AS Roma': 'AS Roma',
  'SS Lazio': 'Lazio',
  'ACF Fiorentina': 'Fiorentina',
  'Atalanta BC': 'Atalanta',
  'Bologna FC 1909': 'Bologna',

  // French
  'Paris Saint-Germain FC': 'Paris Saint-Germain',
  'Paris Saint Germain': 'Paris Saint-Germain',
  'PSG': 'Paris Saint-Germain',
  'Olympique de Marseille': 'Marseille',
  'Olympique Lyonnais': 'Lyon',
  'AS Monaco FC': 'Monaco',
  'LOSC Lille': 'Lille',
  'RC Lens': 'Lens',
  'OGC Nice': 'Nice',
  'Stade Rennais FC 1901': 'Rennes',
  'RC Strasbourg Alsace': 'Strasbourg',

  // MLS
  'LA Galaxy': 'LA Galaxy',
  'Los Angeles Galaxy': 'LA Galaxy',
  'Inter Miami CF': 'Inter Miami',
  'Inter Miami': 'Inter Miami',
  'New York City FC': 'New York City',
  'Atlanta United FC': 'Atlanta United',
  'Portland Timbers FC': 'Portland Timbers',
  'Seattle Sounders FC': 'Seattle Sounders',
  'Austin FC': 'Austin',
  'CF Montréal': 'CF Montreal',
  'Charlotte FC': 'Charlotte',
  'Nashville SC': 'Nashville',
  'St. Louis City SC': 'St. Louis City',
};

/**
 * Normalize a team name to a canonical form.
 * Handles differences between Football-Data.org and API-Football naming.
 */
export function normalizeTeamName(name: string): string {
  if (!name) return name;

  // Check explicit aliases first
  const alias = TEAM_ALIASES[name];
  if (alias) return alias;

  // Strip common suffixes
  let normalized = name.trim();
  for (const suffix of SUFFIXES_TO_STRIP) {
    normalized = normalized.replace(suffix, '').trim();
  }

  // Check aliases again after stripping
  const aliasAfterStrip = TEAM_ALIASES[normalized];
  if (aliasAfterStrip) return aliasAfterStrip;

  return normalized;
}

/**
 * Check if two team names refer to the same team.
 */
export function isSameTeam(name1: string, name2: string): boolean {
  return normalizeTeamName(name1) === normalizeTeamName(name2);
}
