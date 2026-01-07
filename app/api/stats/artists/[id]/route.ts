// Artist Profile API
// 🔍 API Monitor Agent: Returns artist profile with concert history
// ✅ Code Quality Agent: Proper error handling, type safety

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get artist with all concerts
    const artist = await prisma.artist.findUnique({
      where: { id },
      include: {
        concerts: {
          where: {
            event: { userId: session.user.id },
          },
          include: {
            event: {
              include: {
                venue: true,
              },
            },
            setlist: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { event: { date: 'desc' } },
        },
      },
    });

    if (!artist) {
      return NextResponse.json(
        { success: false, error: 'Artist not found' },
        { status: 404 }
      );
    }

    // Calculate aggregate stats
    const songCounts = new Map<string, number>();
    let totalSongs = 0;

    for (const concert of artist.concerts) {
      for (const song of concert.setlist) {
        totalSongs++;
        const current = songCounts.get(song.songName) || 0;
        songCounts.set(song.songName, current + 1);
      }
    }

    const topSongs = Array.from(songCounts.entries())
      .map(([songName, count]) => ({ songName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return NextResponse.json({
      success: true,
      data: {
        artist,
        totalStats: {
          concerts: artist.concerts.length,
          totalSongsHeard: totalSongs,
          uniqueSongs: songCounts.size,
        },
        topSongs,
        concerts: artist.concerts,
      },
    });
  } catch (error) {
    console.error('Artist profile API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch artist profile',
      },
      { status: 500 }
    );
  }
}

