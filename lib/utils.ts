// Utility Functions
// 📚 Library Research Agent: clsx (7k+⭐), tailwind-merge (5k+⭐), date-fns (36,375⭐)
// ✅ Code Quality Agent: Pure utility functions with proper error handling

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

// Tailwind class merging utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export function formatDate(date: Date | string, formatStr: string = 'PPP'): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return 'Invalid date';
    return format(d, formatStr);
  } catch {
    return 'Invalid date';
  }
}

export function formatRelativeDate(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return 'Invalid date';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
}

export function formatShortDate(date: Date | string): string {
  return formatDate(date, 'MMM d, yyyy');
}

// Score formatting
export function formatScore(home: number, away: number): string {
  return `${home} - ${away}`;
}

// Event type helpers
export type EventType = 'SOCCER' | 'BASKETBALL' | 'BASEBALL' | 'TENNIS' | 'CONCERT';

export function getEventEmoji(type: EventType): string {
  const emojis: Record<EventType, string> = {
    SOCCER: '⚽',
    BASKETBALL: '🏀',
    BASEBALL: '⚾',
    TENNIS: '🎾',
    CONCERT: '🎵',
  };
  return emojis[type] || '📅';
}

export function getEventColor(type: EventType): string {
  const colors: Record<EventType, string> = {
    SOCCER: 'text-green-500',
    BASKETBALL: 'text-orange-500',
    BASEBALL: 'text-red-500',
    TENNIS: 'text-yellow-500',
    CONCERT: 'text-purple-500',
  };
  return colors[type] || 'text-gray-500';
}

export function getEventBgColor(type: EventType): string {
  const colors: Record<EventType, string> = {
    SOCCER: 'bg-green-500/10 hover:bg-green-500/20',
    BASKETBALL: 'bg-orange-500/10 hover:bg-orange-500/20',
    BASEBALL: 'bg-red-500/10 hover:bg-red-500/20',
    TENNIS: 'bg-yellow-500/10 hover:bg-yellow-500/20',
    CONCERT: 'bg-purple-500/10 hover:bg-purple-500/20',
  };
  return colors[type] || 'bg-gray-500/10';
}

// Text utilities
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// ID generation (using crypto API for security)
export function generateId(prefix: string = ''): string {
  const random = crypto.randomUUID();
  return prefix ? `${prefix}_${random}` : random;
}

// Rating display
export function getRatingStars(rating: number): string {
  const stars = Math.min(5, Math.max(0, Math.round(rating)));
  return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}

// Number formatting
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Delay utility for async operations
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
