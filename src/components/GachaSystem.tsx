import React, { useState } from 'react';
import { Sparkles, Coins } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Collectible } from '../types';

interface GachaRollResult {
  success: boolean;
  error?: string;
  item?: Collectible;
  xp_gained?: number;
  new_rebel_points?: number;
  new_level?: number;
  new_xp?: number;
}

interface GachaSystemProps {
  rebelPoints: number;
  onRollResult: (result: GachaRollResult) => void;
}

const ROLL_COST = 10; // display only — the real cost is enforced by perform_gacha_roll() in Postgres

export function GachaSystem({ rebelPoints, onRollResult }: GachaSystemProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoll = async () => {
    if (rebelPoints < ROLL_COST || isRolling) return;
    setIsRolling(true);
    setError(null);

    try {
      // The roll itself — rarity, item choice, cost deduction, XP/level —
      // all happens server-side in perform_gacha_roll(). The client never
      // decides the outcome or supplies point/XP values.
      const { data, error: rpcError } = await supabase.rpc('perform_gacha_roll');

      if (rpcError) {
        setError(rpcError.message);
        return;
      }

      const result = data as GachaRollResult;
      if (!result.success) {
        setError(result.error ?? 'Roll failed');
        return;
      }

      onRollResult(result);
    } finally {
      setIsRolling(false);
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="terminal-border bg-black p-6 rounded">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="text-green-500" />
          <h2 className="text-2xl font-bold text-green-500">LOOT</h2>
        </div>
        <div className="flex items-center gap-2">
          <Coins className="text-green-500" />
          <span className="font-semibold text-green-500">{rebelPoints} RP</span>
        </div>
      </div>

      <button
        onClick={handleRoll}
        disabled={rebelPoints < ROLL_COST || isRolling}
        className="terminal-button px-6 py-3 rounded flex items-center gap-2 mx-auto"
      >
        <Sparkles size={20} />
        {isRolling ? 'Scouting...' : `Scout and scavenge (${ROLL_COST} RP)`}
      </button>

      {error && (
        <p className="mt-3 text-center text-red-400 text-sm font-mono">{error}</p>
      )}
    </div>
  );
}
