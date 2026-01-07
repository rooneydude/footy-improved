'use client';

// Tennis Match Form
// ✅ Code Quality Agent: Tennis-specific fields

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const tennisSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  venueName: z.string().min(1, 'Venue name is required'),
  venueCity: z.string().min(1, 'City is required'),
  venueCountry: z.string().min(1, 'Country is required'),
  player1Name: z.string().min(1, 'Player 1 is required'),
  player2Name: z.string().min(1, 'Player 2 is required'),
  winnerName: z.string().optional(),
  score: z.string().min(1, 'Score is required'),
  tournament: z.string().optional(),
  round: z.string().optional(),
  notes: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
});

type TennisFormData = z.infer<typeof tennisSchema>;

export default function TennisFormPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TennisFormData>({
    resolver: zodResolver(tennisSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: TennisFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/events/tennis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create event');
      }

      router.push('/events');
      router.refresh();
    } catch (error) {
      console.error('Submit error:', error);
      alert(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const player1 = watch('player1Name');
  const player2 = watch('player2Name');

  return (
    <div className="min-h-screen pb-20">
      <Header title="Log Tennis Match" />

      <main className="px-4 py-6 max-w-2xl mx-auto">
        <Link
          href="/events/new"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to event types
        </Link>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <Input type="date" {...register('date')} error={errors.date?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Player 1</label>
              <Input {...register('player1Name')} placeholder="Player name" error={errors.player1Name?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Player 2</label>
              <Input {...register('player2Name')} placeholder="Player name" error={errors.player2Name?.message} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Score</label>
            <Input {...register('score')} placeholder="e.g., 6-4, 3-6, 7-5" error={errors.score?.message} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Winner (Optional)</label>
            <select
              {...register('winnerName')}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select winner</option>
              {player1 && <option value={player1}>{player1}</option>}
              {player2 && <option value={player2}>{player2}</option>}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tournament (Optional)</label>
              <Input {...register('tournament')} placeholder="e.g., Wimbledon, US Open" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Round (Optional)</label>
              <Input {...register('round')} placeholder="e.g., Final, Semifinal" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Venue</label>
              <Input {...register('venueName')} placeholder="Court/stadium name" error={errors.venueName?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <Input {...register('venueCity')} placeholder="City" error={errors.venueCity?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <Input {...register('venueCountry')} placeholder="Country" error={errors.venueCountry?.message} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
            <textarea
              {...register('notes')}
              className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Any memorable moments..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rating (Optional)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue('rating', star)}
                  className="text-2xl transition-transform hover:scale-110"
                >
                  {star <= (watch('rating') || 0) ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Save Match
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
