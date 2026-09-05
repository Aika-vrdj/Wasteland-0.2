import React, { useState } from 'react';
import { User, Radio, Save, X, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
      if (onUpdate) onUpdate();
      onClose();
    } else {
      alert("Error updating terminal.");
    }
  };

  return (
    <div className="fixed inset-0 bg-void/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="terminal-border bg-void border-2 border-ash p-8 rounded-lg max-w-md w-full shadow-[0_0_20px_rgba(200,30,58,0.35)]">
        
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-ash tracking-tighter">
            {">"} IDENTIFICATION_REQUIRED
          </h2>
          {initialData?.username && (
            <button onClick={onClose} className="text-ash hover:text-ember transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        <p className="text-ash/70 text-sm mb-8 leading-tight">
          Rebel detected. Update your Codename and provide your Kick ID to receive rewards and broadcast your progress.
        </p>

        <div className="space-y-6">
          {/* CODENAME */}
          <div>
            <label className="block text-ash text-xs uppercase mb-2 font-bold tracking-widest">
              Codename (In-Game)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-ash-dim/60" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-ember/5 border border-ash-dim/60 rounded py-2 pl-10 pr-4 text-ash focus:outline-none focus:border-gold transition-all"
                placeholder="E.g.: Scavenger_01"
              />
            </div>
          </div>

          {/* KICK */}
          <div>
            <label className="block text-ash text-xs uppercase mb-2 font-bold tracking-widest">
              Kick Channel ID
            </label>
            <div className="relative">
              <Radio className="absolute left-3 top-2.5 text-ash-dim/60" size={18} />
              <input
                type="text"
                value={kick}
                onChange={(e) => setKick(e.target.value)}
                className="w-full bg-ember/5 border border-ash-dim/60 rounded py-2 pl-10 pr-4 text-ash focus:outline-none focus:border-gold transition-all"
                placeholder="Your Kick username"
              />
            </div>
            {/* --- EL NUEVO LINK DE KICK --- */}
            <div className="mt-2 text-right">
              <a 
                href="https://kick.com/aika_vrdj" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-ash-dim hover:text-gold underline decoration-dotted flex items-center justify-end gap-1 transition-colors uppercase tracking-tighter"
              >
                Not a Kick follower yet? Join the transmission
                <ExternalLink size={10} />
              </a>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={loading || !username.trim()}
              className="w-full bg-ash text-black py-3 rounded font-black uppercase tracking-widest hover:bg-gold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              <Save size={18} />
              {loading ? 'SYNCING...' : 'CONFIRM IDENTITY'}
            </button>
            {!username.trim() && (
              <p className="text-[10px] text-ember/80 mt-2 text-center uppercase tracking-tighter">
                * Codename is mandatory for database entry
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
