// Concert/Setlist Search API Proxy
// 🔍 API Monitor Agent: Rate limiting proxy for Setlist.fm
// ✅ Code Quality Agent: Proper error handling

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { searchSetlists, processSetlist } from '@/lib/api/setlist-fm';

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
    const artistName = searchParams.get('artist');
    const cityName = searchParams.get('city') || undefined;
    const yearStr = searchParams.get('year');
    const pageStr = searchParams.get('page');

    if (!artistName) {
      return NextResponse.json(
        { success: false, error: 'Artist name is required' },
        { status: 400 }
      );
    }

    const year = yearStr ? parseInt(yearStr, 10) : undefined;
    const page = pageStr ? parseInt(pageStr, 10) : 1;

    const result = await searchSetlists(artistName, cityName, year, page);

    // Process setlists to our format
    const processedSetlists = result.setlist.map(processSetlist);

    return NextResponse.json({
      success: true,
      data: {
        setlists: processedSetlists,
        total: result.total,
        page: result.page,
        itemsPerPage: result.itemsPerPage,
      },
    });
  } catch (error) {
    console.error('Concert search error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to search setlists' 
      },
      { status: 500 }
    );
  }
}
