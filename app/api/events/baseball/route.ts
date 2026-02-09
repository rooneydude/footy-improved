// Baseball Event Creation API
// 🔍 API Monitor Agent: Full validation, proper transaction handling
// ✅ Code Quality Agent: Zod validation, proper error responses

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { normalizeTeamName } from '@/lib/utils/team-names';

// Input validation schema
const baseballEventSchema = z.object({
  date: z.string().transform((s) => new Date(s)),
  venueName: z.string().min(1, 'Venue name is required'),
  venueCity: z.string().min(1, 'City is required'),
  venueCountry: z.string().min(1, 'Country is required'),
  homeTeam: z.string().min(1, 'Home team is required'),
  awayTeam: z.string().min(1, 'Away team is required'),
  homeScore: z.number().min(0).default(0),
  awayScore: z.number().min(0).default(0),
  competition: z.string().optional(),
  externalGameId: z.union([z.string(), z.number()]).transform(v => v?.toString()).optional(),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  companions: z.array(z.string()).default([]),
  appearances: z.array(z.object({
    playerName: z.string().min(1),
    externalId: z.union([z.string(), z.number()]).transform(v => v?.toString()).optional(),
    team: z.string().optional(),
    position: z.string().optional(),
    homeRuns: z.number().min(0).default(0),
    hits: z.number().min(0).default(0),
    rbis: z.number().min(0).default(0),
    runs: z.number().min(0).default(0),
    atBats: z.number().min(0).default(0),
    strikeOuts: z.number().min(0).default(0),
    walks: z.number().min(0).default(0),
  })).default([]),
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
    const parseResult = baseballEventSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const validated = parseResult.data;
    
    // Normalize team names to handle API differences
    const normalizedHomeTeam = normalizeTeamName(validated.homeTeam);
    const normalizedAwayTeam = normalizeTeamName(validated.awayTeam);

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

      // Create event
      const newEvent = await tx.event.create({
        data: {
          type: 'BASEBALL',
          date: validated.date,
          venueId: venue.id,
          userId: session.user.id,
          notes: validated.notes,
          rating: validated.rating,
          companions: validated.companions,
          baseballGame: {
            create: {
              homeTeam: normalizedHomeTeam,
              awayTeam: normalizedAwayTeam,
              homeScore: validated.homeScore,
              awayScore: validated.awayScore,
              competition: validated.competition,
              externalGameId: validated.externalGameId,
            },
          },
        },
        include: {
          venue: true,
          baseballGame: true,
        },
      });

      // Create player appearances
      if (validated.appearances.length > 0 && newEvent.baseballGame) {
        for (const app of validated.appearances) {
          // Find or create player
          let player = await tx.player.findFirst({
            where: {
              name: app.playerName,
              sport: 'BASEBALL',
            },
          });

          if (!player) {
            player = await tx.player.create({
              data: {
                name: app.playerName,
                sport: 'BASEBALL',
                team: app.team,
                externalId: app.externalId,
              },
            });
          }

          // Create appearance
          await tx.baseballAppearance.create({
            data: {
              gameId: newEvent.baseballGame.id,
              playerId: player.id,
              position: app.position,
              homeRuns: app.homeRuns,
              hits: app.hits,
              rbis: app.rbis,
              runs: app.runs,
              atBats: app.atBats,
              strikeOuts: app.strikeOuts,
              walks: app.walks,
            },
          });
        }
      }

      // Fetch complete event with all relations
      return tx.event.findUnique({
        where: { id: newEvent.id },
        include: {
          venue: true,
          baseballGame: {
            include: {
              appearances: {
                include: { player: true },
              },
            },
          },
        },
      });
    }, {
      timeout: 60000, // 60 second timeout for many players
      maxWait: 10000, // Max 10 seconds to acquire connection
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    // 🧠 Error Memory Agent: Log error for tracking
    console.error('Baseball event creation error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to create baseball event' },
      { status: 500 }
    );
  }
}
