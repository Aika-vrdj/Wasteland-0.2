import React from 'react';
import { Trophy } from 'lucide-react';
import { PlayerStats } from '../types';

interface LevelProgressProps {
  stats: PlayerStats;
}

export function LevelProgress({ stats }: LevelProgressProps) {
  const progressPercentage = (stats.xp / stats.xpNeeded) * 100;

  return (
    <div className="terminal-border bg-black p-4 rounded">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-green-500" />
        <div>
          <h2 className="text-xl font-bold text-green-500">LEVEL {stats.level}</h2>
          <p className="text-sm text-green-500/60">
            {stats.xp} / {stats.xpNeeded} XP
          </p>
        </div>
      </div>

      <div className="w-full h-4 progress-bar rounded-full overflow-hidden">
        <div
          className="h-full progress-bar-fill transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}