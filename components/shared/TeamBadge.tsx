'use client';

// TeamBadge Component - Display team logos with fallback
// 📚 Library Research Agent: Using next/image for optimized images
// ✅ Code Quality Agent: Loading states, error handling, fallback UI

import { useState } from 'react';
import Image from 'next/image';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTeamLogoUrl, getSoccerTeamLogo, getNBATeamLogo, getMLBTeamLogo } from '@/lib/api/team-logos';

export type SportType = 'soccer' | 'basketball' | 'baseball';

export interface TeamBadgeProps {
  teamName: string;
  sport: SportType;
  externalId?: string | number;
  logoUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallback?: boolean;
}

const SIZE_CLASSES = {
  xs: 'h-4 w-4',
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const SIZE_PIXELS = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

/**
 * TeamBadge displays a team's logo with fallback to an icon
 */
export function TeamBadge({
  teamName,
  sport,
  externalId,
  logoUrl,
  size = 'md',
  className,
  showFallback = true,
}: TeamBadgeProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get logo URL from props or generate from team info
  const resolvedLogoUrl = logoUrl || getTeamLogoUrl(teamName, sport, externalId);

  // Generate initials for fallback
  const getInitials = (name: string) => {
    const words = name.split(' ').filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const sizeClass = SIZE_CLASSES[size];
  const sizePx = SIZE_PIXELS[size];

  // Show fallback if no URL or error occurred
  if (!resolvedLogoUrl || hasError) {
    if (!showFallback) return null;
    
    return (
      <div
        className={cn(
          sizeClass,
          'rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-medium',
          className
        )}
        title={teamName}
      >
        {size === 'xs' || size === 'sm' ? (
          <Shield className={cn(size === 'xs' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5')} />
        ) : (
          <span className={cn(
            size === 'md' && 'text-xs',
            size === 'lg' && 'text-sm',
            size === 'xl' && 'text-base'
          )}>
            {getInitials(teamName)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        sizeClass,
        'relative rounded-full overflow-hidden bg-secondary/50',
        isLoading && 'animate-pulse',
        className
      )}
      title={teamName}
    >
      <Image
        src={resolvedLogoUrl}
        alt={`${teamName} logo`}
        width={sizePx}
        height={sizePx}
        className={cn(
          'object-contain',
          isLoading && 'opacity-0',
          !isLoading && 'opacity-100 transition-opacity duration-200'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        unoptimized // External URLs may not work with Next.js optimization
      />
    </div>
  );
}

/**
 * TeamBadgeWithName displays team badge alongside the team name
 */
export interface TeamBadgeWithNameProps extends TeamBadgeProps {
  nameClassName?: string;
  layout?: 'horizontal' | 'vertical';
}

export function TeamBadgeWithName({
  teamName,
  sport,
  externalId,
  logoUrl,
  size = 'sm',
  className,
  nameClassName,
  layout = 'horizontal',
  showFallback = true,
}: TeamBadgeWithNameProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2',
        layout === 'vertical' && 'flex-col',
        className
      )}
    >
      <TeamBadge
        teamName={teamName}
        sport={sport}
        externalId={externalId}
        logoUrl={logoUrl}
        size={size}
        showFallback={showFallback}
      />
      <span className={cn('font-medium', nameClassName)}>{teamName}</span>
    </div>
  );
}

/**
 * MatchupBadges displays both teams' badges in a versus format
 */
export interface MatchupBadgesProps {
  homeTeam: string;
  awayTeam: string;
  sport: SportType;
  homeTeamId?: string | number;
  awayTeamId?: string | number;
  homeTeamLogo?: string | null;
  awayTeamLogo?: string | null;
  homeScore?: number;
  awayScore?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showScores?: boolean;
  className?: string;
}

export function MatchupBadges({
  homeTeam,
  awayTeam,
  sport,
  homeTeamId,
  awayTeamId,
  homeTeamLogo,
  awayTeamLogo,
  homeScore,
  awayScore,
  size = 'md',
  showScores = false,
  className,
}: MatchupBadgesProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Home Team */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        <span className="text-sm font-medium truncate">{homeTeam}</span>
        <TeamBadge
          teamName={homeTeam}
          sport={sport}
          externalId={homeTeamId}
          logoUrl={homeTeamLogo}
          size={size}
        />
      </div>

      {/* Score or VS */}
      <div className="flex-shrink-0 text-center min-w-[60px]">
        {showScores && homeScore !== undefined && awayScore !== undefined ? (
          <span className="text-lg font-mono font-bold">
            {homeScore} - {awayScore}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground font-medium">VS</span>
        )}
      </div>

      {/* Away Team */}
      <div className="flex items-center gap-2 flex-1">
        <TeamBadge
          teamName={awayTeam}
          sport={sport}
          externalId={awayTeamId}
          logoUrl={awayTeamLogo}
          size={size}
        />
        <span className="text-sm font-medium truncate">{awayTeam}</span>
      </div>
    </div>
  );
}

export default TeamBadge;

