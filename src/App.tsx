import React, { useEffect, useState } from 'react';
import { Coins, Terminal } from 'lucide-react';
import { Inventory } from './components/Inventory';
import { CodeRedemption } from './components/CodeRedemption';
import { GachaSystem } from './components/GachaSystem';
import { LevelProgress } from './components/LevelProgress';
import { AccountLinks } from './components/AccountLinks';
import { Auth } from './components/Auth';
import { UserSetupModal } from './components/UserSetupModal'; // <-- IMPORTANTE: Crea este archivo con el código anterior
import { supabase } from './lib/supabase';
import { Collectible, InventoryItem, PlayerStats } from './types';

export default function App() {
  const [session, setSession] = useState(null);
  const [rebelPoints, setRebelPoints] = useState(100);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lastSignIn, setLastSignIn] = useState<string | null>(null);
  const [discordId, setDiscordId] = useState<string | null>(null);
  const [discordUsername, setDiscordUsername] = useState<string | null>(null);
  const [kickId, setKickId] = useState<string | null>(null);
  const [kickUsername, setKickUsername] = useState<string | null>(null);
  
  // --- NUEVOS ESTADOS PARA EL PERFIL ---
  const [showSetup, setShowSetup] = useState(false);
  const [fullPlayerData, setFullPlayerData] = useState<any>(null);
  
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
      setSession(null);
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

  // Función para recargar datos (la sacamos para poder usarla tras el update del modal)
  const loadPlayerData = async () => {
    if (!session?.user?.id) return;

    try {
      const { data: playerData } = await supabase
        .from('players')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (playerData) {
        setFullPlayerData(playerData); // Guardamos todo para el modal
        setRebelPoints(playerData.rebel_points);
        setStats({
          level: playerData.level,
          xp: playerData.xp,
          xpNeeded: playerData.level * 100
        });
        setLastSignIn(playerData.last_sign_in);
        setDiscordId(playerData.discord_id);
        setDiscordUsername(playerData.discord_username);
        setKickId(playerData.kick_id);
        setKickUsername(playerData.kick_username);

        // --- LÓGICA DE ACTIVACIÓN DEL POPUP ---
        // Si no tiene username, obligamos a que abra la terminal de identidad
        if (!playerData.username) {
          setShowSetup(true);
        }
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
            rarity,
            type
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
  };

  useEffect(() => {
    loadPlayerData();
  }, [session]);

  // If the browser just came back from a Discord linkIdentity() redirect,
  // Supabase has already created the verified identity — this just copies
  // it onto the player row via the server-side RPC (never trusts the
  // client for the actual Discord id/username).
  useEffect(() => {
    if (!session?.user?.id || discordId) return;

    supabase.auth.getUserIdentities().then(({ data }) => {
      const hasDiscord = data?.identities?.some(i => i.provider === 'discord');
      if (!hasDiscord) return;

      supabase.rpc('sync_discord_identity').then(({ data: result, error }) => {
        if (error) {
          console.error('Error syncing Discord identity:', error.message);
          return;
        }
        if (result?.success) {
          setDiscordId(result.discord_id);
          setDiscordUsername(result.discord_username);
        }
      });
    });
  }, [session, discordId]);

  // Handles the redirect back from Kick's OAuth screen. The actual token
  // exchange happens on Cerebro (needs the client secret, can't live in
  // the browser) — this just forwards the code/verifier and reflects
  // whatever Cerebro reports back.
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!code || !state || !session?.access_token) return;

    const expectedState = sessionStorage.getItem('kick_oauth_state');
    const verifier = sessionStorage.getItem('kick_pkce_verifier');
    sessionStorage.removeItem('kick_oauth_state');
    sessionStorage.removeItem('kick_pkce_verifier');

    // Always strip the OAuth params from the URL, success or not, so a
    // refresh doesn't replay a used code.
    window.history.replaceState({}, '', window.location.pathname);

    if (state !== expectedState || !verifier) {
      console.error('Kick OAuth state mismatch — ignoring callback');
      return;
    }

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kick-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ code, code_verifier: verifier })
    })
      .then(res => res.json())
      .then(result => {
        if (result?.success) {
          setKickId(result.kick_id);
          setKickUsername(result.kick_username);
        } else {
          console.error('Error linking Kick account:', result?.error);
        }
      })
      .catch(err => console.error('Error linking Kick account:', err));
  }, [session]);

  const handleCodeRedeem = (amount: number) => {
    setRebelPoints(current => current + amount);
  };

  // perform_gacha_roll() already did everything server-side: validated the
  // cost, rolled the rarity/item, updated rebel_points/xp/level, and wrote
  // the inventory row. This just reflects that result into local state —
  // it never computes or trusts a client-side outcome.
  const handleGachaRollResult = (result: {
    success: boolean;
    error?: string;
    item?: Collectible;
    new_rebel_points?: number;
    new_level?: number;
    new_xp?: number;
  }) => {
    if (!result.success || !result.item) return;

    setRebelPoints(result.new_rebel_points!);
    setStats(current => ({
      level: result.new_level!,
      xp: result.new_xp!,
      xpNeeded: result.new_level! * 100
    }));

    setInventory(current => {
      const existing = current.find(i => i.collectible.id === result.item!.id);
      if (existing) {
        return current.map(i =>
          i.collectible.id === result.item!.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...current, {
        collectible: result.item!,
        quantity: 1,
        acquiredAt: new Date()
      }];
    });
  };

  // sell_collectible() already validated ownership and looked up the real
  // payout server-side. This just reflects the result.
  const handleSellResult = (collectibleId: string, result: {
    success: boolean;
    error?: string;
    rp_gained?: number;
    new_rebel_points?: number;
    remaining_quantity?: number;
  }) => {
    if (!result.success) {
      console.error('Error selling item:', result.error);
      return;
    }

    setRebelPoints(result.new_rebel_points!);

    setInventory(current => {
      if (!result.remaining_quantity) {
        return current.filter(i => i.collectible.id !== collectibleId);
      }
      return current.map(i =>
        i.collectible.id === collectibleId
          ? { ...i, quantity: result.remaining_quantity! }
          : i
      );
    });
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-void p-6">
      {/* --- EL POPUP DE IDENTIFICACIÓN --- */}
      <UserSetupModal 
        isOpen={showSetup} 
        onClose={() => setShowSetup(false)} 
        initialData={fullPlayerData}
        onUpdate={loadPlayerData} // Recargamos datos al guardar
      />

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="scav-panel scav-rivets p-6 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent, transparent 38px, rgba(232,178,61,0.06) 38px, rgba(232,178,61,0.06) 40px)'
            }}
          />
          <div className="relative">
            <p className="text-xs tracking-widest text-rust mb-1">SCAVENGER OUTPOST // UNIT OPERATOR: AIKA</p>
            <h1 className="text-3xl text-ash">
              <span className="text-ember">WASTE</span>LAND SCANNER
            </h1>
            <p className="text-center text-sm text-ash-dim mt-3">
              by Aika Ioka, version 0.2 —{' '}
              <a href="https://aikavrdj.com" target="_blank" rel="noopener noreferrer" className="text-ash underline hover:text-rust">
                aikavrdj.com
              </a>
              {' | '}
              <a href="https://aikavrdj.com/pages/donate" target="_blank" rel="noopener noreferrer" className="text-ash underline hover:text-rust">
                donate
              </a>
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            {lastSignIn && (
              <p className="text-ash-dim text-sm">
                Last Sign-in: {new Date(lastSignIn).toLocaleDateString()}
              </p>
            )}
            {/* BOTÓN PARA ABRIR EL PERFIL MANUALMENTE */}
            <button 
              onClick={() => setShowSetup(true)}
              className="text-left text-xs text-ash-dim/50 hover:text-ash uppercase tracking-widest mt-1"
            >
              [ EDIT_PROFILE_TERMINAL ]
            </button>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleSignOut}
              className="text-ash hover:text-rust underline decoration-dotted transition"
            >
              Sign Out
            </button>
            <a
              href="https://wastlandleaderboard.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ash hover:text-rust underline decoration-dotted transition ml-4"
            >
              Leaderboard
            </a>
          </div>
        </div>

        <p className="text-center text-sm text-ash">
          Join our <a
            href="https://discord.com/invite/uqkvuMDTkf" 
            className="text-ash underline hover:text-rust"
          >
            discord community
          </a> for codes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CodeRedemption onRedeem={handleCodeRedeem} />
          <LevelProgress stats={stats} />
        </div>
        <AccountLinks
          discordId={discordId}
          discordUsername={discordUsername}
          kickId={kickId}
          kickUsername={kickUsername}
        />
        <GachaSystem rebelPoints={rebelPoints} onRollResult={handleGachaRollResult} />
        <Inventory items={inventory} onSellResult={handleSellResult} />
      </div>
    </div>
  );
}
