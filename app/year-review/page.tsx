// Year in Review Selector
// ✅ Code Quality Agent: Year selection page

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent } from '@/components/ui/Card';
import { Calendar } from 'lucide-react';

export default async function YearReviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/signin');

  // Get years with events
  const events = await prisma.event.findMany({
    where: { userId: session.user.id },
    select: { date: true },
  });

  const years = [...new Set(events.map((e) => new Date(e.date).getFullYear()))].sort((a, b) => b - a);

  return (
    <div className="min-h-screen pb-20">
      <Header title="Year in Review" />
      <main className="px-4 py-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Year in Review</h1>
        <p className="text-muted-foreground mb-6">Relive your best moments from each year</p>

        {years.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {years.map((year) => (
              <Link key={year} href={`/year-review/${year}`}>
                <Card className="hover:bg-card-hover transition-colors">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{year}</p>
                      <p className="text-sm text-muted-foreground">View your year</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No events yet. Start logging to see your year in review!</p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}


