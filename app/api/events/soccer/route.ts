// Soccer Event Creation API
// 🔍 API Monitor Agent: Full validation, proper transaction handling
// ✅ Code Quality Agent: Zod validation, proper error responses

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { normalizeTeamName } from '@/lib/utils/team-names';
import { ensureVenueCoordinates } from '@/lib/utils/geocode';

// Input validation schema
const soccerEventSchema = z.object({
  date: z.string().transform((s) => new Date(s)),
  venueName: z.string().min(1, 'Venue name is required'),
  venueCity: z.string().optional().default(''),
  venueCountry: z.string().optional().default(''),
  homeTeam: z.string().min(1, 'Home team is required'),
  awayTeam: z.string().min(1, 'Away team is required'),
  homeScore: z.coerce.number().min(0).default(0),
  awayScore: z.coerce.number().min(0).default(0),
  competition: z.string().optional(),
  externalMatchId: z.union([z.string(), z.number()]).transform(v => v?.toString()).optional(),
  // Team logo data from API search
  homeTeamId: z.union([z.string(), z.number()]).transform(v => v?.toString()).optional(),
  awayTeamId: z.union([z.string(), z.number()]).transform(v => v?.toString()).optional(),
  homeTeamCrest: z.string().optional().nullable().transform(v => {
    if (!v || v === '') return null;
    try { new URL(v); return v; } catch { return null; }
  }),
  awayTeamCrest: z.string().optional().nullable().transform(v => {
    if (!v || v === '') return null;
    try { new URL(v); return v; } catch { return null; }
  }),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  companions: z.array(z.string()).default([]),
  appearances: z.array(z.object({
    playerName: z.string().min(1),
    externalId: z.union([z.string(), z.number()]).transform(v => v?.toString()).optional(),
    team: z.string().optional(),
    goals: z.number().min(0).default(0),
    assists: z.number().min(0).default(0),
    cleanSheet: z.boolean().default(false),
    yellowCard: z.boolean().default(false),
    redCard: z.boolean().default(false),
    minutesPlayed: z.number().min(0).max(150).optional(),
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
    const parseResult = soccerEventSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const validated = parseResult.data;
    
    // Normalize team names to handle API differences (e.g. "Manchester United FC" vs "Manchester United")
    const normalizedHomeTeam = normalizeTeamName(validated.homeTeam);
    const normalizedAwayTeam = normalizeTeamName(validated.awayTeam);

    // Create event with transaction
    const event = await prisma.$transaction(async (tx) => {
      // Find or create venue
      let venue = await tx.venue.findFirst({
        where: {
          name: validated.venueName,
          ...(validated.venueCity && { city: validated.venueCity }),
          ...(validated.venueCountry && { country: validated.venueCountry }),
        },
      });

      if (!venue) {
        venue = await tx.venue.create({
          data: {
            name: validated.venueName,
            city: validated.venueCity || 'Unknown',
            country: validated.venueCountry || 'Unknown',
            type: 'STADIUM',
          },
        });
      }

      // Create or update home team with logo
      if (normalizedHomeTeam) {
        const existingHomeTeam = await tx.team.findFirst({
          where: { name: normalizedHomeTeam, sport: 'SOCCER' },
        });
        
        if (!existingHomeTeam) {
          await tx.team.create({
            data: {
              name: normalizedHomeTeam,
              sport: 'SOCCER',
              externalId: validated.homeTeamId,
              logoUrl: validated.homeTeamCrest,
              league: validated.competition,
            },
          });
        } else if (validated.homeTeamCrest && !existingHomeTeam.logoUrl) {
          // Update existing team with logo if it doesn't have one
          await tx.team.update({
            where: { id: existingHomeTeam.id },
            data: { 
              logoUrl: validated.homeTeamCrest,
              externalId: validated.homeTeamId || existingHomeTeam.externalId,
            },
          });
        }
      }

      // Create or update away team with logo
      if (normalizedAwayTeam) {
        const existingAwayTeam = await tx.team.findFirst({
          where: { name: normalizedAwayTeam, sport: 'SOCCER' },
        });
        
        if (!existingAwayTeam) {
          await tx.team.create({
            data: {
              name: normalizedAwayTeam,
              sport: 'SOCCER',
              externalId: validated.awayTeamId,
              logoUrl: validated.awayTeamCrest,
              league: validated.competition,
            },
          });
        } else if (validated.awayTeamCrest && !existingAwayTeam.logoUrl) {
          // Update existing team with logo if it doesn't have one
          await tx.team.update({
            where: { id: existingAwayTeam.id },
            data: { 
              logoUrl: validated.awayTeamCrest,
              externalId: validated.awayTeamId || existingAwayTeam.externalId,
            },
          });
        }
      }

      // Create event
      const newEvent = await tx.event.create({
        data: {
          type: 'SOCCER',
          date: validated.date,
          venueId: venue.id,
          userId: session.user.id,
          notes: validated.notes,
          rating: validated.rating,
          companions: validated.companions,
          soccerMatch: {
            create: {
              homeTeam: normalizedHomeTeam,
              awayTeam: normalizedAwayTeam,
              homeScore: validated.homeScore,
              awayScore: validated.awayScore,
              competition: validated.competition,
              externalMatchId: validated.externalMatchId,
            },
          },
        },
        include: {
          venue: true,
          soccerMatch: true,
        },
      });

      // Create player appearances
      if (validated.appearances.length > 0 && newEvent.soccerMatch) {
        for (const app of validated.appearances) {
          // Find or create player
          let player = await tx.player.findFirst({
            where: {
              name: app.playerName,
              sport: 'SOCCER',
            },
          });

          if (!player) {
            player = await tx.player.create({
              data: {
                name: app.playerName,
                sport: 'SOCCER',
                team: app.team,
                externalId: app.externalId,
              },
            });
          }

          // Create appearance
          await tx.soccerAppearance.create({
            data: {
              matchId: newEvent.soccerMatch.id,
              playerId: player.id,
              goals: app.goals,
              assists: app.assists,
              cleanSheet: app.cleanSheet,
              yellowCard: app.yellowCard,
              redCard: app.redCard,
              minutesPlayed: app.minutesPlayed,
            },
          });
        }
      }

      // Fetch complete event with all relations
      return tx.event.findUnique({
        where: { id: newEvent.id },
        include: {
          venue: true,
          soccerMatch: {
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

    // Geocode venue in the background (fire-and-forget, won't block response)
    if (event?.venue) {
      ensureVenueCoordinates(
        event.venue.id,
        event.venue.name,
        event.venue.city,
        event.venue.country
      ).catch(() => {}); // Suppress unhandled rejection
    }

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    // 🧠 Error Memory Agent: Log error for tracking
    console.error('Soccer event creation error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to create soccer event' },
      { status: 500 }
    );
  }
}
