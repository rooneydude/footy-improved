// Stats Query Functions
// 📚 Library Research Agent: Prisma (40,752 ⭐) for type-safe database queries
// ✅ Code Quality Agent: Optimized aggregations, proper error handling

import prisma from '@/lib/prisma';

// Types for stats results
export interface PlayerLeaderboardEntry {
  playerId: string;
  playerName: string;
  teamName: string;
  totalGoals?: number;
  totalAssists?: number;
  totalPoints?: number;
  totalRebounds?: number;
  totalHits?: number;
  totalHomeRuns?: number;
  appearances: number;
}

export interface TeamStatsEntry {
  teamName: string;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  goalsFor: number;
  goalsAgainst: number;
  pointsFor?: number;
  pointsAgainst?: number;
}

export interface VenueStatsEntry {
  venueId: string;
  venueName: string;
  city: string;
  country: string;
  totalEvents: number;
  eventTypes: { type: string; count: number }[];
  wins: number;
  losses: number;
  draws: number;
}

export interface ArtistStatsEntry {
  artistId: string;
  artistName: string;
  timesSeen: number;
  totalSongsHeard: number;
  topSongs: { songName: string; timesPlayed: number }[];
}

// Get player leaderboard for soccer
export async function getSoccerLeaderboard(
  userId: string,
  statType: 'goals' | 'assists' | 'appearances' = 'goals',
  limit: number = 20,
  year?: number
): Promise<PlayerLeaderboardEntry[]> {
  const whereClause: Record<string, unknown> = {
    match: {
      event: {
        userId,
      },
    },
  };

  if (year) {
    whereClause.match = {
      event: {
        userId,
        date: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    };
  }

  const players = await prisma.soccerAppearance.groupBy({
    by: ['playerId'],
    where: whereClause,
    _sum: {
      goals: true,
      assists: true,
    },
    _count: {
      playerId: true,
    },
    orderBy: {
      _sum: {
        [statType === 'appearances' ? 'goals' : statType]: 'desc',
      },
    },
    take: limit,
  });

  // Get player details
  const playerIds = players.map((p) => p.playerId);
  const playerDetails = await prisma.player.findMany({
    where: { id: { in: playerIds } },
    select: { id: true, name: true, team: true },
  });

  const playerMap = new Map(playerDetails.map((p) => [p.id, p]));

  return players.map((p) => {
    const details = playerMap.get(p.playerId);
    return {
      playerId: p.playerId,
      playerName: details?.name || 'Unknown',
      teamName: details?.team || 'Unknown',
      totalGoals: p._sum.goals || 0,
      totalAssists: p._sum.assists || 0,
      appearances: p._count.playerId,
    };
  });
}

// Get player leaderboard for basketball
export async function getBasketballLeaderboard(
  userId: string,
  statType: 'points' | 'rebounds' | 'assists' | 'appearances' = 'points',
  limit: number = 20,
  year?: number
): Promise<PlayerLeaderboardEntry[]> {
  const whereClause: Record<string, unknown> = {
    game: {
      event: {
        userId,
      },
    },
  };

  if (year) {
    whereClause.game = {
      event: {
        userId,
        date: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    };
  }

  const players = await prisma.basketballAppearance.groupBy({
    by: ['playerId'],
    where: whereClause,
    _sum: {
      points: true,
      rebounds: true,
      assists: true,
    },
    _count: {
      playerId: true,
    },
    orderBy: {
      _sum: {
        [statType === 'appearances' ? 'points' : statType]: 'desc',
      },
    },
    take: limit,
  });

  // Get player details
  const playerIds = players.map((p) => p.playerId);
  const playerDetails = await prisma.player.findMany({
    where: { id: { in: playerIds } },
    select: { id: true, name: true, team: true },
  });

  const playerMap = new Map(playerDetails.map((p) => [p.id, p]));

  return players.map((p) => {
    const details = playerMap.get(p.playerId);
    return {
      playerId: p.playerId,
      playerName: details?.name || 'Unknown',
      teamName: details?.team || 'Unknown',
      totalPoints: p._sum.points || 0,
      totalRebounds: p._sum.rebounds || 0,
      totalAssists: p._sum.assists || 0,
      appearances: p._count.playerId,
    };
  });
}

// Get player leaderboard for baseball
export async function getBaseballLeaderboard(
  userId: string,
  statType: 'homeRuns' | 'hits' | 'rbis' | 'appearances' = 'homeRuns',
  limit: number = 20,
  year?: number
): Promise<PlayerLeaderboardEntry[]> {
  const whereClause: Record<string, unknown> = {
    game: {
      event: {
        userId,
      },
    },
  };

  if (year) {
    whereClause.game = {
      event: {
        userId,
        date: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    };
  }

  const players = await prisma.baseballAppearance.groupBy({
    by: ['playerId'],
    where: whereClause,
    _sum: {
      hits: true,
      homeRuns: true,
      rbis: true,
    },
    _count: {
      playerId: true,
    },
    orderBy: {
      _sum: {
        [statType === 'appearances' ? 'hits' : statType]: 'desc',
      },
    },
    take: limit,
  });

  // Get player details
  const playerIds = players.map((p) => p.playerId);
  const playerDetails = await prisma.player.findMany({
    where: { id: { in: playerIds } },
    select: { id: true, name: true, team: true },
  });

  const playerMap = new Map(playerDetails.map((p) => [p.id, p]));

  return players.map((p) => {
    const details = playerMap.get(p.playerId);
    return {
      playerId: p.playerId,
      playerName: details?.name || 'Unknown',
      teamName: details?.team || 'Unknown',
      totalHits: p._sum.hits || 0,
      totalHomeRuns: p._sum.homeRuns || 0,
      appearances: p._count.playerId,
    };
  });
}

// Get player profile with all appearances
export async function getPlayerProfile(userId: string, playerId: string) {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      soccerAppearances: {
        where: {
          match: { event: { userId } },
        },
        include: {
          match: {
            include: {
              event: {
                include: {
                  venue: true,
                },
              },
            },
          },
        },
      },
      basketballAppearances: {
        where: {
          game: { event: { userId } },
        },
        include: {
          game: {
            include: {
              event: {
                include: {
                  venue: true,
                },
              },
            },
          },
        },
      },
      baseballAppearances: {
        where: {
          game: { event: { userId } },
        },
        include: {
          game: {
            include: {
              event: {
                include: {
                  venue: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!player) return null;

  // Calculate aggregate stats
  const totalStats = {
    goals: 0,
    assists: 0,
    points: 0,
    rebounds: 0,
    hits: 0,
    homeRuns: 0,
    rbis: 0,
    appearances: 0,
  };

  // Process soccer appearances
  for (const app of player.soccerAppearances) {
    totalStats.goals += app.goals || 0;
    totalStats.assists += app.assists || 0;
    totalStats.appearances++;
  }

  // Process basketball appearances
  for (const app of player.basketballAppearances) {
    totalStats.points += app.points || 0;
    totalStats.rebounds += app.rebounds || 0;
    totalStats.appearances++;
  }

  // Process baseball appearances
  for (const app of player.baseballAppearances) {
    totalStats.hits += app.hits || 0;
    totalStats.homeRuns += app.homeRuns || 0;
    totalStats.rbis += app.rbis || 0;
    totalStats.appearances++;
  }

  // Combine all appearances with normalized event data
  const appearances = [
    ...player.soccerAppearances.map((app) => ({
      id: app.id,
      goals: app.goals,
      assists: app.assists,
      points: null,
      rebounds: null,
      hits: null,
      homeRuns: null,
      event: {
        id: app.match.event.id,
        date: app.match.event.date.toISOString(),
        type: 'SOCCER',
        venue: app.match.event.venue,
        soccerMatch: {
          homeTeam: app.match.homeTeam,
          awayTeam: app.match.awayTeam,
          homeScore: app.match.homeScore,
          awayScore: app.match.awayScore,
        },
        basketballGame: null,
        baseballGame: null,
      },
    })),
    ...player.basketballAppearances.map((app) => ({
      id: app.id,
      goals: null,
      assists: app.assists,
      points: app.points,
      rebounds: app.rebounds,
      hits: null,
      homeRuns: null,
      event: {
        id: app.game.event.id,
        date: app.game.event.date.toISOString(),
        type: 'BASKETBALL',
        venue: app.game.event.venue,
        soccerMatch: null,
        basketballGame: {
          homeTeam: app.game.homeTeam,
          awayTeam: app.game.awayTeam,
          homeScore: app.game.homeScore,
          awayScore: app.game.awayScore,
        },
        baseballGame: null,
      },
    })),
    ...player.baseballAppearances.map((app) => ({
      id: app.id,
      goals: null,
      assists: null,
      points: null,
      rebounds: null,
      hits: app.hits,
      homeRuns: app.homeRuns,
      event: {
        id: app.game.event.id,
        date: app.game.event.date.toISOString(),
        type: 'BASEBALL',
        venue: app.game.event.venue,
        soccerMatch: null,
        basketballGame: null,
        baseballGame: {
          homeTeam: app.game.homeTeam,
          awayTeam: app.game.awayTeam,
          homeScore: app.game.homeScore,
          awayScore: app.game.awayScore,
        },
      },
    })),
  ].sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());

  return {
    player: {
      id: player.id,
      name: player.name,
      team: player.team,
      nationality: player.nationality,
      position: null, // Position is stored in appearances, not player
      externalId: player.externalId,
    },
    totalStats,
    appearances,
  };
}

// Get team stats (win/loss record)
export async function getTeamStats(
  userId: string,
  year?: number
): Promise<TeamStatsEntry[]> {
  const whereClause: Record<string, unknown> = {
    userId,
    type: { in: ['SOCCER', 'BASKETBALL', 'BASEBALL'] },
  };

  if (year) {
    whereClause.date = {
      gte: new Date(`${year}-01-01`),
      lt: new Date(`${year + 1}-01-01`),
    };
  }

  // Get all events with match data
  const events = await prisma.event.findMany({
    where: whereClause,
    include: {
      soccerMatch: true,
      basketballGame: true,
      baseballGame: true,
    },
  });

  // Aggregate by team
  const teamStatsMap = new Map<string, TeamStatsEntry>();

  for (const event of events) {
    const match = event.soccerMatch || event.basketballGame || event.baseballGame;
    if (!match) continue;

    const homeTeam = match.homeTeam;
    const awayTeam = match.awayTeam;
    const homeScore = match.homeScore || 0;
    const awayScore = match.awayScore || 0;

    // Process home team
    if (!teamStatsMap.has(homeTeam)) {
      teamStatsMap.set(homeTeam, {
        teamName: homeTeam,
        wins: 0,
        losses: 0,
        draws: 0,
        totalGames: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      });
    }
    const homeStats = teamStatsMap.get(homeTeam)!;
    homeStats.totalGames++;
    homeStats.goalsFor += homeScore;
    homeStats.goalsAgainst += awayScore;
    if (event.type === 'BASKETBALL') {
      homeStats.pointsFor = (homeStats.pointsFor || 0) + homeScore;
      homeStats.pointsAgainst = (homeStats.pointsAgainst || 0) + awayScore;
    }
    if (homeScore > awayScore) homeStats.wins++;
    else if (homeScore < awayScore) homeStats.losses++;
    else homeStats.draws++;

    // Process away team
    if (!teamStatsMap.has(awayTeam)) {
      teamStatsMap.set(awayTeam, {
        teamName: awayTeam,
        wins: 0,
        losses: 0,
        draws: 0,
        totalGames: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      });
    }
    const awayStats = teamStatsMap.get(awayTeam)!;
    awayStats.totalGames++;
    awayStats.goalsFor += awayScore;
    awayStats.goalsAgainst += homeScore;
    if (event.type === 'BASKETBALL') {
      awayStats.pointsFor = (awayStats.pointsFor || 0) + awayScore;
      awayStats.pointsAgainst = (awayStats.pointsAgainst || 0) + homeScore;
    }
    if (awayScore > homeScore) awayStats.wins++;
    else if (awayScore < homeScore) awayStats.losses++;
    else awayStats.draws++;
  }

  return Array.from(teamStatsMap.values()).sort(
    (a, b) => b.totalGames - a.totalGames
  );
}

// Get venue stats
export async function getVenueStats(
  userId: string,
  year?: number
): Promise<VenueStatsEntry[]> {
  const whereClause: Record<string, unknown> = {
    userId,
  };

  if (year) {
    whereClause.date = {
      gte: new Date(`${year}-01-01`),
      lt: new Date(`${year + 1}-01-01`),
    };
  }

  const events = await prisma.event.findMany({
    where: whereClause,
    include: {
      venue: true,
      soccerMatch: true,
      basketballGame: true,
      baseballGame: true,
    },
  });

  // Aggregate by venue
  const venueStatsMap = new Map<string, VenueStatsEntry>();

  for (const event of events) {
    if (!event.venue) continue;

    const venueId = event.venueId!;
    if (!venueStatsMap.has(venueId)) {
      venueStatsMap.set(venueId, {
        venueId,
        venueName: event.venue.name,
        city: event.venue.city,
        country: event.venue.country,
        totalEvents: 0,
        eventTypes: [],
        wins: 0,
        losses: 0,
        draws: 0,
      });
    }

    const stats = venueStatsMap.get(venueId)!;
    stats.totalEvents++;

    // Track event types
    const typeEntry = stats.eventTypes.find((t) => t.type === event.type);
    if (typeEntry) {
      typeEntry.count++;
    } else {
      stats.eventTypes.push({ type: event.type, count: 1 });
    }

    // Track win/loss for sports events
    const match = event.soccerMatch || event.basketballGame || event.baseballGame;
    if (match) {
      const homeScore = match.homeScore || 0;
      const awayScore = match.awayScore || 0;
      // Assuming user is a "home" fan when at the venue
      if (homeScore > awayScore) stats.wins++;
      else if (homeScore < awayScore) stats.losses++;
      else stats.draws++;
    }
  }

  return Array.from(venueStatsMap.values()).sort(
    (a, b) => b.totalEvents - a.totalEvents
  );
}

// Get artist stats for concerts
export async function getArtistStats(
  userId: string,
  year?: number
): Promise<ArtistStatsEntry[]> {
  const whereClause: Record<string, unknown> = {
    userId,
    type: 'CONCERT',
  };

  if (year) {
    whereClause.date = {
      gte: new Date(`${year}-01-01`),
      lt: new Date(`${year + 1}-01-01`),
    };
  }

  const events = await prisma.event.findMany({
    where: whereClause,
    include: {
      concert: {
        include: {
          artist: true,
          setlist: true,
        },
      },
    },
  });

  // Aggregate by artist
  const artistStatsMap = new Map<string, {
    artistId: string;
    artistName: string;
    timesSeen: number;
    songs: Map<string, number>;
  }>();

  for (const event of events) {
    if (!event.concert?.artist) continue;

    const artistId = event.concert.artistId;
    if (!artistStatsMap.has(artistId)) {
      artistStatsMap.set(artistId, {
        artistId,
        artistName: event.concert.artist.name,
        timesSeen: 0,
        songs: new Map(),
      });
    }

    const stats = artistStatsMap.get(artistId)!;
    stats.timesSeen++;

    // Track songs
    for (const song of event.concert.setlist || []) {
      const current = stats.songs.get(song.songName) || 0;
      stats.songs.set(song.songName, current + 1);
    }
  }

  return Array.from(artistStatsMap.values()).map((stats) => {
    const topSongs = Array.from(stats.songs.entries())
      .map(([songName, timesPlayed]) => ({ songName, timesPlayed }))
      .sort((a, b) => b.timesPlayed - a.timesPlayed)
      .slice(0, 10);

    return {
      artistId: stats.artistId,
      artistName: stats.artistName,
      timesSeen: stats.timesSeen,
      totalSongsHeard: Array.from(stats.songs.values()).reduce((a, b) => a + b, 0),
      topSongs,
    };
  }).sort((a, b) => b.timesSeen - a.timesSeen);
}

// Get overview stats for dashboard
export async function getOverviewStats(userId: string, year?: number) {
  const whereClause: Record<string, unknown> = { userId };

  if (year) {
    whereClause.date = {
      gte: new Date(`${year}-01-01`),
      lt: new Date(`${year + 1}-01-01`),
    };
  }

  // Get counts by type
  const eventsByType = await prisma.event.groupBy({
    by: ['type'],
    where: whereClause,
    _count: { id: true },
  });

  // Get total unique venues
  const uniqueVenues = await prisma.event.findMany({
    where: whereClause,
    select: { venueId: true },
    distinct: ['venueId'],
  });

  // Get total unique players witnessed from all sports
  const [soccerPlayers, basketballPlayers, baseballPlayers] = await Promise.all([
    prisma.soccerAppearance.findMany({
      where: { match: { event: whereClause } },
      select: { playerId: true },
      distinct: ['playerId'],
    }),
    prisma.basketballAppearance.findMany({
      where: { game: { event: whereClause } },
      select: { playerId: true },
      distinct: ['playerId'],
    }),
    prisma.baseballAppearance.findMany({
      where: { game: { event: whereClause } },
      select: { playerId: true },
      distinct: ['playerId'],
    }),
  ]);

  // Get aggregate stats
  const [soccerStats, basketballStats, baseballStats] = await Promise.all([
    prisma.soccerAppearance.aggregate({
      where: { match: { event: whereClause } },
      _sum: { goals: true, assists: true },
    }),
    prisma.basketballAppearance.aggregate({
      where: { game: { event: whereClause } },
      _sum: { points: true, rebounds: true },
    }),
    prisma.baseballAppearance.aggregate({
      where: { game: { event: whereClause } },
      _sum: { hits: true, homeRuns: true },
    }),
  ]);

  const uniquePlayersCount = new Set([
    ...soccerPlayers.map((p) => p.playerId),
    ...basketballPlayers.map((p) => p.playerId),
    ...baseballPlayers.map((p) => p.playerId),
  ]).size;

  return {
    totalEvents: eventsByType.reduce((sum, e) => sum + e._count.id, 0),
    eventsByType: Object.fromEntries(
      eventsByType.map((e) => [e.type.toLowerCase(), e._count.id])
    ),
    uniqueVenues: uniqueVenues.filter((v) => v.venueId).length,
    uniquePlayersWitnessed: uniquePlayersCount,
    aggregateStats: {
      goalsWitnessed: soccerStats._sum.goals || 0,
      assistsWitnessed: soccerStats._sum.assists || 0,
      pointsWitnessed: basketballStats._sum.points || 0,
      reboundsWitnessed: basketballStats._sum.rebounds || 0,
      hitsWitnessed: baseballStats._sum.hits || 0,
      homeRunsWitnessed: baseballStats._sum.homeRuns || 0,
    },
  };
}
