// Events Loading State
// Shows skeleton cards while events are loading

import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

function EventCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border p-5 animate-pulse">
      <div className="flex items-center gap-3">
        {/* Team logo skeleton */}
        <div className="w-12 h-12 rounded-full bg-muted" />
        
        {/* Score skeleton */}
        <div className="flex-1 text-center">
          <div className="h-8 w-24 bg-muted rounded-xl mx-auto" />
        </div>
        
        {/* Team logo skeleton */}
        <div className="w-12 h-12 rounded-full bg-muted" />
      </div>
      
      {/* Meta info skeleton */}
      <div className="flex items-center gap-4 mt-4">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-4 w-32 bg-muted rounded" />
      </div>
    </div>
  );
}

export default function EventsLoading() {
  return (
    <div className="min-h-screen pb-20">
      <Header title="Events" />

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-4">
        {/* Search skeleton */}
        <div className="h-10 bg-muted rounded-lg animate-pulse" />

        {/* Type filters skeleton */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-8 w-20 bg-muted rounded-full animate-pulse" />
          ))}
        </div>

        {/* Results count skeleton */}
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />

        {/* Event cards skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
