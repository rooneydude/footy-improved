// Football Match Search API Proxy
// 🔍 API Monitor Agent: Rate limiting proxy for Football-Data.org + API-Football
// ✅ Code Quality Agent: Proper error handling
// 📚 Library Research Agent: Dual API support for maximum competition coverage

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { searchMatches } from '@/lib/api/football-data';
import { 
  searchExtendedMatches, 
  isApiFootballConfigured,
  getExtendedCompetitions 
} from '@/lib/api/api-football';

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
    const source = searchParams.get('source'); // 'primary', 'extended', or 'all' (default)
    const competitions = searchParams.get('competitions')?.split(','); // specific competitions

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const allMatches: unknown[] = [];
    const sources: string[] = [];
    const errors: string[] = [];

    // Search primary source (football-data.org) - 12 major leagues
    if (source !== 'extended') {
      try {
        const primaryMatches = await searchMatches(query, dateFrom, dateTo);
        allMatches.push(...primaryMatches);
        sources.push('football-data.org');
      } catch (error) {
        errors.push(`Primary: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Search extended source (API-Football) - Europa League, Copa America, cups, etc.
    if ((source === 'extended' || source === 'all' || !source) && isApiFootballConfigured()) {
      try {
        const extendedMatches = await searchExtendedMatches(
          query, 
          dateFrom, 
          dateTo,
          competitions
        );
        allMatches.push(...extendedMatches);
        sources.push('api-football');
      } catch (error) {
        errors.push(`Extended: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Deduplicate matches by comparing teams and date
    const uniqueMatches = deduplicateMatches(allMatches);

    return NextResponse.json({
      success: true,
      data: uniqueMatches,
      meta: {
        sources,
        totalResults: uniqueMatches.length,
        errors: errors.length > 0 ? errors : undefined,
        extendedAvailable: isApiFootballConfigured(),
        extendedCompetitions: isApiFootballConfigured() ? getExtendedCompetitions() : undefined,
      },
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

// Deduplicate matches from multiple sources
function deduplicateMatches(matches: unknown[]): unknown[] {
  const seen = new Set<string>();
  const unique: unknown[] = [];

  for (const match of matches) {
    // Create a unique key based on teams and date
    const m = match as { 
      homeTeam?: { name?: string }; 
      awayTeam?: { name?: string }; 
      utcDate?: string 
    };
    const key = `${m.homeTeam?.name}-${m.awayTeam?.name}-${m.utcDate?.split('T')[0]}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(match);
    }
  }

  return unique;
}
