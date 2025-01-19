import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Assuming you have a Supabase client set up

interface CollectionCheckerProps {
  playerId: string;
}

interface Collectible {
  id: string;
  rarity: string;
  type: string;
}

interface InventoryItem {
  collectible_id: string;
  quantity: number;
}

export const CollectionChecker: React.FC<CollectionCheckerProps> = ({ playerId }) => {
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [playerInventory, setPlayerInventory] = useState<string[]>([]);
  const [collectionStatus, setCollectionStatus] = useState<Record<string, boolean>>({
    allRarities: false,
    allFood: false,
    allGear: false,
    allCoupons: false,
    allUseless: false,
  });

  // Fetch collectibles and player inventory
  useEffect(() => {
    const fetchData = async () => {
      // Fetch all collectibles
      const { data: allCollectibles, error: collectiblesError } = await supabase
        .from('collectibles')
        .select('id, rarity, type');

      if (collectiblesError) {
        console.error('Error fetching collectibles:', collectiblesError);
        return;
      }

      setCollectibles(allCollectibles || []);

      // Fetch player inventory
      const { data: inventory, error: inventoryError } = await supabase
        .from('player_inventory')
        .select('collectible_id')
        .eq('player_id', playerId);

      if (inventoryError) {
        console.error('Error fetching player inventory:', inventoryError);
        return;
      }

      setPlayerInventory((inventory || []).map((item: InventoryItem) => item.collectible_id));
    };

    fetchData();
  }, [playerId]);

  // Calculate collection status
  useEffect(() => {
    if (collectibles.length === 0 || playerInventory.length === 0) return;

    const raritySet = new Set<string>();
    const typeSet: Record<string, boolean> = { food: false, gear: false, coupons: false, useless: false };

    // Cross-check player inventory with collectibles
    collectibles.forEach((collectible) => {
      if (playerInventory.includes(collectible.id)) {
        raritySet.add(collectible.rarity);
        typeSet[collectible.type] = true;
      }
    });

    setCollectionStatus({
      allRarities: raritySet.size === 4, // common, uncommon, rare, legendary
      allFood: typeSet.food,
      allGear: typeSet.gear,
      allCoupons: typeSet.coupons,
      allUseless: typeSet.useless,
    });
  }, [collectibles, playerInventory]);

  return (
    <div className="terminal-border bg-black p-6 rounded">
      <h2 className="text-2xl font-bold text-green-500 mb-4">Collection Status</h2>
      <ul className="text-green-500 font-mono">
        <li>
          All Rarities: <span className={collectionStatus.allRarities ? 'text-green-400' : 'text-red-500'}>{collectionStatus.allRarities ? 'Completed' : 'Incomplete'}</span>
        </li>
        <li>
          Picky Eater (All Food): <span className={collectionStatus.allFood ? 'text-green-400' : 'text-red-500'}>{collectionStatus.allFood ? 'Completed' : 'Incomplete'}</span>
        </li>
        <li>
          All Gear: <span className={collectionStatus.allGear ? 'text-green-400' : 'text-red-500'}>{collectionStatus.allGear ? 'Completed' : 'Incomplete'}</span>
        </li>
        <li>
          All Coupons: <span className={collectionStatus.allCoupons ? 'text-green-400' : 'text-red-500'}>{collectionStatus.allCoupons ? 'Completed' : 'Incomplete'}</span>
        </li>
        <li>
          All Useless Items: <span className={collectionStatus.allUseless ? 'text-green-400' : 'text-red-500'}>{collectionStatus.allUseless ? 'Completed' : 'Incomplete'}</span>
        </li>
      </ul>
    </div>
  );
};