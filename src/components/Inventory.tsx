import React, { useState } from 'react';
import { Package, DollarSign, Gift } from 'lucide-react';
import { InventoryItem } from '../types';
import { supabase } from '../lib/supabase';
import { sfx } from '../lib/sfx';
import { RedeemCodeModal } from './RedeemCodeModal';

interface InventoryProps {
  items: InventoryItem[];
  onSellResult: (collectibleId: string, result: {
    success: boolean;
    error?: string;
    rp_gained?: number;
    new_rebel_points?: number;
    remaining_quantity?: number;
  }) => void;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return 'text-legend border-legend';
    case 'rare':
      return 'text-signal border-signal';
    case 'uncommon':
      return 'text-rust border-rust';
    default:
      return 'text-ash-dim border-ash-dim';
  }
};

const SELL_PRICE_LABEL: Record<string, string> = {
  legendary: '100',
  rare: '50',
  uncommon: '10',
  common: '5',
};

export function Inventory({ items, onSellResult }: InventoryProps) {
  const [sellingId, setSellingId] = useState<string | null>(null);
  const [codeModalFor, setCodeModalFor] = useState<{ id: string; name: string } | null>(null);

  const handleSell = async (item: InventoryItem) => {
    if (sellingId) return;
    setSellingId(item.collectible.id);
    sfx.click();

    try {
      // The payout is looked up server-side from the collectibles table —
      // the client never supplies the RP amount it expects to receive.
      const { data, error } = await supabase.rpc('sell_collectible', {
        p_collectible_id: item.collectible.id,
      });

      if (error) {
        onSellResult(item.collectible.id, { success: false, error: error.message });
        sfx.error();
        return;
      }

      onSellResult(item.collectible.id, data);
    } finally {
      setSellingId(null);
    }
  };

  return (
    <div className="terminal-border bg-void p-6 rounded">
      <div className="flex items-center gap-2 mb-6">
        <Package className="text-ash" />
        <h2 className="text-2xl font-bold text-ash">INVENTORY DATABASE</h2>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-ash font-mono">
          DATABASE EMPTY. ACQUIRE ITEMS VIA LOOTING.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.collectible.id} className="terminal-border p-4 rounded">
              <div className="relative">
                <img
                  src={item.collectible.image_url}
                  alt={item.collectible.name}
                  className="w-full h-48 object-contain rounded mb-4 opacity-80"
                />
                <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold border ${getRarityColor(item.collectible.rarity)} bg-void/80 uppercase`}>
                  {item.collectible.rarity}
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-ash">{item.collectible.name}</h3>
              <p className="text-ash/80 text-sm mb-2">{item.collectible.description}</p>
              <div className="flex items-center justify-between text-sm text-ash-dim mb-3">
                <span>QTY: {item.quantity}</span>
                <span>{new Date(item.acquiredAt).toLocaleDateString()}</span>
              </div>

              {item.collectible.type === 'cupon' && (
                <button
                  onClick={() => { sfx.click(); setCodeModalFor({ id: item.collectible.id, name: item.collectible.name }); }}
                  onMouseEnter={() => sfx.hover()}
                  className="terminal-button w-full px-3 py-2 rounded flex items-center justify-center gap-2 mb-2 text-sm"
                >
                  <Gift size={16} />
                  View redeem code
                </button>
              )}

              <button
                onClick={() => handleSell(item)}
                onMouseEnter={() => sfx.hover()}
                disabled={sellingId === item.collectible.id}
                className={`terminal-button w-full px-3 py-2 rounded flex items-center justify-center gap-2 ${
                  item.quantity <= 1 ? 'hidden' : ''
                }`}
              >
                <DollarSign size={16} />
                {sellingId === item.collectible.id
                  ? 'Selling...'
                  : `Sell for ${SELL_PRICE_LABEL[item.collectible.rarity] ?? '5'} RP`}
              </button>
            </div>
          ))}
        </div>
      )}

      {codeModalFor && (
        <RedeemCodeModal
          collectibleId={codeModalFor.id}
          itemName={codeModalFor.name}
          onClose={() => setCodeModalFor(null)}
        />
      )}
    </div>
  );
}
