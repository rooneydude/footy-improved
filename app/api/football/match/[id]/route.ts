// Football Match Details API - Fetch lineups, goals, cards
// 🔍 API Monitor Agent: Returns detailed match data with player stats
// ✅ Code Quality Agent: Proper error handling, type safety

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMatchDetails, processMatchToAppearances } from '@/lib/api/football-data';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const matchId = parseInt(id, 10);

    if (isNaN(matchId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid match ID' },
        { status: 400 }
      );
    }

    // Fetch match details from Football-Data.org
    const matchDetails = await getMatchDetails(matchId);

    // Process into player appearances
    const { homeAppearances, awayAppearances } = processMatchToAppearances(matchDetails);

    // Combine all players with team designation
    const players = [
      ...homeAppearances.map((p) => ({ ...p, team: 'home' as const })),
      ...awayAppearances.map((p) => ({ ...p, team: 'away' as const })),
    ];

    return NextResponse.json({
      success: true,
      data: {
        match: {
          id: matchDetails.id,
          date: matchDetails.utcDate,
          homeTeam: matchDetails.homeTeam.name,
          awayTeam: matchDetails.awayTeam.name,
          homeScore: matchDetails.score.fullTime.home,
          awayScore: matchDetails.score.fullTime.away,
          competition: matchDetails.competition.name,
          venue: matchDetails.venue,
          status: matchDetails.status,
        },
        players,
        // Return raw goal and booking data for reference
        goals: matchDetails.goals || [],
        bookings: matchDetails.bookings || [],
      },
    });
  } catch (error) {
    console.error('Football match details error:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('not configured')) {
        return NextResponse.json(
          { success: false, error: 'Football API not configured. Please add FOOTBALL_DATA_API_KEY to environment.' },
          { status: 503 }
        );
      }
      if (error.message.includes('Rate limit')) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch match details',
      },
      { status: 500 }
    );
  }
}

