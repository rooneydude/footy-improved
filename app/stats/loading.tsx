// Stats Loading State
// Shows skeleton while stats are loading

import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

function StatCardSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-border animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-muted" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-muted rounded mb-2" />
          <div className="h-6 w-16 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="rounded-xl border border-border p-4 animate-pulse">
      <div className="h-5 w-32 bg-muted rounded mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-muted" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-muted rounded mb-1" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
            <div className="h-5 w-8 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StatsLoading() {
  return (
    <div className="min-h-screen pb-20">
      <Header title="Stats" />

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Navigation tabs skeleton */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Summary stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Leaderboards skeleton */}
        <div className="grid md:grid-cols-2 gap-4">
          <LeaderboardSkeleton />
          <LeaderboardSkeleton />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
