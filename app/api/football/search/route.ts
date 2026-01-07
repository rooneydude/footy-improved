// Football Match Search API Proxy
// 🔍 API Monitor Agent: Rate limiting proxy for Football-Data.org
// ✅ Code Quality Agent: Proper error handling

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { searchMatches } from '@/lib/api/football-data';

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
    const query = searchParams.get('q');
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const matches = await searchMatches(query, dateFrom, dateTo);

    return NextResponse.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    console.error('Football search error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to search matches' 
      },
      { status: 500 }
    );
  }
}
