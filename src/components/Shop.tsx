import React from 'react';
import { Coins, ShoppingBag } from 'lucide-react';
import { collectibles } from '../data/collectibles';
import { Collectible } from '../types';

interface ShopProps {
  rebelPoints: number;
  onPurchase: (item: Collectible) => void;
}

export function Shop({ rebelPoints, onPurchase }: ShopProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Shop</h2>
        <div className="flex items-center gap-2">
          <Coins className="text-purple-500" />
          <span className="font-semibold">{rebelPoints} RP</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {collectibles.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-lg mb-4" />
            <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs ${
                item.rarity === 'legendary' ? 'bg-purple-100 text-purple-800' :
                item.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                item.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {item.rarity}
              </span>
              <span className="flex items-center gap-1">
                <Coins size={16} className="text-purple-500" />
                {item.cost} RP
              </span>
            </div>
            <button
              onClick={() => onPurchase(item)}
              disabled={rebelPoints < item.cost}
              className={`w-full mt-4 px-4 py-2 rounded-lg flex items-center justify-center gap-2
                ${rebelPoints >= item.cost
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              <ShoppingBag size={16} />
              {rebelPoints >= item.cost ? 'Purchase' : 'Not enough RP'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}