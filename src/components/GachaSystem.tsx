import React, { useState } from 'react';
import { Sparkles, Coins } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sfx } from '../lib/sfx';
import { Collectible } from '../types';
import { ParticleBurst } from './ParticleBurst';
import { RedeemCodeModal } from './RedeemCodeModal';

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

const RARITY_COLOR: Record<string, string> = {
  common: '#8A8378',
  uncommon: '#D97A34',
  rare: '#3FB8AF',
  legendary: '#E8B23D'
};

export function GachaSystem({ rebelPoints, onRollResult }: GachaSystemProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pulledItem, setPulledItem] = useState<Collectible | null>(null);
  const [burstTrigger, setBurstTrigger] = useState(0);
  const [showCodeModal, setShowCodeModal] = useState(false);

  const handleRoll = async () => {
    if (rebelPoints < ROLL_COST || isRolling) return;
    setIsRolling(true);
    setError(null);
    setPulledItem(null);
    sfx.click();

    try {
      // The roll itself — rarity, item choice, cost deduction, XP/level —
      // all happens server-side in perform_gacha_roll(). The client never
      // decides the outcome or supplies point/XP values.
      const { data, error: rpcError } = await supabase.rpc('perform_gacha_roll');

      if (rpcError) {
        setError(rpcError.message);
        sfx.error();
        return;
      }

      const result = data as GachaRollResult;
      if (!result.success) {
        setError(result.error ?? 'Roll failed');
        sfx.error();
        return;
      }

      onRollResult(result);
      setPulledItem(result.item ?? null);
      if (result.item) {
        sfx.reveal(result.item.rarity);
        setBurstTrigger(t => t + 1);
      }
    } finally {
      setIsRolling(false);
      setTimeout(() => setError(null), 3000);
    }
  };

  const rarityColor = pulledItem ? RARITY_COLOR[pulledItem.rarity] : RARITY_COLOR.common;

  return (
    <div className="terminal-border bg-void p-6 rounded">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="text-ash" />
          <h2 className="text-2xl text-ash">SCRAPTRAK&trade; MK. II</h2>
        </div>
        <div className="flex items-center gap-2">
          <Coins className="text-gold" />
          <span className="font-semibold text-gold">{rebelPoints} RP</span>
        </div>
      </div>
      <p className="text-xs text-ash-dim mb-6">batteries not included. hope not guaranteed.</p>

      {/* Reveal window — shows the last pull, with a rarity-colored particle burst */}
      <div
        className="relative overflow-hidden rounded border mb-6 flex items-center justify-center text-center"
        style={{
          minHeight: 140,
          borderColor: pulledItem ? rarityColor : '#1f2937',
          background: '#0a0a0a'
        }}
      >
        <ParticleBurst trigger={burstTrigger} color={rarityColor} />
        {!pulledItem && (
          <p className="text-ash-dim/60 text-sm font-mono px-4">sweep idle</p>
        )}
        {pulledItem && (
          <div className="p-4 flex flex-col items-center gap-2">
            <img
              src={pulledItem.image_url}
              alt={pulledItem.name}
              className="h-20 w-20 object-contain"
            />
            <div
              className="text-xs uppercase tracking-widest px-2 py-0.5 rounded border"
              style={{ color: rarityColor, borderColor: rarityColor }}
            >
              {pulledItem.rarity}
            </div>
            <p className="font-semibold text-rust">{pulledItem.name}</p>
            <p className="text-ash/70 text-sm max-w-xs">{pulledItem.description}</p>
            {pulledItem.type === 'cupon' && (
              <button
                onClick={() => setShowCodeModal(true)}
                onMouseEnter={() => sfx.hover()}
                className="mt-1 terminal-button px-4 py-1.5 rounded text-sm"
              >
                Claim code
              </button>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleRoll}
        onMouseEnter={() => sfx.hover()}
        disabled={rebelPoints < ROLL_COST || isRolling}
        className="terminal-button px-6 py-3 rounded flex items-center gap-2 mx-auto"
      >
        <Sparkles size={20} />
        {isRolling ? 'Sweeping...' : 'Sweep for junk'}
      </button>
      <p className="text-center text-xs text-ash-dim mt-2">costs {ROLL_COST} RP · what you find is decided back at base, not by this rusty thing</p>

      {error && (
        <p className="mt-3 text-center text-ember text-sm font-mono">{error}</p>
      )}

      {showCodeModal && pulledItem && (
        <RedeemCodeModal
          collectibleId={pulledItem.id}
          itemName={pulledItem.name}
          onClose={() => setShowCodeModal(false)}
        />
      )}
    </div>
  );
}
