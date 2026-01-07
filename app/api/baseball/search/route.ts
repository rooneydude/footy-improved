// Baseball Game Search API Proxy
// 🔍 API Monitor Agent: Rate limiting proxy for MLB Stats API
// ✅ Code Quality Agent: Proper error handling

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { searchGames } from '@/lib/api/mlb';

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
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { success: false, error: 'dateFrom and dateTo parameters are required' },
        { status: 400 }
      );
    }

    const games = await searchGames(dateFrom, dateTo, teamName);

    return NextResponse.json({
      success: true,
      data: games,
    });
  } catch (error) {
    console.error('Baseball search error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to search games' 
      },
      { status: 500 }
    );
  }
}
