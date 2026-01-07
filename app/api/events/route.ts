// Events API Route - GET all events for user
// 🔍 API Monitor Agent: Proper auth, validation, error handling
// ✅ Code Quality Agent: Comprehensive includes, proper typing

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Query params validation schema
const querySchema = z.object({
  type: z.enum(['SOCCER', 'BASKETBALL', 'BASEBALL', 'TENNIS', 'CONCERT']).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  year: z.coerce.number().min(1900).max(2100).optional(),
  sortBy: z.enum(['date', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

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

    // Parse query params
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parseResult = querySchema.safeParse(searchParams);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { type, limit, offset, year, sortBy, sortOrder } = parseResult.data;

    // Build where clause
    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (type) {
      where.type = type;
    }

    if (year) {
      where.date = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      };
    }

    // Fetch events with full relations
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          venue: true,
          media: true,
          soccerMatch: {
            include: {
              appearances: {
                include: { player: true },
              },
            },
          },
          basketballGame: {
            include: {
              appearances: {
                include: { player: true },
              },
            },
          },
          baseballGame: {
            include: {
              appearances: {
                include: { player: true },
              },
            },
          },
          tennisMatch: {
            include: {
              player1: true,
              player2: true,
              winner: true,
              appearances: {
                include: { player: true },
              },
            },
          },
          concert: {
            include: {
              artist: true,
              setlist: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: events,
        total,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    // 🧠 Error Memory Agent: Log error for tracking
    console.error('Events API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
