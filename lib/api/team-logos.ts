// Team Logo Utilities
// 📚 Library Research Agent: Using official API logo endpoints
// - Football-Data.org crests: https://crests.football-data.org/{teamId}.png
// - NBA logos: https://cdn.nba.com/logos/nba/{teamId}/primary/L/logo.svg
// - MLB logos: https://www.mlbstatic.com/team-logos/{teamId}.svg
// ✅ Code Quality Agent: Caching, fallbacks, type safety

import { prisma } from '@/lib/prisma';

// Logo URL patterns for different sports
const LOGO_PATTERNS = {
  soccer: {
    footballData: (teamId: string | number) =>
      `https://crests.football-data.org/${teamId}.png`,
    wikipedia: (teamName: string) =>
      `https://upload.wikimedia.org/wikipedia/commons/thumb/${encodeURIComponent(teamName)}.svg`,
  },
  basketball: {
    nba: (teamId: string | number) =>
      `https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`,
    espn: (teamId: string | number) =>
      `https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/${teamId}.png`,
  },
  baseball: {
    mlb: (teamId: string | number) =>
      `https://www.mlbstatic.com/team-logos/${teamId}.svg`,
    mlbStatic: (teamId: string | number) =>
      `https://midfield.mlbstatic.com/v1/team/${teamId}/spots/72`,
  },
};

// Team ID mappings for NBA (team abbreviation -> team ID)
export const NBA_TEAM_IDS: Record<string, number> = {
  'Atlanta Hawks': 1610612737,
  'Boston Celtics': 1610612738,
  'Brooklyn Nets': 1610612751,
  'Charlotte Hornets': 1610612766,
  'Chicago Bulls': 1610612741,
  'Cleveland Cavaliers': 1610612739,
  'Dallas Mavericks': 1610612742,
  'Denver Nuggets': 1610612743,
  'Detroit Pistons': 1610612765,
  'Golden State Warriors': 1610612744,
  'Houston Rockets': 1610612745,
  'Indiana Pacers': 1610612754,
  'LA Clippers': 1610612746,
  'Los Angeles Lakers': 1610612747,
  'Memphis Grizzlies': 1610612763,
  'Miami Heat': 1610612748,
  'Milwaukee Bucks': 1610612749,
  'Minnesota Timberwolves': 1610612750,
  'New Orleans Pelicans': 1610612740,
  'New York Knicks': 1610612752,
  'Oklahoma City Thunder': 1610612760,
  'Orlando Magic': 1610612753,
  'Philadelphia 76ers': 1610612755,
  'Phoenix Suns': 1610612756,
  'Portland Trail Blazers': 1610612757,
  'Sacramento Kings': 1610612758,
  'San Antonio Spurs': 1610612759,
  'Toronto Raptors': 1610612761,
  'Utah Jazz': 1610612762,
  'Washington Wizards': 1610612764,
};

// Team ID mappings for MLB
export const MLB_TEAM_IDS: Record<string, number> = {
  'Arizona Diamondbacks': 109,
  'Atlanta Braves': 144,
  'Baltimore Orioles': 110,
  'Boston Red Sox': 111,
  'Chicago Cubs': 112,
  'Chicago White Sox': 145,
  'Cincinnati Reds': 113,
  'Cleveland Guardians': 114,
  'Colorado Rockies': 115,
  'Detroit Tigers': 116,
  'Houston Astros': 117,
  'Kansas City Royals': 118,
  'Los Angeles Angels': 108,
  'Los Angeles Dodgers': 119,
  'Miami Marlins': 146,
  'Milwaukee Brewers': 158,
  'Minnesota Twins': 142,
  'New York Mets': 121,
  'New York Yankees': 147,
  'Oakland Athletics': 133,
  'Philadelphia Phillies': 143,
  'Pittsburgh Pirates': 134,
  'San Diego Padres': 135,
  'San Francisco Giants': 137,
  'Seattle Mariners': 136,
  'St. Louis Cardinals': 138,
  'Tampa Bay Rays': 139,
  'Texas Rangers': 140,
  'Toronto Blue Jays': 141,
  'Washington Nationals': 120,
};

export interface TeamLogoResult {
  logoUrl: string | null;
  teamId: string | null;
  source: string;
}

/**
 * Get team logo URL for soccer teams (from Football-Data.org)
 */
export function getSoccerTeamLogo(teamId: number | string): string {
  return LOGO_PATTERNS.soccer.footballData(teamId);
}

/**
 * Get team logo URL for NBA teams
 */
export function getNBATeamLogo(teamName: string): string | null {
  const teamId = NBA_TEAM_IDS[teamName];
  if (!teamId) {
    // Try partial match
    const matchingTeam = Object.entries(NBA_TEAM_IDS).find(([name]) =>
      name.toLowerCase().includes(teamName.toLowerCase()) ||
      teamName.toLowerCase().includes(name.toLowerCase())
    );
    if (matchingTeam) {
      return LOGO_PATTERNS.basketball.nba(matchingTeam[1]);
    }
    return null;
  }
  return LOGO_PATTERNS.basketball.nba(teamId);
}

/**
 * Get team logo URL for MLB teams
 */
export function getMLBTeamLogo(teamName: string): string | null {
  const teamId = MLB_TEAM_IDS[teamName];
  if (!teamId) {
    // Try partial match
    const matchingTeam = Object.entries(MLB_TEAM_IDS).find(([name]) =>
      name.toLowerCase().includes(teamName.toLowerCase()) ||
      teamName.toLowerCase().includes(name.toLowerCase())
    );
    if (matchingTeam) {
      return LOGO_PATTERNS.baseball.mlb(matchingTeam[1]);
    }
    return null;
  }
  return LOGO_PATTERNS.baseball.mlb(teamId);
}

/**
 * Get team logo URL based on sport type
 */
export function getTeamLogoUrl(
  teamName: string,
  sport: 'soccer' | 'basketball' | 'baseball',
  externalId?: string | number
): string | null {
  switch (sport) {
    case 'soccer':
      if (externalId) {
        return getSoccerTeamLogo(externalId);
      }
      return null;
    case 'basketball':
      return getNBATeamLogo(teamName);
    case 'baseball':
      return getMLBTeamLogo(teamName);
    default:
      return null;
  }
}

/**
 * Find or create a team in the database
 */
export async function findOrCreateTeam(
  name: string,
  sport: string,
  options?: {
    shortName?: string;
    tla?: string;
    league?: string;
    country?: string;
    externalId?: string;
    logoUrl?: string;
  }
) {
  let team = await prisma.team.findFirst({
    where: {
      name,
      sport,
    },
  });

  if (!team) {
    // Try to get logo URL based on sport
    let logoUrl = options?.logoUrl;
    if (!logoUrl && options?.externalId) {
      logoUrl = getTeamLogoUrl(name, sport.toLowerCase() as 'soccer' | 'basketball' | 'baseball', options.externalId) || undefined;
    } else if (!logoUrl) {
      logoUrl = getTeamLogoUrl(name, sport.toLowerCase() as 'soccer' | 'basketball' | 'baseball') || undefined;
    }

    team = await prisma.team.create({
      data: {
        name,
        sport,
        shortName: options?.shortName,
        tla: options?.tla,
        league: options?.league,
        country: options?.country,
        externalId: options?.externalId,
        logoUrl,
      },
    });
  }

  return team;
}

/**
 * Get team with logo, creating if it doesn't exist
 */
export async function getTeamWithLogo(
  teamName: string,
  sport: 'SOCCER' | 'BASKETBALL' | 'BASEBALL',
  externalId?: string
): Promise<{ id: string; name: string; logoUrl: string | null }> {
  const sportLower = sport.toLowerCase() as 'soccer' | 'basketball' | 'baseball';
  
  // Try to find existing team
  let team = await prisma.team.findFirst({
    where: { name: teamName, sport },
  });

  if (team) {
    return { id: team.id, name: team.name, logoUrl: team.logoUrl };
  }

  // Create new team with logo
  const logoUrl = getTeamLogoUrl(teamName, sportLower, externalId);
  
  team = await prisma.team.create({
    data: {
      name: teamName,
      sport,
      externalId,
      logoUrl,
    },
  });

  return { id: team.id, name: team.name, logoUrl: team.logoUrl };
}

/**
 * Batch get team logos for multiple teams
 */
export async function getTeamLogos(
  teamNames: string[],
  sport: 'SOCCER' | 'BASKETBALL' | 'BASEBALL'
): Promise<Map<string, string | null>> {
  const logoMap = new Map<string, string | null>();
  const sportLower = sport.toLowerCase() as 'soccer' | 'basketball' | 'baseball';

  // First check database for existing teams
  const existingTeams = await prisma.team.findMany({
    where: {
      name: { in: teamNames },
      sport,
    },
  });

  for (const team of existingTeams) {
    logoMap.set(team.name, team.logoUrl);
  }

  // For teams not in database, generate logo URLs
  for (const teamName of teamNames) {
    if (!logoMap.has(teamName)) {
      logoMap.set(teamName, getTeamLogoUrl(teamName, sportLower));
    }
  }

  return logoMap;
}

