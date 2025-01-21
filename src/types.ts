export interface Collectible {
  id: string;
  name: string;
  description: string;
  image_url: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  type: 'food' | 'useless' | 'gear' | 'cupon' | 'limited';
}

export interface InventoryItem {
  collectible: Collectible;
  quantity: number;
  acquiredAt: Date;
}

export interface PlayerStats {
  level: number;
  xp: number;
  xpNeeded: number;
}

export interface RedeemCodeResponse {
  success: boolean;
  error?: string;
  reward_amount?: number;
}
