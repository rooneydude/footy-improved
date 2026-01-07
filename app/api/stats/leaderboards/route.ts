// Player Leaderboards API
// 🔍 API Monitor Agent: Returns player leaderboards by sport and stat type
// ✅ Code Quality Agent: Proper error handling, type safety

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getSoccerLeaderboard,
  getBasketballLeaderboard,
  getBaseballLeaderboard,
  getArtistStats,
} from '@/lib/db/stats';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const sport = searchParams.get('sport') || 'soccer';
    const statType = searchParams.get('stat') || 'goals';
    const year = searchParams.get('year');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    let leaderboard;

    switch (sport) {
      case 'soccer':
        leaderboard = await getSoccerLeaderboard(
          session.user.id,
          statType as 'goals' | 'assists' | 'appearances',
          limit,
          year ? parseInt(year, 10) : undefined
        );
        break;
      case 'basketball':
        leaderboard = await getBasketballLeaderboard(
          session.user.id,
          statType as 'points' | 'rebounds' | 'assists' | 'appearances',
          limit,
          year ? parseInt(year, 10) : undefined
        );
        break;
      case 'baseball':
        leaderboard = await getBaseballLeaderboard(
          session.user.id,
          statType as 'homeRuns' | 'hits' | 'rbis' | 'appearances',
          limit,
          year ? parseInt(year, 10) : undefined
        );
        break;
      case 'concert':
        leaderboard = await getArtistStats(
          session.user.id,
          year ? parseInt(year, 10) : undefined
        );
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid sport type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error('Leaderboards API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch leaderboards',
      },
      { status: 500 }
    );
  }
}

