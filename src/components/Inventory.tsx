import React from 'react';
import { Package, DollarSign } from 'lucide-react';
import { InventoryItem } from '../types';
import { Collectible } from '../types';
import { removeItemFromDB, updateItemQuantityInDB } from '../inventoryService';

interface InventoryProps {
  items: InventoryItem[];
  onSellItem: (item: InventoryItem) => void;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return 'text-purple-500 border-purple-500';
    case 'rare':
      return 'text-blue-500 border-blue-500';
    case 'uncommon':
      return 'text-green-500 border-green-500';
    default:
      return 'text-gray-500 border-gray-500';
  }
};

export function Inventory({ items, onSellItem }: InventoryProps) {
  return (
    <div className="terminal-border bg-black p-6 rounded">
      <div className="flex items-center gap-2 mb-6">
        <Package className="text-green-500" />
        <h2 className="text-2xl font-bold text-green-500">INVENTORY DATABASE</h2>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-8 text-green-500 font-mono">
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
                <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold border ${getRarityColor(item.collectible.rarity)} bg-black/80 uppercase`}>
                  {item.collectible.rarity}
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-green-500">{item.collectible.name}</h3>
              <p className="text-green-500/80 text-sm mb-2">{item.collectible.description}</p>
              <div className="flex items-center justify-between text-sm text-green-500/60 mb-3">
                <span>QTY: {item.quantity}</span>
                <span>{new Date(item.acquiredAt).toLocaleDateString()}</span>
              </div>
              <button
  onClick={() => onSellItem(item)}
  className={`terminal-button w-full px-3 py-2 rounded flex items-center justify-center gap-2 ${
    item.quantity <= 1 ? 'hidden' : ''
  }`}
>
  <DollarSign size={16} />
  Sell for {item.collectible.rarity === 'legendary' ? '100' :
           item.collectible.rarity === 'rare' ? '50' :
           item.collectible.rarity === 'uncommon' ? '10' : '5'} RP
</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
