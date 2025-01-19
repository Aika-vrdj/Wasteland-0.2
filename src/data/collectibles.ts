import { Collectible } from '../types';

export const collectibles: Collectible[] = [
  // Legendary Items (4 items) - Most expensive and rare
  {
    id: 'L1',
    name: 'Crown of the Eternal',
    description: 'A magnificent crown that radiates ancient power',
    image: 'https://images.unsplash.com/photo-1589646937766-186a352c7eff?w=400',
    cost: 2000,
    rarity: 'legendary'
  },
  {
    id: 'L2',
    name: 'Phoenix Feather',
    description: 'An eternally burning feather of rebirth',
    image: 'https://images.unsplash.com/photo-1621494547944-4c3b4c3a4881?w=400',
    cost: 1800,
    rarity: 'legendary'
  },
  {
    id: 'L3',
    name: 'Celestial Compass',
    description: 'Points to your destiny across the cosmos',
    image: 'https://images.unsplash.com/photo-1533219057257-4bb9ed5d2cc6?w=400',
    cost: 1900,
    rarity: 'legendary'
  },
  {
    id: 'L4',
    name: 'Time Crystal',
    description: 'Contains moments of frozen time',
    image: 'https://images.unsplash.com/photo-1566792505297-c85887d2d98b?w=400',
    cost: 2200,
    rarity: 'legendary'
  },

  // Rare Items (6 items) - Valuable and powerful
  {
    id: 'R1',
    name: 'Dragon Scale',
    description: 'A shimmering scale from a mighty dragon',
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=400',
    cost: 1000,
    rarity: 'rare'
  },
  {
    id: 'R2',
    name: 'Moonstone Ring',
    description: 'Captures the essence of moonlight',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400',
    cost: 900,
    rarity: 'rare'
  },
  {
    id: 'R3',
    name: 'Enchanted Blade',
    description: 'A sword with mysterious magical properties',
    image: 'https://images.unsplash.com/photo-1589418466775-ebd014c3e13c?w=400',
    cost: 1100,
    rarity: 'rare'
  },
  {
    id: 'R4',
    name: 'Mystic Tome',
    description: 'Ancient book containing forgotten knowledge',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400',
    cost: 950,
    rarity: 'rare'
  },
  {
    id: 'R5',
    name: 'Star Fragment',
    description: 'A piece of a fallen star',
    image: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=400',
    cost: 850,
    rarity: 'rare'
  },
  {
    id: 'R6',
    name: 'Ocean Pearl',
    description: 'Blessed by ancient sea spirits',
    image: 'https://images.unsplash.com/photo-1550336631-5f92f5a159d0?w=400',
    cost: 800,
    rarity: 'rare'
  },

  // Uncommon Items (5 items) - Interesting and useful
  {
    id: 'U1',
    name: 'Forest Charm',
    description: 'Made from enchanted woodland materials',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400',
    cost: 400,
    rarity: 'uncommon'
  },
  {
    id: 'U2',
    name: 'Mage\'s Quill',
    description: 'Writes with magical ink that never fades',
    image: 'https://images.unsplash.com/photo-1585952369643-5f0f960a3a3d?w=400',
    cost: 450,
    rarity: 'uncommon'
  },
  {
    id: 'U3',
    name: 'Wind Chimes',
    description: 'Plays melodies of ancient songs',
    image: 'https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?w=400',
    cost: 350,
    rarity: 'uncommon'
  },
  {
    id: 'U4',
    name: 'Ember Stone',
    description: 'Always warm to the touch',
    image: 'https://images.unsplash.com/photo-1519336305162-4b6ed6b6fc83?w=400',
    cost: 300,
    rarity: 'uncommon'
  },
  {
    id: 'U5',
    name: 'Traveler\'s Compass',
    description: 'Never leads you astray',
    image: 'https://images.unsplash.com/photo-1533219057257-4bb9ed5d2cc6?w=400',
    cost: 380,
    rarity: 'uncommon'
  },

  // Common Items (5 items) - Basic but useful
  {
    id: 'C1',
    name: 'Crystal Shard',
    description: 'A small, glowing crystal fragment',
    image: 'https://images.unsplash.com/photo-1610630694347-8adf4b552ad8?w=400',
    cost: 100,
    rarity: 'common'
  },
  {
    id: 'C2',
    name: 'Leather Pouch',
    description: 'Sturdy bag for carrying treasures',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
    cost: 150,
    rarity: 'common'
  },
  {
    id: 'C3',
    name: 'Lucky Coin',
    description: 'Brings a small amount of fortune',
    image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400',
    cost: 120,
    rarity: 'common'
  },
  {
    id: 'C4',
    name: 'Wooden Charm',
    description: 'Simple but meaningful trinket',
    image: 'https://images.unsplash.com/photo-1602607203559-3da102c2c97b?w=400',
    cost: 80,
    rarity: 'common'
  },
  {
    id: 'C5',
    name: 'Glass Bead',
    description: 'Catches and reflects light beautifully',
    image: 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=400',
    cost: 90,
    rarity: 'common'
  }
];