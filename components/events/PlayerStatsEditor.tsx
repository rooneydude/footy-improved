'use client';

// PlayerStatsEditor Component - Edit player statistics for different sports
// 📚 Library Research Agent: Custom component with sport-specific stat fields
// ✅ Code Quality Agent: Type-safe, supports all sport types, manual entry

import { useState } from 'react';
import { Plus, X, ChevronDown, ChevronUp, User } from 'lucide-react';
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

// Soccer player stats
export interface SoccerPlayer extends BasePlayer {
  goals: number;
  assists: number;
  yellowCard: boolean;
  redCard: boolean;
  cleanSheet: boolean;
  minutesPlayed?: number;
}

// Basketball player stats
export interface BasketballPlayer extends BasePlayer {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  minutes: string;
}

// Baseball player stats
export interface BaseballPlayer extends BasePlayer {
  position: string;
  hits: number;
  homeRuns: number;
  rbis: number;
  runs: number;
  atBats: number;
  strikeOuts: number;
  walks: number;
}

// Tennis player stats
export interface TennisPlayer extends BasePlayer {
  setsWon: number;
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

  // Get default stats for a new player based on sport type
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
          rebounds: 0,
          assists: 0,
          steals: 0,
          blocks: 0,
          turnovers: 0,
          minutes: '0:00',
        } as BasketballPlayer;
      case 'baseball':
        return {
          ...base,
          position: '',
          hits: 0,
          homeRuns: 0,
          rbis: 0,
          runs: 0,
          atBats: 0,
          strikeOuts: 0,
          walks: 0,
        } as BaseballPlayer;
      case 'tennis':
        return {
          ...base,
          setsWon: 0,
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

  // Render stat input based on sport type
  const renderStatInputs = (player: Player, index: number) => {
    const globalIndex = players.findIndex(
      (p) => (p.id && p.id === (player as Player & { id?: number }).id) || 
             (p.tempId && p.tempId === (player as Player & { tempId?: string }).tempId)
    );

    switch (sportType) {
      case 'soccer':
        const soccerPlayer = player as SoccerPlayer;
        return (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
            <div>
              <label className="text-xs text-muted-foreground">Goals</label>
              <Input
                type="number"
                min="0"
                value={soccerPlayer.goals}
                onChange={(e) => updatePlayer(globalIndex, { goals: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm text-center font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Assists</label>
              <Input
                type="number"
                min="0"
                value={soccerPlayer.assists}
                onChange={(e) => updatePlayer(globalIndex, { assists: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm text-center font-mono"
              />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={soccerPlayer.yellowCard}
                  onChange={(e) => updatePlayer(globalIndex, { yellowCard: e.target.checked })}
                  className="rounded"
                />
                🟨
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={soccerPlayer.redCard}
                  onChange={(e) => updatePlayer(globalIndex, { redCard: e.target.checked })}
                  className="rounded"
                />
                🟥
              </label>
            </div>
          </div>
        );

      case 'basketball':
        const basketballPlayer = player as BasketballPlayer;
        return (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
            <div>
              <label className="text-xs text-muted-foreground">Pts</label>
              <Input
                type="number"
                min="0"
                value={basketballPlayer.points}
                onChange={(e) => updatePlayer(globalIndex, { points: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Reb</label>
              <Input
                type="number"
                min="0"
                value={basketballPlayer.rebounds}
                onChange={(e) => updatePlayer(globalIndex, { rebounds: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Ast</label>
              <Input
                type="number"
                min="0"
                value={basketballPlayer.assists}
                onChange={(e) => updatePlayer(globalIndex, { assists: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Stl</label>
              <Input
                type="number"
                min="0"
                value={basketballPlayer.steals}
                onChange={(e) => updatePlayer(globalIndex, { steals: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Blk</label>
              <Input
                type="number"
                min="0"
                value={basketballPlayer.blocks}
                onChange={(e) => updatePlayer(globalIndex, { blocks: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">TO</label>
              <Input
                type="number"
                min="0"
                value={basketballPlayer.turnovers}
                onChange={(e) => updatePlayer(globalIndex, { turnovers: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
          </div>
        );

      case 'baseball':
        const baseballPlayer = player as BaseballPlayer;
        return (
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-2">
            <div>
              <label className="text-xs text-muted-foreground">Pos</label>
              <Input
                type="text"
                value={baseballPlayer.position}
                onChange={(e) => updatePlayer(globalIndex, { position: e.target.value })}
                className="h-8 text-sm"
                placeholder="SS"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">H</label>
              <Input
                type="number"
                min="0"
                value={baseballPlayer.hits}
                onChange={(e) => updatePlayer(globalIndex, { hits: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">HR</label>
              <Input
                type="number"
                min="0"
                value={baseballPlayer.homeRuns}
                onChange={(e) => updatePlayer(globalIndex, { homeRuns: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">RBI</label>
              <Input
                type="number"
                min="0"
                value={baseballPlayer.rbis}
                onChange={(e) => updatePlayer(globalIndex, { rbis: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">R</label>
              <Input
                type="number"
                min="0"
                value={baseballPlayer.runs}
                onChange={(e) => updatePlayer(globalIndex, { runs: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">AB</label>
              <Input
                type="number"
                min="0"
                value={baseballPlayer.atBats}
                onChange={(e) => updatePlayer(globalIndex, { atBats: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">K</label>
              <Input
                type="number"
                min="0"
                value={baseballPlayer.strikeOuts}
                onChange={(e) => updatePlayer(globalIndex, { strikeOuts: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">BB</label>
              <Input
                type="number"
                min="0"
                value={baseballPlayer.walks}
                onChange={(e) => updatePlayer(globalIndex, { walks: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
          </div>
        );

      case 'tennis':
        const tennisPlayer = player as TennisPlayer;
        return (
          <div className="flex items-end gap-4 mt-2">
            <div>
              <label className="text-xs text-muted-foreground">Sets Won</label>
              <Input
                type="number"
                min="0"
                max="3"
                value={tennisPlayer.setsWon}
                onChange={(e) => updatePlayer(globalIndex, { setsWon: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm w-20"
              />
            </div>
            <label className="flex items-center gap-2 text-sm pb-2">
              <input
                type="checkbox"
                checked={tennisPlayer.isWinner}
                onChange={(e) => updatePlayer(globalIndex, { isWinner: e.target.checked })}
                className="rounded"
              />
              Winner
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  // Render player list for a team
  const renderTeamPlayers = (teamPlayers: Player[], teamName: string, teamType: 'home' | 'away') => (
    <div className="space-y-2">
      <h4 className="font-medium text-sm flex items-center gap-2">
        <span className={teamType === 'home' ? 'text-blue-400' : 'text-red-400'}>
          {teamName}
        </span>
        <span className="text-muted-foreground">({teamPlayers.length} players)</span>
      </h4>
      {teamPlayers.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No players added</p>
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
                className="p-3 rounded-lg bg-secondary/30 border border-border"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={player.name}
                      onChange={(e) => updatePlayer(globalIndex, { name: e.target.value })}
                      className="h-8 text-sm w-40 sm:w-48"
                      placeholder="Player name"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePlayer(globalIndex)}
                    className="p-1 hover:bg-destructive/20 rounded text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {renderStatInputs(player, idx)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full"
        >
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-5 w-5" />
            Player Statistics ({players.length} players)
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
            <h4 className="text-sm font-medium mb-3">Add Player Manually</h4>
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

          {/* Players by Team */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderTeamPlayers(homePlayers, homeTeamName || 'Home Team', 'home')}
            {renderTeamPlayers(awayPlayers, awayTeamName || 'Away Team', 'away')}
          </div>

          {/* Stats Legend */}
          <div className="text-xs text-muted-foreground border-t border-border pt-4">
            <span className="font-medium">Legend: </span>
            {sportType === 'soccer' && '🟨 Yellow Card • 🟥 Red Card'}
            {sportType === 'basketball' && 'Pts = Points • Reb = Rebounds • Ast = Assists • Stl = Steals • Blk = Blocks • TO = Turnovers'}
            {sportType === 'baseball' && 'H = Hits • HR = Home Runs • RBI = Runs Batted In • R = Runs • AB = At Bats • K = Strikeouts • BB = Walks'}
            {sportType === 'tennis' && 'Sets Won • Winner checkbox'}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default PlayerStatsEditor;

