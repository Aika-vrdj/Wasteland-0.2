import React, { useState } from 'react';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa'; // Import Discord icon
import { supabase } from '../lib/supabase';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

export function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState(''); // <-- NUEVO ESTADO
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      switch (mode) {
        case 'login':
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (loginError) throw loginError;
          break;

        case 'register':
          if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
          }
          if (!username.trim()) {
            setError('Codename is required for new Rebels');
            return;
          }
          const { error: registerError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username: username, // <-- GUARDAMOS EL USERNAME EN LA METADATA
              }
            }
          });
          if (registerError) throw registerError;
          setMessage('Registration successful! Please check your email to verify your account.');
          break;

        case 'forgot-password':
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password',
          });
          if (resetError) throw resetError;
          setMessage('Password reset instructions have been sent to your email.');
          break;

        case 'reset-password':
          if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
          }
          const { error: updateError } = await supabase.auth.updateUser({
            password: password,
          });
          if (updateError) throw updateError;
          setMessage('Password has been reset successfully!');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          break;
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-4 text-ash">
      {/* Header Section */}
      <header className="text-center mb-8">
        <pre className="font-mono text-sm leading-tight text-ash">
{`
          ██╗    ██╗ █████╗ ███████╗████████╗███████╗██╗      █████╗ ███╗   ██╗██████╗ 
          ██║    ██║██╔══██╗██╔════╝╚══██╔══╝██╔════╝██║     ██╔══██╗████╗  ██║██╔══██╗
          ██║ █╗ ██║███████║███████╗   ██║   █████╗  ██║     ███████║██╔██╗ ██║██║  ██║
          ██║███╗██║██╔══██║╚════██║   ██║   ██╔══╝  ██║     ██╔══██║██║╚██╗██║██║  ██║
          ╚███╔███╔╝██║  ██║███████║   ██║   ███████╗███████╗██║  ██║██║ ╚████║██████╔╝
           ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ 
                      by Aika Ioka, version 2.0, aikavrdj.com
        `}
        </pre>
        <h1 className="text-3xl font-bold">Welcome to the Wasteland, Rebel</h1>
        <p className="mt-4 text-sm text-ash/80 max-w-2xl mx-auto">
          The world has crumbled, but you? You’re still standing. Barely. As a Rebel, you’ve traded the comforts of modern life for the thrill of scavenging, scouting, looting, and surviving in a wasteland where the only law is “finders, keepers.” And sometimes… “oops, too slow!”
          <br />
          <br />
          Out here, every item tells a story. Rusty gear could mean the difference between life and death. A moldy piece of bread? Gourmet cuisine. That weird shiny trinket you just looted? Who knows, it might be priceless—or it might just be… weird.
          <br />
          <br />
          Assemble your inventory, collect rare artifacts, and prove to the world (or just your fellow rebels) that you’re the ultimate scavenger. Will you be the hero who discovers legendary treasures? Or the joker who hoards useless trinkets? Either way, your story is yours to write.
          <br />
          <br />
          So grab your courage (and maybe a helmet), and step into the fight for survival. The wasteland is calling, Rebel. Will you answer?
        </p>
      </header>

      {/* Authentication Section */}
      <div className="terminal-border bg-void p-8 rounded-lg w-full max-w-md border border-ember/30 shadow-[0_0_15px_rgba(200,30,58,0.25)]">
        <div className="flex items-center gap-2 mb-8">
          <Lock className="text-ash" />
          <h1 className="text-2xl font-bold text-ash">
            {mode === 'login' && 'Access Terminal'}
            {mode === 'register' && 'New User Registration'}
            {mode === 'forgot-password' && 'Password Recovery'}
            {mode === 'reset-password' && 'Reset Access Code'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NUEVO: Campo de Username (Solo visible en registro) */}
          {mode === 'register' && (
            <div>
              <label className="block text-ash mb-2">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>Codename</span>
                </div>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-void border border-ash-dim/60 rounded text-ash focus:outline-none focus:border-gold focus:shadow-[0_0_10px_rgba(217,122,52,0.35)] transition-all"
                placeholder="Enter your rebel name"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-ash mb-2">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>Email Address</span>
              </div>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-void border border-ash-dim/60 rounded text-ash focus:outline-none focus:border-gold focus:shadow-[0_0_10px_rgba(217,122,52,0.35)] transition-all"
              required
            />
          </div>

          {mode !== 'forgot-password' && (
            <div>
              <label className="block text-ash mb-2">
                <div className="flex items-center gap-2">
                  <Lock size={16} />
                  <span>Password</span>
                </div>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-void border border-ash-dim/60 rounded text-ash focus:outline-none focus:border-gold focus:shadow-[0_0_10px_rgba(217,122,52,0.35)] transition-all"
                required
              />
            </div>
          )}

          {(mode === 'register' || mode === 'reset-password') && (
            <div>
              <label className="block text-ash mb-2">
                <div className="flex items-center gap-2">
                  <Lock size={16} />
                  <span>Confirm Access Code</span>
                </div>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-void border border-ash-dim/60 rounded text-ash focus:outline-none focus:border-gold focus:shadow-[0_0_10px_rgba(217,122,52,0.35)] transition-all"
                required
              />
            </div>
          )}

          {error && (
            <div className="text-ember text-sm py-2 border-l-2 border-ember pl-2 bg-ember/10">
              ERROR: {error}
            </div>
          )}

          {message && (
            <div className="text-gold text-sm py-2 border-l-2 border-gold pl-2 bg-ember/10">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 bg-ember/10 border border-ash rounded text-ash hover:bg-ember/20 flex items-center justify-center gap-2 transition-all font-bold tracking-wider"
          >
            <ArrowRight size={16} />
            {mode === 'login' && 'ACCESS SYSTEM'}
            {mode === 'register' && 'INITIALIZE ACCOUNT'}
            {mode === 'forgot-password' && 'SEND RECOVERY LINK'}
            {mode === 'reset-password' && 'UPDATE ACCESS CODE'}
          </button>
        </form>

        <div className="mt-6 space-y-4 pt-6 border-t border-ember/30">
          <button
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'discord' })}
            className="w-full px-4 py-2 bg-[#5865F2]/10 border border-[#5865F2] rounded text-[#5865F2] hover:bg-[#5865F2]/20 flex items-center justify-center gap-2 transition-all font-bold"
          >
            <FaDiscord size={20} />
            ACCESS WITH DISCORD
          </button>

          {mode === 'login' && (
            <>
              <button
                onClick={() => setMode('forgot-password')}
                className="text-ash/70 hover:text-gold text-sm block w-full transition-colors"
              >
                Forgot Password?
              </button>
              <button
                onClick={() => setMode('register')}
                className="text-ash/70 hover:text-gold text-sm block w-full transition-colors"
              >
                New User? Register Here
              </button>
            </>
          )}
          {mode !== 'login' && mode !== 'reset-password' && (
            <button
              onClick={() => setMode('login')}
              className="text-ash/70 hover:text-gold text-sm block w-full transition-colors"
            >
              Return to Access Terminal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
