// User Stats API
// 🔍 API Monitor Agent: Aggregated user statistics
// ✅ Code Quality Agent: Efficient aggregation queries

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Run all aggregation queries in parallel
    const [
      totalEvents,
      eventsByType,
      venueStats,
      soccerAppearances,
      basketballAppearances,
      baseballAppearances,
      recentEvents,
    ] = await Promise.all([
      // Total events
      prisma.event.count({ where: { userId } }),

      // Events by type
      prisma.event.groupBy({
        by: ['type'],
        where: { userId },
        _count: { type: true },
      }),

      // Venue stats
      prisma.event.findMany({
        where: { userId },
        select: {
          venue: {
            select: { id: true, name: true, city: true, country: true },
          },
        },
      }),

      // Soccer stats
      prisma.soccerAppearance.aggregate({
        where: {
          match: { event: { userId } },
        },
        _sum: { goals: true, assists: true },
      }),

      // Basketball stats
      prisma.basketballAppearance.aggregate({
        where: {
          game: { event: { userId } },
        },
        _sum: { points: true, rebounds: true, assists: true },
      }),

      // Baseball stats
      prisma.baseballAppearance.aggregate({
        where: {
          game: { event: { userId } },
        },
        _sum: { hits: true, homeRuns: true, rbis: true },
      }),

      // Recent events (last 5)
      prisma.event.findMany({
        where: { userId },
        include: {
          venue: true,
          soccerMatch: true,
          basketballGame: true,
          baseballGame: true,
          tennisMatch: { include: { player1: true, player2: true } },
          concert: { include: { artist: true } },
        },
        orderBy: { date: 'desc' },
        take: 5,
      }),
    ]);

    // Get unique players count from all sports
    const [soccerPlayers, basketballPlayers, baseballPlayers] = await Promise.all([
      prisma.soccerAppearance.findMany({
        where: { match: { event: { userId } } },
        select: { playerId: true },
        distinct: ['playerId'],
      }),
      prisma.basketballAppearance.findMany({
        where: { game: { event: { userId } } },
        select: { playerId: true },
        distinct: ['playerId'],
      }),
      prisma.baseballAppearance.findMany({
        where: { game: { event: { userId } } },
        select: { playerId: true },
        distinct: ['playerId'],
      }),
    ]);

    // Calculate unique venues
    const uniqueVenues = new Set(
      venueStats.filter((e) => e.venue).map((e) => e.venue?.id)
    ).size;

    // Format events by type
    const eventsByTypeMap: Record<string, number> = {};
    for (const item of eventsByType) {
      eventsByTypeMap[item.type.toLowerCase()] = item._count.type;
    }

    // Unique players
    const uniquePlayers = new Set([
      ...soccerPlayers.map((p) => p.playerId),
      ...basketballPlayers.map((p) => p.playerId),
      ...baseballPlayers.map((p) => p.playerId),
    ]).size;

    // Return in format expected by stats page
    // Stats are now separated by sport to avoid confusion
    return NextResponse.json({
      totalEvents,
      eventsByType: eventsByTypeMap,
      uniqueVenues,
      uniquePlayersWitnessed: uniquePlayers,
      // Sport-specific stats - never mix stats across different sports
      soccerStats: {
        goalsWitnessed: soccerAppearances._sum.goals || 0,
        assistsWitnessed: soccerAppearances._sum.assists || 0,
      },
      basketballStats: {
        pointsWitnessed: basketballAppearances._sum.points || 0,
        reboundsWitnessed: basketballAppearances._sum.rebounds || 0,
        assistsWitnessed: basketballAppearances._sum.assists || 0,
      },
      baseballStats: {
        hitsWitnessed: baseballAppearances._sum.hits || 0,
        homeRunsWitnessed: baseballAppearances._sum.homeRuns || 0,
        rbisWitnessed: baseballAppearances._sum.rbis || 0,
      },
      // Legacy aggregateStats for backwards compatibility (deprecated)
      aggregateStats: {
        goalsWitnessed: soccerAppearances._sum.goals || 0,
        assistsWitnessed: soccerAppearances._sum.assists || 0, // Now soccer-only
        pointsWitnessed: basketballAppearances._sum.points || 0,
        reboundsWitnessed: basketballAppearances._sum.rebounds || 0,
        hitsWitnessed: baseballAppearances._sum.hits || 0,
        homeRunsWitnessed: baseballAppearances._sum.homeRuns || 0,
      },
      recentEvents,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
