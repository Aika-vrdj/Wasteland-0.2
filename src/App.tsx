import React, { useEffect, useState } from 'react';
import { Coins, Terminal } from 'lucide-react';
import { Inventory } from './components/Inventory';
import { CodeRedemption } from './components/CodeRedemption';
import { GachaSystem } from './components/GachaSystem';
import { LevelProgress } from './components/LevelProgress';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';
import { Collectible, InventoryItem, PlayerStats } from './types';

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

  const handleSignOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
  } else {
    setSession(null); // Clear session from the state
    console.log('Signed out successfully');
  }
};

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

        // Load inventory with collectible details
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
      } catch (error) {
        console.error('Error loading player data:', error);
      }
    }

    loadPlayerData();
  }, [session]);

  const addToInventory = async (collectible: Collectible) => {
    if (!session?.user?.id) return;

    try {
      const { data: existingItems } = await supabase
        .from('player_inventory')
        .select('quantity')
        .eq('player_id', session.user.id)
        .eq('collectible_id', collectible.id);

      const existingItem = existingItems?.[0];

      if (existingItem) {
        await supabase
          .from('player_inventory')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('player_id', session.user.id)
          .eq('collectible_id', collectible.id);

        setInventory(current =>
          current.map(item =>
            item.collectible.id === collectible.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        const { data: newItem } = await supabase
          .from('player_inventory')
          .insert({
            player_id: session.user.id,
            collectible_id: collectible.id,
            quantity: 1
          })
          .select('quantity, acquired_at')
          .single();

        if (newItem) {
          setInventory(current => [...current, {
            collectible,
            quantity: newItem.quantity,
            acquiredAt: new Date(newItem.acquired_at)
          }]);
        }
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  const handleCodeRedeem = (amount: number) => {
    setRebelPoints(current => current + amount);
  };

  const handleGachaRoll = async (item: Collectible, xpGained: number) => {
    if (!session?.user?.id) return;

    try {
      await supabase.rpc('update_player_stats', {
        p_id: session.user.id,
        rp_change: -10,
        xp_gained: xpGained
      });

      setRebelPoints(current => current - 10);
      await addToInventory(item);
      
      setStats(current => {
        let newXP = current.xp + xpGained;
        let newLevel = current.level;
        let newXPNeeded = current.level * 100;

        while (newXP >= newXPNeeded) {
          newXP -= newXPNeeded;
          newLevel++;
          newXPNeeded = newLevel * 100;
        }

        return {
          level: newLevel,
          xp: newXP,
          xpNeeded: newXPNeeded
        };
      });
    } catch (error) {
      console.error('Error updating player stats:', error);
    }
  };

  const handleSellItem = async (item: InventoryItem) => {
    if (!session?.user?.id) return;

    const rpGain = item.collectible.rarity === 'legendary' ? 200 :
                   item.collectible.rarity === 'rare' ? 50 :
                   item.collectible.rarity === 'uncommon' ? 10 : 5;

    try {
      if (item.quantity > 1) {
        await supabase
          .from('player_inventory')
          .update({ quantity: item.quantity - 1 })
          .eq('player_id', session.user.id)
          .eq('collectible_id', item.collectible.id);

        setInventory(current =>
          current.map(invItem =>
            invItem.collectible.id === item.collectible.id
              ? { ...invItem, quantity: invItem.quantity - 1 }
              : invItem
          )
        );
      } else {
        await supabase
          .from('player_inventory')
          .delete()
          .eq('player_id', session.user.id)
          .eq('collectible_id', item.collectible.id);

        setInventory(current =>
          current.filter(invItem => invItem.collectible.id !== item.collectible.id)
        );
      }

      await supabase
        .from('players')
        .update({ rebel_points: rebelPoints + rpGain })
        .eq('id', session.user.id);

      setRebelPoints(current => current + rpGain);
    } catch (error) {
      console.error('Error selling item:', error);
    }
  };

  if (!session) {
    return <Auth />;
  }

 return (
  <div className="min-h-screen bg-black p-6">
    <div className="max-w-7xl mx-auto space-y-6">
     <pre
  className="text-center text-sm leading-4 text-green-400 mt-2"
  style={{ whiteSpace: "pre-wrap" }}
>
  {`
    ██╗    ██╗ █████╗ ███████╗████████╗███████╗██╗      █████╗ ███╗   ██╗██████╗ 
    ██║    ██║██╔══██╗██╔════╝╚══██╔══╝██╔════╝██║     ██╔══██╗████╗  ██║██╔══██╗
    ██║ █╗ ██║███████║███████╗   ██║   █████╗  ██║     ███████║██╔██╗ ██║██║  ██║
    ██║███╗██║██╔══██║╚════██║   ██║   ██╔══╝  ██║     ██╔══██║██║╚██╗██║██║  ██║
    ╚███╔███╔╝██║  ██║███████║   ██║   ███████╗███████╗██║  ██║██║ ╚████║██████╔╝
     ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ 
              by Aika Ioka, version 0.2, `}
    <a
      href="https://aikavrdj.com"
      target="_blank"
      rel="noopener noreferrer"
      className="text-green-500 underline hover:text-green-300"
    >
      aikavrdj.com
    </a>
    {' | '}
    <a
      href="https://aikavrdj.com/pages/donate"
      target="_blank"
      rel="noopener noreferrer"
      className="text-green-500 underline hover:text-green-300"
    >
      donate
    </a>
</pre>
            <div className="flex justify-between items-center mb-4">
        {lastSignIn && (
          <p className="text-green-500/60 text-sm">
            Last Sign-in: {new Date(lastSignIn).toLocaleDateString()}
          </p>
        )}
        <button
          onClick={handleSignOut}
          className="text-green-500 hover:text-green-300 underline decoration-dotted transition"
        >
          Sign Out
        </button>
      </div>
      <p className="text-center text-sm text-green-400">
        Join our <a 
          href="https://discord.com/invite/uqkvuMDTkf" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-green-500 underline hover:text-green-300"
        >
          discord community
        </a> for codes.
      </p>
      {lastSignIn && (
        <div className="text-green-500/60 text-sm">
          Last Sign-in: {new Date(lastSignIn).toLocaleDateString()}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CodeRedemption onRedeem={handleCodeRedeem} />
        <LevelProgress stats={stats} />
      </div>
      <GachaSystem rebelPoints={rebelPoints} onRoll={handleGachaRoll} />
      <Inventory items={inventory} onSellItem={handleSellItem} />
    </div>
  </div>
)}

