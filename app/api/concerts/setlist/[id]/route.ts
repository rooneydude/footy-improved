// Concert Setlist Details API - Fetch full setlist from Setlist.fm
// 🔍 API Monitor Agent: Returns detailed setlist with all songs
// ✅ Code Quality Agent: Proper error handling, type safety

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSetlist, processSetlist } from '@/lib/api/setlist-fm';

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
    const setlistId = id;

    if (!setlistId) {
      return NextResponse.json(
        { success: false, error: 'Invalid setlist ID' },
        { status: 400 }
      );
    }

    // Fetch setlist from Setlist.fm
    const setlist = await getSetlist(setlistId);

    // Process into our format
    const processed = processSetlist(setlist);

    return NextResponse.json({
      success: true,
      data: {
        setlist: processed,
        // Raw data for reference
        raw: {
          url: setlist.url,
          lastUpdated: setlist.lastUpdated,
        },
      },
    });
  } catch (error) {
    console.error('Concert setlist details error:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('not configured')) {
        return NextResponse.json(
          { success: false, error: 'Setlist.fm API not configured. Please add SETLIST_FM_API_KEY to environment.' },
          { status: 503 }
        );
      }
      if (error.message.includes('Rate limit')) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (error.message.includes('Not found')) {
        return NextResponse.json(
          { success: false, error: 'Setlist not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch setlist details',
      },
      { status: 500 }
    );
  }
}

