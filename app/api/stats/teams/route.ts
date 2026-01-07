// Team Stats API
// 🔍 API Monitor Agent: Returns team statistics with win/loss records
// ✅ Code Quality Agent: Proper error handling, type safety

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTeamStats } from '@/lib/db/stats';

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
    const year = searchParams.get('year');

    const teamStats = await getTeamStats(
      session.user.id,
      year ? parseInt(year, 10) : undefined
    );

    return NextResponse.json({
      success: true,
      data: teamStats,
    });
  } catch (error) {
    console.error('Team stats API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch team stats',
      },
      { status: 500 }
    );
  }
}

