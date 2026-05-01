import React, { useState } from 'react';
import { User, Radio, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

// He añadido la prop onUpdate por si la estás usando para refrescar los datos en App.tsx
export function UserSetupModal({ isOpen, onClose, initialData, onUpdate }: any) {
  const [username, setUsername] = useState(initialData?.username || '');
  const [kick, setKick] = useState(initialData?.kick_id || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('players')
      .update({
        username: username,
        kick_id: kick
      })
      .eq('id', user?.id);

    setLoading(false);
    
    if (!error) {
      if (onUpdate) onUpdate(); // Refresca la UI principal si la función existe
      onClose();
    } else {
      alert("Error updating terminal.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="terminal-border bg-black border-2 border-green-500 p-8 rounded-lg max-w-md w-full shadow-[0_0_20px_rgba(34,197,94,0.4)]">
        
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-green-500 tracking-tighter">
            {">"} IDENTIFICATION_REQUIRED
          </h2>
          {/* Si ya tiene un username, le permitimos cerrar el modal sin guardar */}
          {initialData?.username && (
            <button onClick={onClose} className="text-green-500 hover:text-red-500 transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        <p className="text-green-500/70 text-sm mb-8 leading-tight">
          Rebel detected. Update your Codename and provide your Kick ID to receive rewards and broadcast your progress in the wasteland.
        </p>

        <div className="space-y-6">
          {/* CODENAME */}
          <div>
            <label className="block text-green-500 text-xs uppercase mb-2 font-bold tracking-widest">
              Codename (In-Game)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-green-500/50" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-green-500/5 border border-green-500/50 rounded py-2 pl-10 pr-4 text-green-500 focus:outline-none focus:border-green-400 transition-all"
                placeholder="E.g.: Scavenger_01"
              />
            </div>
          </div>

          {/* KICK */}
          <div>
            <label className="block text-green-500 text-xs uppercase mb-2 font-bold tracking-widest">
              Kick Channel ID
            </label>
            <div className="relative">
              <Radio className="absolute left-3 top-2.5 text-green-500/50" size={18} />
              <input
                type="text"
                value={kick}
                onChange={(e) => setKick(e.target.value)}
                className="w-full bg-green-500/5 border border-green-500/50 rounded py-2 pl-10 pr-4 text-green-500 focus:outline-none focus:border-green-400 transition-all"
                placeholder="Your Kick username"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={loading || !username.trim()}
              className="w-full bg-green-500 text-black py-3 rounded font-black uppercase tracking-widest hover:bg-green-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              <Save size={18} />
              {loading ? 'SYNCING...' : 'CONFIRM IDENTITY'}
            </button>
            {!username.trim() && (
              <p className="text-[10px] text-red-500/80 mt-2 text-center uppercase tracking-tighter">
                * Codename is mandatory for database entry
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
