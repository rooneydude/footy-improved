// Event Detail API Route - GET, PUT, DELETE individual event
// 🔍 API Monitor Agent: Proper auth, validation, error handling
// ✅ Code Quality Agent: Secure ownership check before modifications

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for event updates (all fields optional for partial update)
const updateEventSchema = z.object({
  date: z.string().transform((s) => new Date(s)).optional(),
  venueName: z.string().min(1).optional(),
  venueCity: z.string().optional(),
  notes: z.string().optional().nullable(),
  rating: z.number().min(1).max(5).optional().nullable(),
  companions: z.array(z.string()).optional(),
  // Sport-specific fields
  homeScore: z.number().min(0).optional(),
  awayScore: z.number().min(0).optional(),
  score: z.string().optional(), // Tennis
  tourName: z.string().optional(), // Concert
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch single event with all relations
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

    const event = await prisma.event.findUnique({
      where: { id },
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
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Security: Check ownership
    if (event.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Event GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT - Update event details
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // First, fetch the event to check ownership and get current data
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        venue: true,
        soccerMatch: true,
        basketballGame: true,
        baseballGame: true,
        tennisMatch: true,
        concert: true,
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Security: Check ownership
    if (existingEvent.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parseResult = updateEventSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const validated = parseResult.data;

    // Update event with transaction
    const updatedEvent = await prisma.$transaction(async (tx) => {
      // Handle venue update if venue fields provided
      let venueId = existingEvent.venueId;
      if (validated.venueName) {
        // Find or create venue
        let venue = await tx.venue.findFirst({
          where: {
            name: validated.venueName,
            ...(validated.venueCity && { city: validated.venueCity }),
          },
        });

        if (!venue) {
          venue = await tx.venue.create({
            data: {
              name: validated.venueName,
              city: validated.venueCity || 'Unknown',
              country: 'Unknown',
              type: 'STADIUM',
            },
          });
        }
        venueId = venue.id;
      }

      // Update the base event
      const eventUpdate: Record<string, unknown> = {};
      if (validated.date) eventUpdate.date = validated.date;
      if (venueId !== existingEvent.venueId) eventUpdate.venueId = venueId;
      if (validated.notes !== undefined) eventUpdate.notes = validated.notes;
      if (validated.rating !== undefined) eventUpdate.rating = validated.rating;
      if (validated.companions) eventUpdate.companions = validated.companions;

      // Only update event if there are changes
      if (Object.keys(eventUpdate).length > 0) {
        await tx.event.update({
          where: { id },
          data: eventUpdate,
        });
      }

      // Update sport-specific data based on event type
      if (existingEvent.type === 'SOCCER' && existingEvent.soccerMatch) {
        const soccerUpdate: Record<string, unknown> = {};
        if (validated.homeScore !== undefined) soccerUpdate.homeScore = validated.homeScore;
        if (validated.awayScore !== undefined) soccerUpdate.awayScore = validated.awayScore;
        if (Object.keys(soccerUpdate).length > 0) {
          await tx.soccerMatch.update({
            where: { id: existingEvent.soccerMatch.id },
            data: soccerUpdate,
          });
        }
      }

      if (existingEvent.type === 'BASKETBALL' && existingEvent.basketballGame) {
        const basketballUpdate: Record<string, unknown> = {};
        if (validated.homeScore !== undefined) basketballUpdate.homeScore = validated.homeScore;
        if (validated.awayScore !== undefined) basketballUpdate.awayScore = validated.awayScore;
        if (Object.keys(basketballUpdate).length > 0) {
          await tx.basketballGame.update({
            where: { id: existingEvent.basketballGame.id },
            data: basketballUpdate,
          });
        }
      }

      if (existingEvent.type === 'BASEBALL' && existingEvent.baseballGame) {
        const baseballUpdate: Record<string, unknown> = {};
        if (validated.homeScore !== undefined) baseballUpdate.homeScore = validated.homeScore;
        if (validated.awayScore !== undefined) baseballUpdate.awayScore = validated.awayScore;
        if (Object.keys(baseballUpdate).length > 0) {
          await tx.baseballGame.update({
            where: { id: existingEvent.baseballGame.id },
            data: baseballUpdate,
          });
        }
      }

      if (existingEvent.type === 'TENNIS' && existingEvent.tennisMatch) {
        const tennisUpdate: Record<string, unknown> = {};
        if (validated.score !== undefined) tennisUpdate.score = validated.score;
        if (Object.keys(tennisUpdate).length > 0) {
          await tx.tennisMatch.update({
            where: { id: existingEvent.tennisMatch.id },
            data: tennisUpdate,
          });
        }
      }

      if (existingEvent.type === 'CONCERT' && existingEvent.concert) {
        const concertUpdate: Record<string, unknown> = {};
        if (validated.tourName !== undefined) concertUpdate.tourName = validated.tourName;
        if (Object.keys(concertUpdate).length > 0) {
          await tx.concert.update({
            where: { id: existingEvent.concert.id },
            data: concertUpdate,
          });
        }
      }

      // Fetch and return the updated event with all relations
      return tx.event.findUnique({
        where: { id },
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
      });
    });

    return NextResponse.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    console.error('Event PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE - Remove event and all related data
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // First, fetch the event to check ownership
    const event = await prisma.event.findUnique({
      where: { id },
      select: { userId: true, type: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Security: Check ownership
    if (event.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete the event (cascading will handle related records due to Prisma relations)
    // Note: The onDelete: Cascade in schema.prisma handles related records
    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Event DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
