// Team Name Normalization Migration API
// One-time endpoint to normalize existing team names across all records
// This consolidates duplicates caused by different API naming conventions

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizeTeamName } from '@/lib/utils/team-names';

export async function POST(request: Request) {
  try {
    // Auth check - require authenticated user or admin secret
    const body = await request.json().catch(() => ({}));
    const adminSecret = body?.secret;
    
    if (adminSecret === process.env.NEXTAUTH_SECRET) {
      // Admin access via secret
    } else {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const results = {
      soccerMatches: { checked: 0, updated: 0, changes: [] as string[] },
      basketballGames: { checked: 0, updated: 0, changes: [] as string[] },
      baseballGames: { checked: 0, updated: 0, changes: [] as string[] },
      teams: { checked: 0, updated: 0, merged: 0, changes: [] as string[] },
    };

    // 1. Normalize SoccerMatch team names
    const soccerMatches = await prisma.soccerMatch.findMany({
      select: { id: true, homeTeam: true, awayTeam: true },
    });
    results.soccerMatches.checked = soccerMatches.length;
    
    for (const match of soccerMatches) {
      const normalizedHome = normalizeTeamName(match.homeTeam);
      const normalizedAway = normalizeTeamName(match.awayTeam);
      
      if (normalizedHome !== match.homeTeam || normalizedAway !== match.awayTeam) {
        await prisma.soccerMatch.update({
          where: { id: match.id },
          data: {
            homeTeam: normalizedHome,
            awayTeam: normalizedAway,
          },
        });
        results.soccerMatches.updated++;
        if (normalizedHome !== match.homeTeam) {
          results.soccerMatches.changes.push(`"${match.homeTeam}" → "${normalizedHome}"`);
        }
        if (normalizedAway !== match.awayTeam) {
          results.soccerMatches.changes.push(`"${match.awayTeam}" → "${normalizedAway}"`);
        }
      }
    }

    // 2. Normalize BasketballGame team names
    const basketballGames = await prisma.basketballGame.findMany({
      select: { id: true, homeTeam: true, awayTeam: true },
    });
    results.basketballGames.checked = basketballGames.length;
    
    for (const game of basketballGames) {
      const normalizedHome = normalizeTeamName(game.homeTeam);
      const normalizedAway = normalizeTeamName(game.awayTeam);
      
      if (normalizedHome !== game.homeTeam || normalizedAway !== game.awayTeam) {
        await prisma.basketballGame.update({
          where: { id: game.id },
          data: {
            homeTeam: normalizedHome,
            awayTeam: normalizedAway,
          },
        });
        results.basketballGames.updated++;
        if (normalizedHome !== game.homeTeam) {
          results.basketballGames.changes.push(`"${game.homeTeam}" → "${normalizedHome}"`);
        }
        if (normalizedAway !== game.awayTeam) {
          results.basketballGames.changes.push(`"${game.awayTeam}" → "${normalizedAway}"`);
        }
      }
    }

    // 3. Normalize BaseballGame team names
    const baseballGames = await prisma.baseballGame.findMany({
      select: { id: true, homeTeam: true, awayTeam: true },
    });
    results.baseballGames.checked = baseballGames.length;
    
    for (const game of baseballGames) {
      const normalizedHome = normalizeTeamName(game.homeTeam);
      const normalizedAway = normalizeTeamName(game.awayTeam);
      
      if (normalizedHome !== game.homeTeam || normalizedAway !== game.awayTeam) {
        await prisma.baseballGame.update({
          where: { id: game.id },
          data: {
            homeTeam: normalizedHome,
            awayTeam: normalizedAway,
          },
        });
        results.baseballGames.updated++;
        if (normalizedHome !== game.homeTeam) {
          results.baseballGames.changes.push(`"${game.homeTeam}" → "${normalizedHome}"`);
        }
        if (normalizedAway !== game.awayTeam) {
          results.baseballGames.changes.push(`"${game.awayTeam}" → "${normalizedAway}"`);
        }
      }
    }

    // 4. Normalize Team table - merge duplicates
    const allTeams = await prisma.team.findMany({
      select: { id: true, name: true, sport: true, logoUrl: true, externalId: true },
    });
    results.teams.checked = allTeams.length;

    // Group teams by normalized name + sport
    const teamGroups = new Map<string, typeof allTeams>();
    for (const team of allTeams) {
      const normalizedName = normalizeTeamName(team.name);
      const key = `${normalizedName}::${team.sport}`;
      if (!teamGroups.has(key)) {
        teamGroups.set(key, []);
      }
      teamGroups.get(key)!.push(team);
    }

    // Merge duplicates - keep the one with the most data (logoUrl, externalId)
    for (const [key, group] of teamGroups) {
      const normalizedName = key.split('::')[0];
      
      if (group.length > 1) {
        // Sort: prefer ones with logo > with externalId > alphabetically by original name
        group.sort((a, b) => {
          if (a.logoUrl && !b.logoUrl) return -1;
          if (!a.logoUrl && b.logoUrl) return 1;
          if (a.externalId && !b.externalId) return -1;
          if (!a.externalId && b.externalId) return 1;
          return a.name.localeCompare(b.name);
        });
        
        const keeper = group[0];
        const duplicates = group.slice(1);
        
        // Update keeper with normalized name and best available data
        const bestLogo = group.find(t => t.logoUrl)?.logoUrl || null;
        const bestExternalId = group.find(t => t.externalId)?.externalId || null;
        
        await prisma.team.update({
          where: { id: keeper.id },
          data: {
            name: normalizedName,
            logoUrl: bestLogo,
            externalId: bestExternalId,
          },
        });
        
        // Delete duplicates
        for (const dup of duplicates) {
          try {
            await prisma.team.delete({
              where: { id: dup.id },
            });
            results.teams.merged++;
            results.teams.changes.push(`Merged "${dup.name}" into "${normalizedName}"`);
          } catch {
            // If delete fails due to constraints, just update the name
            try {
              await prisma.team.update({
                where: { id: dup.id },
                data: { name: normalizedName },
              });
            } catch {
              // Unique constraint - already has this normalized name, skip
              results.teams.changes.push(`Could not merge "${dup.name}" (unique constraint)`);
            }
          }
        }
        
        results.teams.updated++;
      } else if (group[0].name !== normalizedName) {
        // Single team but name needs normalizing
        try {
          await prisma.team.update({
            where: { id: group[0].id },
            data: { name: normalizedName },
          });
          results.teams.updated++;
          results.teams.changes.push(`"${group[0].name}" → "${normalizedName}"`);
        } catch {
          // Unique constraint - already exists with this name
          results.teams.changes.push(`Could not rename "${group[0].name}" → "${normalizedName}" (already exists)`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Team name normalization complete',
      results,
    });
  } catch (error) {
    console.error('Team normalization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to normalize team names' },
      { status: 500 }
    );
  }
}
