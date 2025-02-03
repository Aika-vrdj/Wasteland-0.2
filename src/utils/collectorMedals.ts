import { supabase } from '../lib/supabase';
import { medalsConfig } from './medalsConfig'; // Import the medal configuration

// Fetch collectibles by rarity or type
const fetchCollectibles = async (criteria: { type?: string; rarity?: string }) => {
  let query = supabase.from('collectibles').select('id, rarity, type');
  
  if (criteria.rarity) {
    query = query.eq('rarity', criteria.rarity);
  } else if (criteria.type) {
    query = query.eq('type', criteria.type);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching collectibles:', error);
    return [];
  }
  return data;
};

// Check if the player has collected all items for a specific medal
const checkPlayerMedal = async (playerId: string, medal: typeof medalsConfig[0]) => {
  // Fetch the required collectibles for the given criteria
  const collectibles = await fetchCollectibles(medal);

  if (!collectibles || collectibles.length === 0) {
    console.log(`No collectibles found for ${medal.name}`);
    return false;
  }

  // Fetch the player's inventory
  const playerInventory = await fetchPlayerInventory(playerId);

  // Check if the player has collected all items
  const hasMedal = hasCollectedAllItems(collectibles, playerInventory);

  if (hasMedal) {
    // If the player has collected all items, award the medal
    console.log(`${playerId} has earned the "${medal.name}" medal`);
    await awardMedalToPlayer(playerId, medal);
  }

  return hasMedal;
};

// Function to award a medal to a player
const awardMedalToPlayer = async (playerId: string, medal: typeof medalsConfig[0]) => {
  // You can store the medals in a `player_medals` table or use a `medal` column in the `players` table
  const { data, error } = await supabase
    .from('player_medals')
    .upsert([{ player_id: playerId, medal_type: medal.name }]);

  if (error) {
    console.error('Error awarding medal:', error);
  } else {
    console.log(`Player ${playerId} awarded the ${medal.name} medal.`);
  }
};

// Checking for all medals
const checkAllPlayerMedals = async (playerId: string) => {
  for (const medal of medalsConfig) {
    await checkPlayerMedal(playerId, medal); // Check each medal based on its criteria
  }
};

// Subscribe to inventory changes and check medals
const subscribeToPlayerInventory = (playerId: string) => {
  supabase
    .from(`player_inventory:player_id=eq.${playerId}`)
    .on('INSERT', async () => {
      await checkAllPlayerMedals(playerId); // Check medals on any inventory change
    })
    .on('UPDATE', async () => {
      await checkAllPlayerMedals(playerId);
    })
    .on('DELETE', async () => {
      await checkAllPlayerMedals(playerId);
    })
    .subscribe();
};

export { checkAllPlayerMedals, subscribeToPlayerInventory };
