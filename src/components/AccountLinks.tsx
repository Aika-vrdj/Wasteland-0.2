import React, { useState } from 'react';
import { Link2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sfx } from '../lib/sfx';

interface AccountLinksProps {
  discordId: string | null;
  discordUsername: string | null;
  kickId: string | null;
  kickUsername: string | null;
}

// These come from your deployment env, not hardcoded, since the redirect
// URI and client id differ between local dev and production.
const KICK_CLIENT_ID = import.meta.env.VITE_KICK_CLIENT_ID as string;
const KICK_REDIRECT_URI = import.meta.env.VITE_KICK_REDIRECT_URI as string;

function base64UrlEncode(bytes: Uint8Array) {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generatePkcePair() {
  const verifierBytes = crypto.getRandomValues(new Uint8Array(32));
  const verifier = base64UrlEncode(verifierBytes);
  const digestBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = base64UrlEncode(new Uint8Array(digestBuffer));
  return { verifier, challenge };
}

export function AccountLinks({ discordId, discordUsername, kickId, kickUsername }: AccountLinksProps) {
  const [linkingKick, setLinkingKick] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectDiscord = async () => {
    sfx.click();
    setError(null);
    // Supabase handles the whole OAuth dance and redirects the browser to
    // Discord and back. There's nothing for us to verify — Supabase already
    // did that — App.tsx's identity-sync effect picks up the result on return.
    const { error } = await supabase.auth.linkIdentity({
      provider: 'discord',
      options: { redirectTo: window.location.origin + window.location.pathname }
    });
    if (error) setError(error.message);
  };

  const handleConnectKick = async () => {
    sfx.click();
    setError(null);
    setLinkingKick(true);
    try {
      const { verifier, challenge } = await generatePkcePair();
      const state = crypto.randomUUID();
      // Read back after the redirect completes — see the kick-callback
      // handling in App.tsx's mount effect.
      sessionStorage.setItem('kick_pkce_verifier', verifier);
      sessionStorage.setItem('kick_oauth_state', state);

      const params = new URLSearchParams({
        client_id: KICK_CLIENT_ID,
        redirect_uri: KICK_REDIRECT_URI,
        response_type: 'code',
        scope: 'user:read',
        code_challenge: challenge,
        code_challenge_method: 'S256',
        state
      });

      window.location.href = `https://id.kick.com/oauth/authorize?${params.toString()}`;
    } catch (err) {
      setLinkingKick(false);
      setError('Could not start Kick connect flow');
    }
  };

  return (
    <div className="terminal-border bg-void p-6 rounded">
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="text-ash" />
        <h2 className="text-xl font-bold text-ash">LINKED ACCOUNTS</h2>
      </div>

      <div className="flex items-center justify-between py-2 border-b border-ash-dim/20">
        <span className="text-ash/80">Discord</span>
        {discordId ? (
          <span className="flex items-center gap-1 text-gold text-sm">
            <CheckCircle2 size={16} /> {discordUsername ?? 'linked'}
          </span>
        ) : (
          <button onClick={handleConnectDiscord} onMouseEnter={() => sfx.hover()} className="terminal-button px-3 py-1 rounded text-sm">
            Connect
          </button>
        )}
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-ash/80">Kick</span>
        {kickId ? (
          <span className="flex items-center gap-1 text-gold text-sm">
            <CheckCircle2 size={16} /> {kickUsername ?? 'linked'}
          </span>
        ) : (
          <button
            onClick={handleConnectKick}
            onMouseEnter={() => sfx.hover()}
            disabled={linkingKick}
            className="terminal-button px-3 py-1 rounded text-sm"
          >
            {linkingKick ? 'Redirecting...' : 'Connect'}
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-ember text-sm font-mono">{error}</p>}
    </div>
  );
}
