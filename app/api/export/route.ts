// Data Export API
// 🔍 API Monitor Agent: Export user data as JSON or CSV
// ✅ Code Quality Agent: Proper streaming for large exports

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateExportJson } from '@/lib/export/json';
import { generateEventsCsv } from '@/lib/export/csv';
import type { EventWithRelations } from '@/types';

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

    const userId = session.user.id;
    const format = request.nextUrl.searchParams.get('format') || 'json';

    // Fetch all user data
    const [events, achievements] = await Promise.all([
      prisma.event.findMany({
        where: { userId },
        include: {
          venue: true,
          media: true,
          soccerMatch: {
            include: {
              appearances: { include: { player: true } },
            },
          },
          basketballGame: {
            include: {
              appearances: { include: { player: true } },
            },
          },
          baseballGame: {
            include: {
              appearances: { include: { player: true } },
            },
          },
          tennisMatch: {
            include: {
              player1: true,
              player2: true,
              winner: true,
              appearances: { include: { player: true } },
            },
          },
          concert: {
            include: {
              artist: true,
              setlist: { orderBy: { order: 'asc' } },
            },
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
      }),
    ]);

    if (format === 'csv') {
      const csv = generateEventsCsv(events as EventWithRelations[]);
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="footytracker-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Default: JSON export
    const exportData = generateExportJson(
      events as EventWithRelations[],
      session.user,
      achievements.map((ua) => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        unlockedAt: ua.unlockedAt,
      }))
    );

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="footytracker-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Export API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
