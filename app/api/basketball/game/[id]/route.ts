// Basketball Game Details API - Fetch full box score with player stats
// 🔍 API Monitor Agent: Returns detailed game data with player stats
// ✅ Code Quality Agent: Proper error handling, type safety

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGameDetails, getGameStats, processGameStats } from '@/lib/api/balldontlie';

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

    // Fetch game details and stats in parallel
    const [gameDetails, gameStats] = await Promise.all([
      getGameDetails(gameId),
      getGameStats(gameId),
    ]);

    // Process stats into player appearances (pass home team ID for proper sorting)
    const { homeStats, awayStats } = processGameStats(gameStats, gameDetails.home_team.id);

    // Combine all players with team designation (KEY STATS ONLY: Points)
    const players = [
      ...homeStats.map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        team: 'home' as const,
        points: p.points,
      })),
      ...awayStats.map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        team: 'away' as const,
        points: p.points,
      })),
    ];

    return NextResponse.json({
      success: true,
      data: {
        game: {
          id: gameDetails.id,
          date: gameDetails.date,
          homeTeam: gameDetails.home_team.full_name,
          awayTeam: gameDetails.visitor_team.full_name,
          homeScore: gameDetails.home_team_score,
          awayScore: gameDetails.visitor_team_score,
          status: gameDetails.status,
          season: gameDetails.season,
          postseason: gameDetails.postseason,
        },
        players,
        // Summary stats
        summary: {
          homeTotalPoints: homeStats.reduce((sum, p) => sum + p.points, 0),
          awayTotalPoints: awayStats.reduce((sum, p) => sum + p.points, 0),
          homePlayersCount: homeStats.length,
          awayPlayersCount: awayStats.length,
        },
      },
    });
  } catch (error) {
    console.error('Basketball game details error:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('Rate limit')) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch game details',
      },
      { status: 500 }
    );
  }
}

