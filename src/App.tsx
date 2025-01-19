import React, { useEffect, useState } from 'react';
import { Coins, Terminal } from 'lucide-react';
import { Inventory } from './components/Inventory';
import { CodeRedemption } from './components/CodeRedemption';
import { GachaSystem } from './components/GachaSystem';
import { LevelProgress } from './components/LevelProgress';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';
import { Collectible, InventoryItem, PlayerStats } from './types';
import { BadgeViewer } from './components/BadgeViewer'; // New BadgeViewer Component

export default function App() {
  const [session, setSession] = useState(null);
  const [rebelPoints, setRebelPoints] = useState(100);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lastSignIn, setLastSignIn] = useState<string | null>(null);
  const [stats, setStats] = useState<PlayerStats>({
    level: 1,
    xp: 0,
    xpNeeded: 100
  });
  const [badges, setBadges] = useState<string[]>([]); // State to track earned badges

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function loadPlayerData() {
      if (!session?.user?.id) return;

      try {
        const { data: playerData } = await supabase
          .from('players')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (playerData) {
          setRebelPoints(playerData.rebel_points);
          setStats({
            level: playerData.level,
            xp: playerData.xp,
            xpNeeded: playerData.level * 100
          });
          setLastSignIn(playerData.last_sign_in);
        }

        const { data: inventoryData } = await supabase
          .from('player_inventory')
          .select(`
            quantity,
            acquired_at,
            collectible:collectible_id (
              id,
              name,
              description,
              image_url,
              rarity
            )
          `)
          .eq('player_id', session.user.id);

        if (inventoryData) {
          const items = inventoryData.map(item => ({
            collectible: item.collectible,
            quantity: item.quantity,
            acquiredAt: new Date(item.acquired_at)
          }));
          setInventory(items);
        }

        // Check badges
        const { data: collectibles } = await supabase
          .from('collectibles')
          .select('id, rarity, type');
        if (collectibles) {
          const inventoryIds = inventoryData.map(item => item.collectible.id);
          const earnedBadges: string[] = [];

          // Check for badge criteria
          const raritySet = new Set(collectibles.map(c => c.rarity));
          const typeSet = new Set(collectibles.map(c => c.type));

          if (
            [...raritySet].every(rarity =>
              inventoryData.some(item => item.collectible.rarity === rarity)
            )
          ) {
            earnedBadges.push('All Rarities');
          }

          if (
            [...typeSet].every(type =>
              inventoryData.some(item => item.collectible.type === type)
            )
          ) {
            earnedBadges.push('All Types');
          }

          setBadges(earnedBadges);
        }
      } catch (error) {
        console.error('Error loading player data:', error);
      }
    }

    loadPlayerData();
  }, [session]);

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <pre
          className="text-center text-sm leading-4 text-green-400 mt-2"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {`
          ██╗    ██╗ █████╗ ███████╗████████╗███████╗██╗      █████╗ ███╗   ██╗██████╗ 
          ██║    ██║██╔══██╗██╔════╝╚══██╔══╝██╔════╝██║     ██╔══██╗████╗  ██║██╔══██╗
          ██║ █╗ ██║███████║███████╗   ██║   █████╗  ██║     ███████║██╔██╗ ██║██║  ██║
          ██║███╗██║██╔══██║╚════██║   ██║   ██╔══╝  ██║     ██╔══██║██║╚██╗██║██║  ██║
          ╚███╔███╔╝██║  ██║███████║   ██║   ███████╗███████╗██║  ██║██║ ╚████║██████╔╝
           ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ 
                    by Aika Ioka, version 0.2, aikavrdj.com
        `}
        </pre>
        {lastSignIn && (
          <div className="text-green-500/60 text-sm">
            Last Sign-in: {new Date(lastSignIn).toLocaleDateString()}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CodeRedemption onRedeem={amount => setRebelPoints(rebelPoints + amount)} />
          <LevelProgress stats={stats} />
        </div>
        <GachaSystem rebelPoints={rebelPoints} onRoll={() => {}} />
        <Inventory items={inventory} onSellItem={() => {}} />
        <BadgeViewer badges={badges} /> {/* Add BadgeViewer */}
      </div>
    </div>
  );
}
