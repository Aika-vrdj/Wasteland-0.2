/*
  # Initial Schema Setup for Rebel Collector

  1. New Tables
    - `players`
      - `id` (uuid, primary key, linked to auth.users)
      - `rebel_points` (integer)
      - `level` (integer)
      - `xp` (integer)
      - `last_sign_in` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `player_inventory`
      - `id` (uuid, primary key)
      - `player_id` (uuid, foreign key to players)
      - `collectible_id` (text)
      - `quantity` (integer)
      - `acquired_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read their own player data
      - Update their own player data
      - Read their own inventory
      - Insert/Update their own inventory items
*/

-- Create players table
CREATE TABLE players (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  rebel_points integer NOT NULL DEFAULT 100,
  level integer NOT NULL DEFAULT 1,
  xp integer NOT NULL DEFAULT 0,
  last_sign_in timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create player_inventory table
CREATE TABLE player_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id),
  collectible_id text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  acquired_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_inventory ENABLE ROW LEVEL SECURITY;

-- Create policies for players table
CREATE POLICY "Users can read own player data"
  ON players
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own player data"
  ON players
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for player_inventory table
CREATE POLICY "Users can read own inventory"
  ON player_inventory
  FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "Users can insert own inventory items"
  ON player_inventory
  FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can update own inventory items"
  ON player_inventory
  FOR UPDATE
  TO authenticated
  USING (player_id = auth.uid());

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON player_inventory
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create index for faster inventory queries
CREATE INDEX idx_player_inventory_player_id ON player_inventory(player_id);
CREATE INDEX idx_player_inventory_collectible_id ON player_inventory(collectible_id);