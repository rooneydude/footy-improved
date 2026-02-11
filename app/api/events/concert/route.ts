// Concert Event Creation API
// 🔍 API Monitor Agent: Full validation, proper transaction handling
// ✅ Code Quality Agent: Zod validation, proper error responses

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ensureVenueCoordinates, updateVenueCoordinates } from '@/lib/utils/geocode';

// Input validation schema
const concertEventSchema = z.object({
  date: z.string().transform((s) => new Date(s)),
  venueName: z.string().min(1, 'Venue name is required'),
  venueCity: z.string().min(1, 'City is required'),
  venueCountry: z.string().min(1, 'Country is required'),
  artistName: z.string().min(1, 'Artist name is required'),
  artistMbid: z.string().optional(),
  tourName: z.string().optional(),
  openingActs: z.array(z.string()).default([]),
  externalSetlistId: z.string().optional(),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  companions: z.array(z.string()).default([]),
  // Venue coordinates from Setlist.fm
  venueLatitude: z.number().optional(),
  venueLongitude: z.number().optional(),
  setlist: z.array(z.object({
    songName: z.string().min(1),
    order: z.number().min(1),
    isEncore: z.boolean().default(false),
    notes: z.string().optional(),
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
    const parseResult = concertEventSchema.safeParse(body);
    
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
            type: 'THEATER',
          },
        });
      }

      // Find or create artist
      let artist = await tx.artist.findFirst({
        where: { name: validated.artistName },
      });

      if (!artist) {
        artist = await tx.artist.create({
          data: {
            name: validated.artistName,
            externalId: validated.artistMbid,
          },
        });
      }

      // Create event
      const newEvent = await tx.event.create({
        data: {
          type: 'CONCERT',
          date: validated.date,
          venueId: venue.id,
          userId: session.user.id,
          notes: validated.notes,
          rating: validated.rating,
          companions: validated.companions,
          concert: {
            create: {
              artistId: artist.id,
              tourName: validated.tourName,
              openingActs: validated.openingActs,
              externalSetlistId: validated.externalSetlistId,
            },
          },
        },
        include: {
          venue: true,
          concert: true,
        },
      });

      // Create setlist items
      if (validated.setlist.length > 0 && newEvent.concert) {
        await tx.setlistItem.createMany({
          data: validated.setlist.map((song) => ({
            concertId: newEvent.concert!.id,
            songName: song.songName,
            order: song.order,
            isEncore: song.isEncore,
            notes: song.notes,
          })),
        });
      }

      // Fetch complete event with all relations
      return tx.event.findUnique({
        where: { id: newEvent.id },
        include: {
          venue: true,
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

    // Store venue coordinates (fire-and-forget)
    if (event?.venue) {
      if (validated.venueLatitude && validated.venueLongitude) {
        // Use Setlist.fm coordinates directly
        updateVenueCoordinates(
          event.venue.id,
          validated.venueLatitude,
          validated.venueLongitude
        ).catch(() => {});
      } else {
        // Fallback to geocoding
        ensureVenueCoordinates(
          event.venue.id,
          event.venue.name,
          event.venue.city,
          event.venue.country
        ).catch(() => {});
      }
    }

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    // 🧠 Error Memory Agent: Log error for tracking
    console.error('Concert event creation error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to create concert event' },
      { status: 500 }
    );
  }
}
