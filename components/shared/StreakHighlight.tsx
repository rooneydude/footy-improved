'use client';

// Streak Highlight Component
// ✅ Code Quality Agent: Premium animated streak display

import { Flame, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakHighlightProps {
  count: number;
  userName?: string;
}

export function StreakHighlight({ count, userName }: StreakHighlightProps) {
  const hasStreak = count > 0;
  const streakLevel = count >= 10 ? 'legendary' : count >= 5 ? 'hot' : count >= 1 ? 'warming' : 'cold';

  return (
    <section className="relative overflow-hidden rounded-2xl">
      {/* Gradient background */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-500',
          hasStreak
            ? 'bg-gradient-to-br from-orange-500/20 via-red-500/10 to-yellow-500/20'
            : 'bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/10'
        )}
      />

      {/* Glow effect for active streaks */}
      {hasStreak && (
        <div className="absolute inset-0 streak-glow opacity-50" />
      )}

      {/* Content */}
      <div className="relative px-6 py-8 text-center">
        {/* Animated icon */}
        <div className="flex justify-center mb-4">
          {hasStreak ? (
            <div className="relative">
              <Flame
                className={cn(
                  'h-16 w-16 transition-all duration-300',
                  streakLevel === 'legendary' && 'text-yellow-400 animate-pulse',
                  streakLevel === 'hot' && 'text-orange-400',
                  streakLevel === 'warming' && 'text-orange-300'
                )}
              />
              {streakLevel === 'legendary' && (
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-bounce" />
              )}
            </div>
          ) : (
            <Sparkles className="h-16 w-16 text-purple-400" />
          )}
        </div>

        {/* Main stat */}
        <div className="mb-2">
          {hasStreak ? (
            <>
              <span className="text-5xl font-bold font-mono tabular-nums gradient-text-fire">
                {count}
              </span>
              <span className="text-2xl font-semibold text-muted-foreground ml-2">
                {count === 1 ? 'event' : 'events'}
              </span>
            </>
          ) : (
            <span className="text-2xl font-semibold text-muted-foreground">
              Ready to start?
            </span>
          )}
        </div>

        {/* Subtitle */}
        <p className="text-muted-foreground">
          {hasStreak ? (
            <>this month{userName && <span className="text-foreground">, {userName}</span>}</>
          ) : (
            'Log your first event this month!'
          )}
        </p>

        {/* Streak badges */}
        {hasStreak && (
          <div className="flex justify-center gap-2 mt-4">
            {count >= 5 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                <Flame className="h-3 w-3" />
                On Fire
              </span>
            )}
            {count >= 10 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                <Sparkles className="h-3 w-3" />
                Legend
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
