'use client';

// PlayerStatsEditor Component - Track key player statistics for different sports
// 📚 Library Research Agent: Simplified to track only key stats (goals, points, HRs)
// ✅ Code Quality Agent: Type-safe, supports all sport types, focused on key metrics

import { useState } from 'react';
import { Plus, X, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

// Sport type definition
export type SportType = 'soccer' | 'basketball' | 'baseball' | 'tennis';

// Base player interface
interface BasePlayer {
  id?: number;
  tempId?: string; // For manually added players
  name: string;
  team: 'home' | 'away';
}

// Soccer player stats: Goals, Assists, Cards, Clean Sheets
export interface SoccerPlayer extends BasePlayer {
  goals: number;
  assists: number;
  yellowCard: boolean;
  redCard: boolean;
  cleanSheet: boolean;
}

// Basketball player stats - KEY STAT ONLY: Points
export interface BasketballPlayer extends BasePlayer {
  points: number;
}

// Baseball player stats - KEY STATS ONLY: Home Runs & RBIs
export interface BaseballPlayer extends BasePlayer {
  homeRuns: number;
  rbis: number;
}

// Tennis player stats - KEY STAT: Winner
export interface TennisPlayer extends BasePlayer {
  isWinner: boolean;
}

// Union type for all player types
export type Player = SoccerPlayer | BasketballPlayer | BaseballPlayer | TennisPlayer;

interface PlayerStatsEditorProps {
  sportType: SportType;
  homeTeamName: string;
  awayTeamName: string;
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
}

export function PlayerStatsEditor({
  sportType,
  homeTeamName,
  awayTeamName,
  players,
  onPlayersChange,
}: PlayerStatsEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerTeam, setNewPlayerTeam] = useState<'home' | 'away'>('home');

  // Get default stats for a new player based on sport type (KEY STATS ONLY)
  const getDefaultStats = (name: string, team: 'home' | 'away'): Player => {
    const base = {
      tempId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      team,
    };

    switch (sportType) {
      case 'soccer':
        return {
          ...base,
          goals: 0,
          assists: 0,
          yellowCard: false,
          redCard: false,
          cleanSheet: false,
        } as SoccerPlayer;
      case 'basketball':
        return {
          ...base,
          points: 0,
        } as BasketballPlayer;
      case 'baseball':
        return {
          ...base,
          homeRuns: 0,
          rbis: 0,
        } as BaseballPlayer;
      case 'tennis':
        return {
          ...base,
          isWinner: false,
        } as TennisPlayer;
    }
  };

  // Add a new player
  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    
    const newPlayer = getDefaultStats(newPlayerName.trim(), newPlayerTeam);
    onPlayersChange([...players, newPlayer]);
    setNewPlayerName('');
  };

  // Remove a player
  const removePlayer = (index: number) => {
    const updated = [...players];
    updated.splice(index, 1);
    onPlayersChange(updated);
  };

  // Update a player's stats
  const updatePlayer = (index: number, updates: Partial<Player>) => {
    const updated = [...players];
    updated[index] = { ...updated[index], ...updates } as Player;
    onPlayersChange(updated);
  };

  // Get players by team
  const homePlayers = players.filter((p) => p.team === 'home');
  const awayPlayers = players.filter((p) => p.team === 'away');

  // Render stat input based on sport type (KEY STATS ONLY)
  const renderStatInputs = (player: Player, index: number) => {
    const globalIndex = players.findIndex(
      (p) => (p.id && p.id === (player as Player & { id?: number }).id) || 
             (p.tempId && p.tempId === (player as Player & { tempId?: string }).tempId)
    );

    switch (sportType) {
      case 'soccer':
        const soccerPlayer = player as SoccerPlayer;
        return (
          <div className="grid grid-cols-5 gap-2 items-center">
            {/* Goals */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground mb-1">Goals</span>
              <div className="flex items-center gap-1">
                <span className="text-base">⚽</span>
                <Input
                  type="number"
                  min="0"
                  value={soccerPlayer.goals}
                  onChange={(e) => updatePlayer(globalIndex, { goals: parseInt(e.target.value) || 0 })}
                  className="h-8 text-sm text-center font-mono w-14"
                />
              </div>
            </div>
            {/* Assists */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground mb-1">Assists</span>
              <div className="flex items-center gap-1">
                <span className="text-base">🅰️</span>
                <Input
                  type="number"
                  min="0"
                  value={soccerPlayer.assists}
                  onChange={(e) => updatePlayer(globalIndex, { assists: parseInt(e.target.value) || 0 })}
                  className="h-8 text-sm text-center font-mono w-14"
                />
              </div>
            </div>
            {/* Yellow Card */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground mb-1">Yellow</span>
              <label className="flex items-center justify-center cursor-pointer h-8">
                <input
                  type="checkbox"
                  checked={soccerPlayer.yellowCard}
                  onChange={(e) => updatePlayer(globalIndex, { yellowCard: e.target.checked })}
                  className="sr-only"
                />
                <span className={`text-2xl ${soccerPlayer.yellowCard ? '' : 'opacity-30'}`}>🟨</span>
              </label>
            </div>
            {/* Red Card */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground mb-1">Red</span>
              <label className="flex items-center justify-center cursor-pointer h-8">
                <input
                  type="checkbox"
                  checked={soccerPlayer.redCard}
                  onChange={(e) => updatePlayer(globalIndex, { redCard: e.target.checked })}
                  className="sr-only"
                />
                <span className={`text-2xl ${soccerPlayer.redCard ? '' : 'opacity-30'}`}>🟥</span>
              </label>
            </div>
            {/* Clean Sheet */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground mb-1">Clean</span>
              <label className="flex items-center justify-center cursor-pointer h-8">
                <input
                  type="checkbox"
                  checked={soccerPlayer.cleanSheet}
                  onChange={(e) => updatePlayer(globalIndex, { cleanSheet: e.target.checked })}
                  className="sr-only"
                />
                <span className={`text-2xl ${soccerPlayer.cleanSheet ? '' : 'opacity-30'}`}>🧤</span>
              </label>
            </div>
          </div>
        );

      case 'basketball':
        const basketballPlayer = player as BasketballPlayer;
        return (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg">🏀</span>
            <Input
              type="number"
              min="0"
              value={basketballPlayer.points}
              onChange={(e) => updatePlayer(globalIndex, { points: parseInt(e.target.value) || 0 })}
              className="h-8 text-sm text-center font-mono w-20"
            />
            <span className="text-xs text-muted-foreground">pts</span>
          </div>
        );

      case 'baseball':
        const baseballPlayer = player as BaseballPlayer;
        return (
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">💣</span>
              <Input
                type="number"
                min="0"
                value={baseballPlayer.homeRuns}
                onChange={(e) => updatePlayer(globalIndex, { homeRuns: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm text-center font-mono w-16"
              />
              <span className="text-xs text-muted-foreground">HR</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                value={baseballPlayer.rbis}
                onChange={(e) => updatePlayer(globalIndex, { rbis: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm text-center font-mono w-16"
              />
              <span className="text-xs text-muted-foreground">RBI</span>
            </div>
          </div>
        );

      case 'tennis':
        const tennisPlayer = player as TennisPlayer;
        return (
          <div className="flex items-center gap-2 mt-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={tennisPlayer.isWinner}
                onChange={(e) => updatePlayer(globalIndex, { isWinner: e.target.checked })}
                className="rounded w-4 h-4"
              />
              <Trophy className={`h-4 w-4 ${tennisPlayer.isWinner ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              <span className={tennisPlayer.isWinner ? 'text-yellow-500 font-medium' : ''}>
                {tennisPlayer.isWinner ? 'Winner' : 'Mark as winner'}
              </span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  // Render player list for a team
  const renderTeamPlayers = (teamPlayers: Player[], teamName: string, teamType: 'home' | 'away') => (
    <div className="space-y-3">
      <h4 className="font-medium text-sm flex items-center gap-2 pb-2 border-b border-border">
        <span className={`w-3 h-3 rounded-full ${teamType === 'home' ? 'bg-blue-400' : 'bg-red-400'}`} />
        <span>{teamName}</span>
        {teamPlayers.length > 0 && (
          <span className="text-muted-foreground">({teamPlayers.length} players)</span>
        )}
      </h4>
      {teamPlayers.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-4 text-center">No players tracked yet</p>
      ) : (
        <div className="space-y-3">
          {teamPlayers.map((player, idx) => {
            const globalIndex = players.findIndex(
              (p) => (p.id && p.id === (player as Player & { id?: number }).id) ||
                     (p.tempId && p.tempId === (player as Player & { tempId?: string }).tempId)
            );
            return (
              <div
                key={(player as Player & { id?: number }).id || (player as Player & { tempId?: string }).tempId || idx}
                className="p-4 rounded-lg bg-secondary/30 border border-border"
              >
                {/* Player Name Row */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <Input
                    type="text"
                    value={player.name}
                    onChange={(e) => updatePlayer(globalIndex, { name: e.target.value })}
                    className="h-9 text-sm font-medium flex-1"
                    placeholder="Player name"
                  />
                  <button
                    type="button"
                    onClick={() => removePlayer(globalIndex)}
                    className="p-2 hover:bg-destructive/20 rounded text-destructive flex-shrink-0"
                    title="Remove player"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {/* Stats Row */}
                {renderStatInputs(player, idx)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Get the stat label for the header
  const getStatLabel = (): string => {
    switch (sportType) {
      case 'soccer': return 'Goals, Assists, Cards';
      case 'basketball': return 'Points';
      case 'baseball': return 'Home Runs & RBIs';
      case 'tennis': return 'Winner';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full"
        >
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Key Stats ({getStatLabel()})
            {players.length > 0 && (
              <span className="text-muted-foreground font-normal">• {players.length} players</span>
            )}
          </CardTitle>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Add New Player */}
          <div className="p-4 rounded-lg bg-secondary/20 border border-dashed border-border">
            <h4 className="text-sm font-medium mb-3">Track a Player</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Player name"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPlayer())}
              />
              <select
                value={newPlayerTeam}
                onChange={(e) => setNewPlayerTeam(e.target.value as 'home' | 'away')}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="home">{homeTeamName || 'Home'}</option>
                <option value="away">{awayTeamName || 'Away'}</option>
              </select>
              <Button type="button" onClick={addPlayer} disabled={!newPlayerName.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Players by Team - Full width for better display */}
          <div className="space-y-6">
            {renderTeamPlayers(homePlayers, homeTeamName || 'Home Team', 'home')}
            {renderTeamPlayers(awayPlayers, awayTeamName || 'Away Team', 'away')}
          </div>

          {/* Stats Legend */}
          <div className="text-xs text-muted-foreground border-t border-border pt-4">
            <span className="font-medium">Tracking: </span>
            {sportType === 'soccer' && '⚽ Goals • 🅰️ Assists • 🟨 Yellow • 🟥 Red • 🧤 Clean Sheet'}
            {sportType === 'basketball' && '🏀 Points scored'}
            {sportType === 'baseball' && '💣 Home Runs • RBI = Runs Batted In'}
            {sportType === 'tennis' && '🏆 Match winner'}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default PlayerStatsEditor;

