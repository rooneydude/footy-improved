'use client';

// Team Logo Component
// ✅ Code Quality Agent: Reusable logo display with fallback handling

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface TeamLogoProps {
  logoUrl: string | null | undefined;
  teamName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  sport?: 'SOCCER' | 'BASKETBALL' | 'BASEBALL' | 'TENNIS' | 'CONCERT';
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const fontSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-2xl',
};

// Get emoji fallback for sport type
function getSportEmoji(sport?: string): string {
  const emojis: Record<string, string> = {
    SOCCER: '⚽',
    BASKETBALL: '🏀',
    BASEBALL: '⚾',
    TENNIS: '🎾',
    CONCERT: '🎵',
  };
  return emojis[sport || ''] || '🏟️';
}

// Get initials from team name
function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((word) => word.length > 0 && word[0] !== '(' && !['FC', 'SC', 'CF'].includes(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

// Get background color based on team name (consistent hash)
function getTeamColor(name: string): string {
  const colors = [
    'bg-red-500/20 text-red-300',
    'bg-blue-500/20 text-blue-300',
    'bg-green-500/20 text-green-300',
    'bg-yellow-500/20 text-yellow-300',
    'bg-purple-500/20 text-purple-300',
    'bg-orange-500/20 text-orange-300',
    'bg-pink-500/20 text-pink-300',
    'bg-cyan-500/20 text-cyan-300',
    'bg-indigo-500/20 text-indigo-300',
    'bg-emerald-500/20 text-emerald-300',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function TeamLogo({
  logoUrl,
  teamName,
  size = 'md',
  className,
  sport,
}: TeamLogoProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const showFallback = !logoUrl || hasError;

  if (showFallback) {
    // Show initials or emoji as fallback
    const initials = getInitials(teamName);
    const colorClass = getTeamColor(teamName);

    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-bold',
          sizeClasses[size],
          fontSizeClasses[size],
          colorClass,
          className
        )}
        title={teamName}
      >
        {initials || getSportEmoji(sport)}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-full bg-card/50',
        sizeClasses[size],
        className
      )}
      title={teamName}
    >
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-muted rounded-full" />
      )}
      <Image
        src={logoUrl}
        alt={`${teamName} logo`}
        fill
        className={cn(
          'object-contain p-0.5 transition-opacity duration-200',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        unoptimized // External URLs need this
      />
    </div>
  );
}

// Artist photo component (similar but for concerts)
interface ArtistPhotoProps {
  photoUrl: string | null | undefined;
  artistName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ArtistPhoto({
  photoUrl,
  artistName,
  size = 'md',
  className,
}: ArtistPhotoProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const showFallback = !photoUrl || hasError;

  if (showFallback) {
    const initials = getInitials(artistName);
    const colorClass = getTeamColor(artistName);

    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-bold',
          sizeClasses[size],
          fontSizeClasses[size],
          colorClass,
          className
        )}
        title={artistName}
      >
        {initials || '🎵'}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-full bg-card/50',
        sizeClasses[size],
        className
      )}
      title={artistName}
    >
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-muted rounded-full" />
      )}
      <Image
        src={photoUrl}
        alt={`${artistName}`}
        fill
        className={cn(
          'object-cover transition-opacity duration-200',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        unoptimized
      />
    </div>
  );
}
