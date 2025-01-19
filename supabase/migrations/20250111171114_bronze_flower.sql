/*
  # Create Collectibles Table

  1. New Tables
    - `collectibles`
      - `id` (text, primary key) - matches the collectible IDs from the app
      - `name` (text) - name of the collectible
      - `description` (text) - description of the collectible
      - `image_url` (text) - URL to the image in the collectible-images bucket
      - `cost` (integer) - cost in Rebel Points
      - `rarity` (enum) - rarity level of the collectible
      - `created_at` (timestamptz) - creation timestamp
      - `updated_at` (timestamptz) - last update timestamp

  2. Security
    - Enable RLS on collectibles table
    - Allow public read access
    - Only allow admin to insert/update/delete
*/

-- Create rarity enum type
CREATE TYPE collectible_rarity AS ENUM ('common', 'uncommon', 'rare', 'legendary');

-- Create collectibles table
CREATE TABLE collectibles (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  cost integer NOT NULL CHECK (cost > 0),
  rarity collectible_rarity NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE collectibles ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can read collectibles"
  ON collectibles
  FOR SELECT
  TO public
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER set_collectibles_updated_at
  BEFORE UPDATE ON collectibles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create index for faster rarity filtering
CREATE INDEX idx_collectibles_rarity ON collectibles(rarity);