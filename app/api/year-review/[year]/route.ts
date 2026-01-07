// Year in Review API
// 🔍 API Monitor Agent: Generate year-in-review statistics
// ✅ Code Quality Agent: Comprehensive aggregations

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { year: yearStr } = await params;
    const year = parseInt(yearStr, 10);
    
    if (isNaN(year) || year < 1900 || year > 2100) {
      return NextResponse.json(
        { success: false, error: 'Invalid year' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year + 1}-01-01`);

    // Fetch year's data
    const [
      events,
      eventsByType,
      venueStats,
      achievements,
    ] = await Promise.all([
      // All events for the year
      prisma.event.findMany({
        where: {
          userId,
          date: { gte: startDate, lt: endDate },
        },
        include: {
          venue: true,
          soccerMatch: true,
          basketballGame: true,
          baseballGame: true,
          tennisMatch: { include: { player1: true, player2: true } },
          concert: { include: { artist: true } },
        },
        orderBy: { date: 'desc' },
      }),

      // Events by type
      prisma.event.groupBy({
        by: ['type'],
        where: {
          userId,
          date: { gte: startDate, lt: endDate },
        },
        _count: { type: true },
      }),

      // Top venues
      prisma.event.groupBy({
        by: ['venueId'],
        where: {
          userId,
          date: { gte: startDate, lt: endDate },
        },
        _count: { venueId: true },
        orderBy: { _count: { venueId: 'desc' } },
        take: 5,
      }),

      // Achievements unlocked this year
      prisma.userAchievement.findMany({
        where: {
          userId,
          unlockedAt: { gte: startDate, lt: endDate },
        },
        include: { achievement: true },
      }),
    ]);

    // Get venue details for top venues
    const topVenueIds = venueStats.map((v) => v.venueId);
    const venues = await prisma.venue.findMany({
      where: { id: { in: topVenueIds } },
    });

    const topVenues = venueStats.map((stat) => ({
      venue: venues.find((v) => v.id === stat.venueId),
      count: stat._count.venueId,
    }));

    // Calculate monthly breakdown
    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      count: events.filter((e) => new Date(e.date).getMonth() === i).length,
    }));

    // Format events by type
    const eventsByTypeMap: Record<string, number> = {
      SOCCER: 0,
      BASKETBALL: 0,
      BASEBALL: 0,
      TENNIS: 0,
      CONCERT: 0,
    };
    for (const item of eventsByType) {
      eventsByTypeMap[item.type] = item._count.type;
    }

    // Get unique countries visited
    const countriesVisited = [...new Set(events.map((e) => e.venue.country))];

    // Get top artists (for concerts)
    const artistCounts: Record<string, { name: string; count: number }> = {};
    for (const event of events) {
      if (event.concert?.artist) {
        const artistName = event.concert.artist.name;
        if (!artistCounts[artistName]) {
          artistCounts[artistName] = { name: artistName, count: 0 };
        }
        artistCounts[artistName].count++;
      }
    }
    const topArtists = Object.values(artistCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        year,
        totalEvents: events.length,
        eventsByType: eventsByTypeMap,
        topVenues,
        topArtists,
        monthlyBreakdown,
        countriesVisited,
        achievementsUnlocked: achievements.length,
        achievements: achievements.map((ua) => ({
          id: ua.achievement.id,
          name: ua.achievement.name,
          icon: ua.achievement.icon,
          unlockedAt: ua.unlockedAt,
        })),
        highlights: events.slice(0, 10), // Top 10 events
      },
    });
  } catch (error) {
    console.error('Year review API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to generate year review' },
      { status: 500 }
    );
  }
}
