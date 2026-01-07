// Achievements Page
// ✅ Code Quality Agent: Achievement display with progress

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent } from '@/components/ui/Card';
import { ACHIEVEMENTS, TIER_ORDER } from '@/lib/achievements/definitions';
import { cn } from '@/lib/utils';

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const userId = session.user.id;

  // Get user's unlocked achievements
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
  });

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement.name));

  // Get stats for progress
  const [totalEvents, eventsByType, uniqueVenues, uniqueCountries] = await Promise.all([
    prisma.event.count({ where: { userId } }),
    prisma.event.groupBy({
      by: ['type'],
      where: { userId },
      _count: { type: true },
    }),
    prisma.event.findMany({
      where: { userId },
      select: { venueId: true },
      distinct: ['venueId'],
    }),
    prisma.venue.findMany({
      where: { events: { some: { userId } } },
      select: { country: true },
      distinct: ['country'],
    }),
  ]);

  const eventTypeCount: Record<string, number> = {};
  eventsByType.forEach((e) => {
    eventTypeCount[e.type] = e._count.type;
  });

  // Calculate progress for each achievement
  const achievementsWithProgress = ACHIEVEMENTS.map((def) => {
    const isUnlocked = unlockedIds.has(def.name);
    let current = 0;
    const target = def.criteria.threshold || 1;

    switch (def.criteria.type) {
      case 'total_events':
        current = totalEvents;
        break;
      case 'events_by_type':
        current = eventTypeCount[def.criteria.eventType as string] || 0;
        break;
      case 'unique_venues':
        current = uniqueVenues.length;
        break;
      case 'unique_countries':
        current = uniqueCountries.length;
        break;
      default:
        current = 0;
    }

    return {
      ...def,
      isUnlocked,
      progress: {
        current: Math.min(current, target),
        target,
        percentage: Math.min(100, Math.round((current / target) * 100)),
      },
    };
  });

  // Sort by tier and then by unlock status
  const sortedAchievements = [...achievementsWithProgress].sort((a, b) => {
    if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1;
    return TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
  });

  const unlockedCount = achievementsWithProgress.filter((a) => a.isUnlocked).length;

  const tierColors = {
    BRONZE: 'border-orange-700/50 bg-orange-950/20',
    SILVER: 'border-gray-400/50 bg-gray-800/20',
    GOLD: 'border-yellow-500/50 bg-yellow-900/20',
    PLATINUM: 'border-cyan-400/50 bg-cyan-900/20',
  };

  return (
    <div className="min-h-screen pb-20">
      <Header title="Achievements" />

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Achievements</h1>
          <p className="text-muted-foreground">
            {unlockedCount} of {ACHIEVEMENTS.length} unlocked
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all"
            style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
          />
        </div>

        {/* Achievement Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {sortedAchievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={cn(
                'transition-all',
                achievement.isUnlocked
                  ? tierColors[achievement.tier]
                  : 'opacity-60 grayscale'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{achievement.name}</h3>
                      {achievement.isUnlocked && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    
                    {!achievement.isUnlocked && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-mono">
                            {achievement.progress.current}/{achievement.progress.target}
                          </span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${achievement.progress.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2">
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          achievement.tier === 'BRONZE' && 'bg-orange-500/20 text-orange-400',
                          achievement.tier === 'SILVER' && 'bg-gray-400/20 text-gray-300',
                          achievement.tier === 'GOLD' && 'bg-yellow-500/20 text-yellow-400',
                          achievement.tier === 'PLATINUM' && 'bg-cyan-400/20 text-cyan-300'
                        )}
                      >
                        {achievement.tier}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
