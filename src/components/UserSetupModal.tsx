import React, { useState } from 'react';
import { User, Radio, Link2, Save, X } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

export function UserSetupModal({ isOpen, onClose, initialData }: any) {
  const [username, setUsername] = useState(initialData?.username || '');
  const [kick, setKick] = useState(initialData?.kick_username || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('players')
      .update({
        username: username,
        kick_username: kick
      })
      .eq('id', user?.id);

    setLoading(false);
    if (!error) onClose();
    else alert("Error al actualizar la terminal.");
  };

  const connectDiscord = async () => {
    // Esto vincula Discord a la cuenta actual
    await supabase.auth.linkIdentity({
      provider: 'discord',
      options: { redirectTo: window.location.href }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="terminal-border bg-black border-2 border-green-500 p-8 rounded-lg max-w-md w-full shadow-[0_0_20px_rgba(34,197,94,0.4)]">
        
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-green-500 tracking-tighter">
            {">"} IDENTIFICATION_REQUIRED
          </h2>
          {initialData?.username && (
            <button onClick={onClose} className="text-green-500 hover:text-red-500">
              <X size={20} />
            </button>
          )}
        </div>

        <p className="text-green-500/70 text-sm mb-8 leading-tight">
          Rebel detected. Update your Codename and link your social accounts for integrations and more.
        </p>

        <div className="space-y-6">
          {/* CODENAME */}
          <div>
            <label className="block text-green-500 text-xs uppercase mb-2 font-bold">Codename (In-Game)</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-green-500/50" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-green-500/5 border border-green-500/50 rounded py-2 pl-10 pr-4 text-green-500 focus:outline-none focus:border-green-400"
                placeholder="Ej: Scavenger_01"
              />
            </div>
          </div>

          {/* KICK */}
          <div>
            <label className="block text-green-500 text-xs uppercase mb-2 font-bold">Kick Channel</label>
            <div className="relative">
              <Radio className="absolute left-3 top-2.5 text-green-500/50" size={18} />
              <input
                type="text"
                value={kick}
                onChange={(e) => setKick(e.target.value)}
                className="w-full bg-green-500/5 border border-green-500/50 rounded py-2 pl-10 pr-4 text-green-500 focus:outline-none focus:border-green-400"
                placeholder="Kick username"
              />
            </div>
          </div>

          {/* DISCORD */}
          <div>
            <label className="block text-green-500 text-xs uppercase mb-2 font-bold">Discord Uplink</label>
            <button
              onClick={connectDiscord}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded border transition-all font-bold ${
                initialData?.discord_id 
                ? 'border-green-500 bg-green-500/20 text-green-500' 
                : 'border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2]/10'
              }`}
            >
              <FaDiscord size={20} />
              {initialData?.discord_id ? 'IDENTIDAD VINCULADA' : 'VINCULAR DISCORD'}
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={loading || !username}
            className="w-full bg-green-500 text-black py-3 rounded font-black uppercase tracking-widest hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            <Save size={18} />
            {loading ? 'SYNCING...' : 'CONFIRM IDENTITY'}
          </button>
        </div>
      </div>
    </div>
  );
}
