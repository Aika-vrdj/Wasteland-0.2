import React, { useEffect, useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sfx } from '../lib/sfx';

interface RedeemCodeModalProps {
  collectibleId: string;
  itemName: string;
  onClose: () => void;
}

export function RedeemCodeModal({ collectibleId, itemName, onClose }: RedeemCodeModalProps) {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    supabase.rpc('get_redeem_code', { p_collectible_id: collectibleId }).then(({ data, error }) => {
      if (cancelled) return;
      if (error || !data?.success) {
        setError(data?.error ?? error?.message ?? 'Could not fetch code');
        return;
      }
      setCode(data.code);
      // Auto-copy as soon as the code arrives — that's the whole point of
      // this popup, per the request: no extra click needed to get it onto
      // the clipboard.
      navigator.clipboard.writeText(data.code).then(() => {
        setCopied(true);
        sfx.copy();
      }).catch(() => {
        // Clipboard API can fail silently (permissions, insecure context)
        // — the code is still visible on screen either way.
      });
    });

    return () => { cancelled = true; };
  }, [collectibleId]);

  const handleCopyAgain = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      sfx.copy();
    });
  };

  return (
    <div className="fixed inset-0 bg-void/80 flex items-center justify-center z-50 p-4">
      <div className="terminal-border bg-void p-6 rounded max-w-sm w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-ash-dim hover:text-gold"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-bold text-ash mb-1">SUPPLY CRATE UNLOCKED</h3>
        <p className="text-ash/70 text-sm mb-4">{itemName}</p>

        {error && (
          <p className="text-ember text-sm font-mono">{error}</p>
        )}

        {!error && !code && (
          <p className="text-ash-dim text-sm font-mono">decrypting code...</p>
        )}

        {code && (
          <>
            <div className="bg-panel border border-ash-dim/30 rounded px-4 py-3 text-center font-mono text-rust text-lg tracking-widest mb-3">
              {code}
            </div>
            <p className="text-sm text-gold mb-4">
              {copied
                ? 'Code copied to clipboard. Redeem it at '
                : 'Redeem it at '}
              <a
                href="https://aikavrdj.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-rust"
              >
                aikavrdj.com
              </a>
              .
            </p>
            <button
              onClick={handleCopyAgain}
              className="terminal-button w-full px-3 py-2 rounded flex items-center justify-center gap-2 text-sm"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy code'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
