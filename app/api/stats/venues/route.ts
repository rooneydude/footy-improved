// Venue Stats API
// 🔍 API Monitor Agent: Returns venue statistics with event breakdown
// ✅ Code Quality Agent: Proper error handling, type safety

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getVenueStats } from '@/lib/db/stats';

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

    const venueStats = await getVenueStats(
      session.user.id,
      year ? parseInt(year, 10) : undefined
    );

    return NextResponse.json({
      success: true,
      data: venueStats,
    });
  } catch (error) {
    console.error('Venue stats API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch venue stats',
      },
      { status: 500 }
    );
  }
}

