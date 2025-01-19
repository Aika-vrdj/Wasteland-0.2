import React, { useEffect, useState } from 'react';
import { Sparkles, Coins } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Collectible } from '../types';

interface GachaSystemProps {
  rebelPoints: number;
  onRoll: (item: Collectible, xpGained: number) => void;
}

export function GachaSystem({ rebelPoints, onRoll }: GachaSystemProps) {
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const ROLL_COST = 10;

  useEffect(() => {
    loadCollectibles();
  }, []);

  const loadCollectibles = async () => {
    const { data, error } = await supabase
      .from('collectibles')
      .select('*');
    
    if (error) {
      console.error('Error loading collectibles:', error);
      return;
    }

    setCollectibles(data);
  };

  const getRandomItem = (items: Collectible[]) => {
    return items[Math.floor(Math.random() * items.length)];
  };

  const handleRoll = async () => {
    if (rebelPoints < ROLL_COST || isRolling) return;
    setIsRolling(true);

    try {
      const rand = Math.random();
      let item;
      
      if (rand < 0.03) {
        const legendaryItems = collectibles.filter(c => c.rarity === 'legendary');
        item = getRandomItem(legendaryItems);
      } else if (rand < 0.12) {
        const rareItems = collectibles.filter(c => c.rarity === 'rare');
        item = getRandomItem(rareItems);
      } else if (rand < 0.30) {
        const uncommonItems = collectibles.filter(c => c.rarity === 'uncommon');
        item = getRandomItem(uncommonItems);
      } else {
        const commonItems = collectibles.filter(c => c.rarity === 'common');
        item = getRandomItem(commonItems);
      }

      const xpGained = item?.rarity === 'legendary' ? 20 :
                      item?.rarity === 'rare' ? 10 :
                      item?.rarity === 'uncommon' ? 5 : 1;

      if (item) {
        onRoll(item, xpGained);
      }
    } finally {
      setIsRolling(false);
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
        Scout and scavenge ({ROLL_COST} RP)
      </button>
    </div>
  );
}
