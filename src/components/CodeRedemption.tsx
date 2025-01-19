import React, { useState } from 'react';
import { Gift } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { RedeemCodeResponse } from '../types';

interface CodeRedemptionProps {
  onRedeem: (amount: number) => void;
}

export function CodeRedemption({ onRedeem }: CodeRedemptionProps) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRedeeming) return;

    setIsRedeeming(true);
    setMessage('> PROCESSING...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage('> ERROR: AUTHENTICATION REQUIRED');
        return;
      }

      const { data, error } = await supabase.rpc('redeem_code', {
        code_to_redeem: code.toUpperCase(),
        player: user.id
      });

      const response = data as RedeemCodeResponse;
      
      if (error) {
        setMessage(`> ERROR: ${error.message}`);
      } else if (!response.success) {
        setMessage(`> ERROR: ${response.error}`);
      } else {
        setMessage(`> ACCESS GRANTED: ${response.reward_amount} RP TRANSFERRED`);
        onRedeem(response.reward_amount!);
        setCode('');
      }
    } catch (err) {
      setMessage('> ERROR: SYSTEM MALFUNCTION');
      console.error('Code redemption error:', err);
    } finally {
      setIsRedeeming(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="terminal-border bg-black p-4 rounded">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="text-green-500" />
        <h2 className="text-xl font-bold text-green-500">LOOT CODE TERMINAL</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ENTER_LOOT_CODE"
          className="terminal-input flex-1 px-4 py-2 rounded font-mono uppercase"
          disabled={isRedeeming}
        />
        <button
          type="submit"
          className="terminal-button px-4 py-2 rounded font-mono"
          disabled={isRedeeming}
        >
          EXECUTE
        </button>
      </form>
      
      {message && (
        <p className="mt-2 font-mono text-green-500">{message}</p>
      )}
    </div>
  );
}