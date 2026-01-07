// Tennis Event Creation API
// 🔍 API Monitor Agent: Full validation, proper transaction handling
// ✅ Code Quality Agent: Zod validation, proper error responses

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Input validation schema
const tennisEventSchema = z.object({
  date: z.string().transform((s) => new Date(s)),
  venueName: z.string().min(1, 'Venue name is required'),
  venueCity: z.string().min(1, 'City is required'),
  venueCountry: z.string().min(1, 'Country is required'),
  player1Name: z.string().min(1, 'Player 1 is required'),
  player2Name: z.string().min(1, 'Player 2 is required'),
  winnerName: z.string().optional(),
  score: z.string().min(1, 'Score is required'),
  tournament: z.string().optional(),
  round: z.string().optional(),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  companions: z.array(z.string()).default([]),
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parseResult = tennisEventSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const validated = parseResult.data;

    // Create event with transaction
    const event = await prisma.$transaction(async (tx) => {
      // Find or create venue
      let venue = await tx.venue.findFirst({
        where: {
          name: validated.venueName,
          city: validated.venueCity,
          country: validated.venueCountry,
        },
      });

      if (!venue) {
        venue = await tx.venue.create({
          data: {
            name: validated.venueName,
            city: validated.venueCity,
            country: validated.venueCountry,
            type: 'STADIUM',
          },
        });
      }

      // Find or create players
      let player1 = await tx.player.findFirst({
        where: { name: validated.player1Name, sport: 'TENNIS' },
      });
      if (!player1) {
        player1 = await tx.player.create({
          data: { name: validated.player1Name, sport: 'TENNIS' },
        });
      }

      let player2 = await tx.player.findFirst({
        where: { name: validated.player2Name, sport: 'TENNIS' },
      });
      if (!player2) {
        player2 = await tx.player.create({
          data: { name: validated.player2Name, sport: 'TENNIS' },
        });
      }

      // Find winner if specified
      let winnerId: string | undefined;
      if (validated.winnerName) {
        if (validated.winnerName === validated.player1Name) {
          winnerId = player1.id;
        } else if (validated.winnerName === validated.player2Name) {
          winnerId = player2.id;
        }
      }

      // Create event
      const newEvent = await tx.event.create({
        data: {
          type: 'TENNIS',
          date: validated.date,
          venueId: venue.id,
          userId: session.user.id,
          notes: validated.notes,
          rating: validated.rating,
          companions: validated.companions,
          tennisMatch: {
            create: {
              player1Id: player1.id,
              player2Id: player2.id,
              winnerId,
              score: validated.score,
              tournament: validated.tournament,
              round: validated.round,
            },
          },
        },
        include: {
          venue: true,
          tennisMatch: true,
        },
      });

      // Create player appearances
      if (newEvent.tennisMatch) {
        // Calculate sets won from score (e.g., "6-4, 3-6, 7-5")
        const sets = validated.score.split(',').map((s) => s.trim());
        let p1SetsWon = 0;
        let p2SetsWon = 0;
        
        for (const set of sets) {
          const [p1, p2] = set.split('-').map(Number);
          if (!isNaN(p1) && !isNaN(p2)) {
            if (p1 > p2) p1SetsWon++;
            else if (p2 > p1) p2SetsWon++;
          }
        }

        await tx.tennisAppearance.createMany({
          data: [
            {
              matchId: newEvent.tennisMatch.id,
              playerId: player1.id,
              won: winnerId === player1.id,
              setsWon: p1SetsWon,
            },
            {
              matchId: newEvent.tennisMatch.id,
              playerId: player2.id,
              won: winnerId === player2.id,
              setsWon: p2SetsWon,
            },
          ],
        });
      }

      // Fetch complete event with all relations
      return tx.event.findUnique({
        where: { id: newEvent.id },
        include: {
          venue: true,
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
        },
      });
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    // 🧠 Error Memory Agent: Log error for tracking
    console.error('Tennis event creation error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to create tennis event' },
      { status: 500 }
    );
  }
}
