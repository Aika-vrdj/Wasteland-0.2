/*
  # Fix inventory relations

  1. Changes
    - Add foreign key constraint from player_inventory to collectibles table
    - Update column name from collectible_id to match the collectibles table id
  
  2. Security
    - Maintain existing RLS policies
*/

-- First ensure the collectibles table exists
CREATE TABLE IF NOT EXISTS collectibles (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  cost integer NOT NULL CHECK (cost > 0),
  rarity collectible_rarity NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint to player_inventory
ALTER TABLE player_inventory
ADD CONSTRAINT fk_player_inventory_collectible
FOREIGN KEY (collectible_id) REFERENCES collectibles(id)
ON DELETE CASCADE;