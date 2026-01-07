// User Achievements API
// 🔍 API Monitor Agent: Achievement progress and unlocked achievements
// ✅ Code Quality Agent: Proper error handling

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ACHIEVEMENTS } from '@/lib/achievements/definitions';

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

    // Get user's unlocked achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
        triggerEvent: {
          include: { venue: true },
        },
      },
      orderBy: { unlockedAt: 'desc' },
    });

    // Get stats for progress calculation
    const [
      totalEvents,
      eventsByType,
      uniqueVenues,
      uniqueCountries,
    ] = await Promise.all([
      prisma.event.count({ where: { userId } }),
      prisma.event.groupBy({
        by: ['type'],
        where: { userId },
        _count: { type: true },
      }),
      prisma.event.findMany({
        where: { userId },
        select: { venueId: true },
        distinct: ['venueId'],
      }),
      prisma.venue.findMany({
        where: {
          events: { some: { userId } },
        },
        select: { country: true },
        distinct: ['country'],
      }),
    ]);

    // Build progress map
    const progressMap: Record<string, { current: number; target: number }> = {};
    const eventTypeCount: Record<string, number> = {};
    for (const item of eventsByType) {
      eventTypeCount[item.type] = item._count.type;
    }

    // Calculate progress for each achievement
    for (const achievement of ACHIEVEMENTS) {
      const { criteria } = achievement;
      let current = 0;
      const target = criteria.threshold || 1;

      switch (criteria.type) {
        case 'total_events':
          current = totalEvents;
          break;
        case 'events_by_type':
          current = eventTypeCount[criteria.eventType as string] || 0;
          break;
        case 'unique_venues':
          current = uniqueVenues.length;
          break;
        case 'unique_countries':
          current = uniqueCountries.length;
          break;
        default:
          // For complex criteria, we'd need more specific queries
          current = 0;
      }

      progressMap[achievement.id] = { current, target };
    }

    // Combine all achievements with unlock status and progress
    const allAchievements = ACHIEVEMENTS.map((def) => {
      const unlocked = userAchievements.find(
        (ua) => ua.achievement.name === def.name
      );
      const progress = progressMap[def.id] || { current: 0, target: 1 };

      return {
        ...def,
        unlocked: !!unlocked,
        unlockedAt: unlocked?.unlockedAt,
        triggerEvent: unlocked?.triggerEvent,
        progress: {
          current: progress.current,
          target: progress.target,
          percentage: Math.min(100, Math.round((progress.current / progress.target) * 100)),
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        achievements: allAchievements,
        totalUnlocked: userAchievements.length,
        totalAchievements: ACHIEVEMENTS.length,
      },
    });
  } catch (error) {
    console.error('Achievements API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
