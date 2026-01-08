// Baseball Game Details API - Fetch box score with player stats
// 🔍 API Monitor Agent: Returns detailed game data with batting/pitching stats
// ✅ Code Quality Agent: Proper error handling, type safety

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGameDetails, getGameBoxScore, processBoxScore } from '@/lib/api/mlb';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const gameId = parseInt(id, 10);

    if (isNaN(gameId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid game ID' },
        { status: 400 }
      );
    }

    // Fetch game details and box score in parallel
    const [gameDetails, boxScore] = await Promise.all([
      getGameDetails(gameId),
      getGameBoxScore(gameId),
    ]);

    // Process box score into player appearances
    const { homeStats, awayStats } = processBoxScore(boxScore);

    // Combine all players with team designation (KEY STATS ONLY: HR & RBI)
    const players = [
      ...homeStats.map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        team: 'home' as const,
        homeRuns: p.homeRuns,
        rbis: p.rbis,
      })),
      ...awayStats.map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        team: 'away' as const,
        homeRuns: p.homeRuns,
        rbis: p.rbis,
      })),
    ];

    return NextResponse.json({
      success: true,
      data: {
        game: {
          id: gameDetails.gamePk,
          date: gameDetails.gameDate,
          homeTeam: gameDetails.teams.home.team.name,
          awayTeam: gameDetails.teams.away.team.name,
          homeScore: gameDetails.teams.home.score,
          awayScore: gameDetails.teams.away.score,
          venue: gameDetails.venue.name,
          status: gameDetails.status.detailedState,
          gameType: gameDetails.gameType,
        },
        players,
        // Summary stats
        summary: {
          homeTotalHits: homeStats.reduce((sum, p) => sum + p.hits, 0),
          awayTotalHits: awayStats.reduce((sum, p) => sum + p.hits, 0),
          homeTotalHomeRuns: homeStats.reduce((sum, p) => sum + p.homeRuns, 0),
          awayTotalHomeRuns: awayStats.reduce((sum, p) => sum + p.homeRuns, 0),
          homePlayersCount: homeStats.length,
          awayPlayersCount: awayStats.length,
        },
      },
    });
  } catch (error) {
    console.error('Baseball game details error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch game details',
      },
      { status: 500 }
    );
  }
}

