// Football Match Details API - Fetch lineups, goals, cards
// 🔍 API Monitor Agent: Returns detailed match data with player stats
// ✅ Code Quality Agent: Proper error handling, type safety
// 📚 Library Research Agent: Supports both football-data.org and API-Football

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMatchDetails, processMatchToAppearances, FootballMatchDetails } from '@/lib/api/football-data';
import { getExtendedMatchDetails, isApiFootballConfigured, ApiFootballMatchDetails } from '@/lib/api/api-football';

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
    
    // Check for source parameter (default to primary/football-data.org)
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source') || 'primary';

    if (isNaN(matchId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid match ID' },
        { status: 400 }
      );
    }

    let matchDetails: FootballMatchDetails | ApiFootballMatchDetails;
    let dataSource = 'football-data.org';

    // Fetch from appropriate source
    if (source === 'extended' && isApiFootballConfigured()) {
      matchDetails = await getExtendedMatchDetails(matchId);
      dataSource = 'api-football';
    } else {
      // Try primary source first, fall back to extended if configured
      try {
        matchDetails = await getMatchDetails(matchId);
      } catch (primaryError) {
        if (isApiFootballConfigured()) {
          console.warn('Primary source failed, trying extended:', primaryError);
          matchDetails = await getExtendedMatchDetails(matchId);
          dataSource = 'api-football';
        } else {
          throw primaryError;
        }
      }
    }

    // Process into player appearances
    const { homeAppearances, awayAppearances } = processMatchToAppearances(matchDetails);

    // Filter to only players with meaningful stats (scored, assisted, got carded, or kept clean sheet)
    const hasStats = (p: typeof homeAppearances[0]) => 
      p.goals > 0 || p.assists > 0 || p.yellowCard || p.redCard || p.cleanSheet;

    // Combine all players with team designation
    const players = [
      ...homeAppearances.filter(hasStats).map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        team: 'home' as const,
        goals: p.goals,
        assists: p.assists,
        yellowCard: p.yellowCard,
        redCard: p.redCard,
        cleanSheet: p.cleanSheet,
      })),
      ...awayAppearances.filter(hasStats).map((p) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        team: 'away' as const,
        goals: p.goals,
        assists: p.assists,
        yellowCard: p.yellowCard,
        redCard: p.redCard,
        cleanSheet: p.cleanSheet,
      })),
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
        // Include team statistics if available (API-Football provides these)
        statistics: 'statistics' in matchDetails ? matchDetails.statistics : undefined,
      },
      meta: {
        source: dataSource,
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

