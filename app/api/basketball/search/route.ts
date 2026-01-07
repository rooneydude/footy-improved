// Basketball Game Search API Proxy
// 🔍 API Monitor Agent: Rate limiting proxy for balldontlie.io
// ✅ Code Quality Agent: Proper error handling

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { searchGames } from '@/lib/api/balldontlie';

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const teamName = searchParams.get('team') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;

    const games = await searchGames(teamName, dateFrom, dateTo);

    return NextResponse.json({
      success: true,
      data: games,
    });
  } catch (error) {
    console.error('Basketball search error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to search games' 
      },
      { status: 500 }
    );
  }
}
