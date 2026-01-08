'use client';

// Add Event Modal Component
// ✅ Code Quality Agent: Premium glass effect modal with event type selection

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronRight } from 'lucide-react';
import { useModal } from '@/components/layout/ModalProvider';
import { cn } from '@/lib/utils';

const eventTypes = [
  {
    type: 'soccer',
    emoji: '⚽',
    label: 'Soccer Match',
    description: 'Log a football/soccer match',
    href: '/events/new/soccer',
    gradient: 'from-green-500/20 to-emerald-500/10',
    border: 'border-green-500/30 hover:border-green-500/50',
  },
  {
    type: 'basketball',
    emoji: '🏀',
    label: 'Basketball Game',
    description: 'Track basketball games',
    href: '/events/new/basketball',
    gradient: 'from-orange-500/20 to-amber-500/10',
    border: 'border-orange-500/30 hover:border-orange-500/50',
  },
  {
    type: 'baseball',
    emoji: '⚾',
    label: 'Baseball Game',
    description: 'Log baseball games',
    href: '/events/new/baseball',
    gradient: 'from-red-500/20 to-rose-500/10',
    border: 'border-red-500/30 hover:border-red-500/50',
  },
  {
    type: 'tennis',
    emoji: '🎾',
    label: 'Tennis Match',
    description: 'Record tennis matches',
    href: '/events/new/tennis',
    gradient: 'from-yellow-500/20 to-lime-500/10',
    border: 'border-yellow-500/30 hover:border-yellow-500/50',
  },
  {
    type: 'concert',
    emoji: '🎵',
    label: 'Concert',
    description: 'Track concerts & shows',
    href: '/events/new/concert',
    gradient: 'from-purple-500/20 to-violet-500/10',
    border: 'border-purple-500/30 hover:border-purple-500/50',
  },
];

export function AddEventModal() {
  const { isAddEventOpen, closeAddEvent } = useModal();
  const router = useRouter();

  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAddEvent();
    },
    [closeAddEvent]
  );

  useEffect(() => {
    if (isAddEventOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isAddEventOpen, handleEscape]);

  const handleSelect = (href: string) => {
    closeAddEvent();
    router.push(href);
  };

  if (!isAddEventOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={closeAddEvent}
      />

      {/* Modal Panel */}
      <div className="absolute bottom-0 left-0 right-0 animate-slide-up">
        <div className="glass rounded-t-3xl border-t border-border/50 max-w-lg mx-auto">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pb-4">
            <h2 className="text-xl font-bold">Add Event</h2>
            <button
              onClick={closeAddEvent}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          {/* Event Types */}
          <div className="px-4 pb-8 space-y-2">
            {eventTypes.map((event, index) => (
              <button
                key={event.type}
                onClick={() => handleSelect(event.href)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200',
                  'bg-gradient-to-r',
                  event.gradient,
                  event.border,
                  'hover:scale-[1.02] active:scale-[0.98]'
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <span className="text-4xl">{event.emoji}</span>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold">{event.label}</h3>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </div>

          {/* Safe area padding for iOS */}
          <div className="h-safe" />
        </div>
      </div>
    </div>
  );
}
