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

    // Prefer API-Football for match details as it provides goal scorers on free tier
    // Football-Data.org free tier doesn't include goal/booking events
    if (isApiFootballConfigured()) {
      try {
        matchDetails = await getExtendedMatchDetails(matchId);
        dataSource = 'api-football';
      } catch (apiFootballError) {
        console.warn('API-Football failed, trying Football-Data.org:', apiFootballError);
        matchDetails = await getMatchDetails(matchId);
        dataSource = 'football-data.org';
      }
    } else {
      // Fall back to Football-Data.org (note: free tier doesn't include goal scorers)
      matchDetails = await getMatchDetails(matchId);
      dataSource = 'football-data.org';
    }

    // Log what data we received from the API
    console.log('Match details received:', {
      id: matchDetails.id,
      hasGoals: !!matchDetails.goals,
      goalsCount: matchDetails.goals?.length || 0,
      hasBookings: !!matchDetails.bookings,
      bookingsCount: matchDetails.bookings?.length || 0,
      hasLineups: !!matchDetails.lineups,
      rawGoals: matchDetails.goals,
      rawBookings: matchDetails.bookings,
    });

    // Process into player appearances
    const { homeAppearances, awayAppearances } = processMatchToAppearances(matchDetails);
    
    console.log('Processed appearances:', {
      homeCount: homeAppearances.length,
      awayCount: awayAppearances.length,
      homeAppearances,
      awayAppearances,
    });

    // Filter to only players with meaningful stats (scored, assisted, got carded, or kept clean sheet)
    const hasStats = (p: typeof homeAppearances[0]) => 
      p.goals > 0 || p.assists > 0 || p.yellowCard || p.redCard || p.cleanSheet;

    // Combine all players with team designation
    let players = [
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

    // If no players found from processMatchToAppearances but we have raw goals/bookings data,
    // create player entries directly from that data
    if (players.length === 0) {
      const rawGoals = matchDetails.goals || [];
      const rawBookings = matchDetails.bookings || [];
      
      // Create a map to deduplicate players
      const playerMap = new Map<number, {
        playerId: number;
        playerName: string;
        team: 'home' | 'away';
        goals: number;
        assists: number;
        yellowCard: boolean;
        redCard: boolean;
        cleanSheet: boolean;
      }>();

      // Process goals
      for (const goal of rawGoals) {
        const isHome = goal.team?.id === matchDetails.homeTeam.id;
        const team = isHome ? 'home' : 'away';
        
        // Add/update scorer
        if (goal.scorer?.id) {
          const existing = playerMap.get(goal.scorer.id);
          if (existing) {
            existing.goals++;
          } else {
            playerMap.set(goal.scorer.id, {
              playerId: goal.scorer.id,
              playerName: goal.scorer.name,
              team,
              goals: 1,
              assists: 0,
              yellowCard: false,
              redCard: false,
              cleanSheet: false,
            });
          }
        }
        
        // Add/update assister
        if (goal.assist?.id) {
          const existing = playerMap.get(goal.assist.id);
          if (existing) {
            existing.assists++;
          } else {
            playerMap.set(goal.assist.id, {
              playerId: goal.assist.id,
              playerName: goal.assist.name,
              team,
              goals: 0,
              assists: 1,
              yellowCard: false,
              redCard: false,
              cleanSheet: false,
            });
          }
        }
      }

      // Process bookings
      for (const booking of rawBookings) {
        const isHome = booking.team?.id === matchDetails.homeTeam.id;
        const team = isHome ? 'home' : 'away';
        
        if (booking.player?.id) {
          const existing = playerMap.get(booking.player.id);
          if (existing) {
            if (booking.card === 'YELLOW_CARD') existing.yellowCard = true;
            if (booking.card === 'RED_CARD' || booking.card === 'YELLOW_RED_CARD') existing.redCard = true;
          } else {
            playerMap.set(booking.player.id, {
              playerId: booking.player.id,
              playerName: booking.player.name,
              team,
              goals: 0,
              assists: 0,
              yellowCard: booking.card === 'YELLOW_CARD',
              redCard: booking.card === 'RED_CARD' || booking.card === 'YELLOW_RED_CARD',
              cleanSheet: false,
            });
          }
        }
      }

      players = Array.from(playerMap.values());
      console.log('Fallback players created:', players.length);
    }

    console.log('Final players to return:', players.length, players);

    // If no players and using football-data.org, explain why
    const noPlayersReason = players.length === 0 && dataSource === 'football-data.org'
      ? 'Football-Data.org free tier does not include goal scorer data. Add players manually or configure API_FOOTBALL_KEY for auto-loading.'
      : undefined;

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
        // Explain if no players found
        noPlayersReason,
      },
      meta: {
        source: dataSource,
        apiFootballConfigured: isApiFootballConfigured(),
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

