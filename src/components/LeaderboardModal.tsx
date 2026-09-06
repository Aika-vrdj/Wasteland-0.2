import React, { useEffect, useState } from 'react';
import { X, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeaderboardRow {
  player_id: string;
  username: string;
  level: number;
  xp: number;
  total_items: number;
  medal_food: boolean;
  medal_gear: boolean;
  medal_useless: boolean;
  medal_common: boolean;
  medal_uncommon: boolean;
  medal_rare: boolean;
  medal_legendary: boolean;
}

interface LeaderboardModalProps {
  onClose: () => void;
}

const MEDALS: { key: keyof LeaderboardRow; label: string; color: string }[] = [
  { key: 'medal_food', label: 'FOOD', color: '#D97A34' },
  { key: 'medal_gear', label: 'GEAR', color: '#D97A34' },
  { key: 'medal_useless', label: 'JUNK', color: '#D97A34' },
  { key: 'medal_common', label: 'C', color: '#8A8378' },
  { key: 'medal_uncommon', label: 'U', color: '#D97A34' },
  { key: 'medal_rare', label: 'R', color: '#3FB8AF' },
  { key: 'medal_legendary', label: 'L', color: '#E8B23D' },
];

export function LeaderboardModal({ onClose }: LeaderboardModalProps) {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('player_leaderboard')
      .select('*')
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else {
          setRows(data ?? []);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div className="fixed inset-0 bg-void/90 flex items-center justify-center z-50 p-4">
      <div className="scav-panel p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-ash-dim hover:text-ash">
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Trophy className="text-gold" />
          <h2 className="text-2xl text-ash">SCAVENGER RANKINGS</h2>
        </div>
        <p className="text-xs text-ash-dim mb-5">
          ranked by level, then XP · medals mark a fully cataloged type or rarity
        </p>

        {loading && <p className="text-ash-dim text-sm font-mono">loading rankings...</p>}
        {error && <p className="text-ember text-sm font-mono">{error}</p>}

        {!loading && !error && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ash-dim text-xs uppercase tracking-wider border-b border-ash-dim/20">
                <th className="py-2 pr-3">Rank</th>
                <th className="py-2 pr-3">Scavenger</th>
                <th className="py-2 pr-3">Level</th>
                <th className="py-2 pr-3">XP</th>
                <th className="py-2 pr-3">Items</th>
                <th className="py-2">Medals</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.player_id} className="border-b border-ash-dim/10">
                  <td className="py-2 pr-3 text-ash font-display font-semibold">#{i + 1}</td>
                  <td className="py-2 pr-3 text-ash">{row.username}</td>
                  <td className="py-2 pr-3 text-ash-dim">{row.level}</td>
                  <td className="py-2 pr-3 text-ash-dim">{row.xp}</td>
                  <td className="py-2 pr-3 text-ash-dim">{row.total_items}</td>
                  <td className="py-2">
                    <div className="flex gap-1 flex-wrap">
                      {MEDALS.map(m => {
                        const earned = Boolean(row[m.key]);
                        return (
                          <span
                            key={m.label}
                            title={m.label}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                            style={{
                              color: earned ? m.color : '#4a4038',
                              borderColor: earned ? m.color : '#2A2320',
                              opacity: earned ? 1 : 0.4
                            }}
                          >
                            {m.label}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !error && rows.length === 0 && (
          <p className="text-ash-dim text-sm font-mono text-center py-8">no scavengers ranked yet</p>
        )}
      </div>
    </div>
  );
}
