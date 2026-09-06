// Supabase Edge Function — deploy with:
//   supabase functions deploy kick-link
//
// Set these as function secrets (never in the frontend .env):
//   supabase secrets set KICK_CLIENT_ID=... KICK_CLIENT_SECRET=... KICK_REDIRECT_URI=...
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically by
// Supabase for every Edge Function — you don't set those yourself.
//
// This runs on Supabase's infrastructure, not your machine, so it's live
// 24/7 regardless of whether Cerebro or your PC is on. Same reasoning as
// the whole rest of this security model: the code exchange and the
// service-role write both need a server that's actually always there.

import { createClient } from 'npm:@supabase/supabase-js@2';

const KICK_CLIENT_ID = Deno.env.get('KICK_CLIENT_ID')!;
const KICK_CLIENT_SECRET = Deno.env.get('KICK_CLIENT_SECRET')!;
const KICK_REDIRECT_URI = Deno.env.get('KICK_REDIRECT_URI')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { code, code_verifier } = await req.json();
    if (!code || !code_verifier) {
      return json({ success: false, error: 'Missing code or code_verifier' }, 400);
    }

    // Verify the caller from the Authorization header Supabase automatically
    // forwards when the frontend calls supabase.functions.invoke() —
    // never trust a client-supplied user id, same principle as everywhere
    // else in this app.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ success: false, error: 'Not authenticated' }, 401);
    }

    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: userData, error: userError } = await anonClient.auth.getUser();
    if (userError || !userData?.user) {
      return json({ success: false, error: 'Invalid or expired session' }, 401);
    }
    const playerId = userData.user.id;

    // Exchange the OAuth code for a Kick access token.
    // Confirm this endpoint against docs.kick.com before relying on it in
    // production — Kick's public API is fairly new.
    const tokenResp = await fetch('https://id.kick.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KICK_CLIENT_ID,
        client_secret: KICK_CLIENT_SECRET,
        redirect_uri: KICK_REDIRECT_URI,
        code,
        code_verifier
      })
    });
    if (!tokenResp.ok) {
      return json({ success: false, error: 'Kick token exchange failed' }, 502);
    }
    const { access_token: kickAccessToken } = await tokenResp.json();

    // GET /users with no ids returns the authenticated user (needs user:read scope).
    const userResp = await fetch('https://api.kick.com/public/v1/users', {
      headers: { Authorization: `Bearer ${kickAccessToken}` }
    });
    if (!userResp.ok) {
      return json({ success: false, error: 'Could not fetch Kick user' }, 502);
    }
    const kickUserBody = await userResp.json();
    const kickUser = kickUserBody?.data?.[0];
    if (!kickUser) {
      return json({ success: false, error: 'Kick returned no user data' }, 502);
    }

    const kickId = String(kickUser.user_id ?? kickUser.id);
    const kickUsername = kickUser.name ?? kickUser.username ?? null;

    // Service role bypasses RLS/column grants — this is the trusted write.
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: linkResult, error: linkError } = await serviceClient.rpc('link_kick_identity', {
      p_id: playerId,
      p_kick_id: kickId,
      p_kick_username: kickUsername
    });

    if (linkError) {
      return json({ success: false, error: linkError.message }, 500);
    }

    return json(linkResult);
  } catch (err) {
    return json({ success: false, error: String(err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
