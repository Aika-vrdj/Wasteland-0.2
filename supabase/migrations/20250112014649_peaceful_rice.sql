/*
  # Fix players table RLS policies

  1. Changes
    - Add policy for inserting new player records
    - Fix select policy to handle no rows case
    - Add policy for authenticated users to create their own player record

  2. Security
    - Ensure users can only access and modify their own data
    - Allow initial player record creation on signup
*/

-- Drop existing policies for players table
DROP POLICY IF EXISTS "Users can read own player data" ON players;
DROP POLICY IF EXISTS "Users can update own player data" ON players;

-- Create new policies with proper access control
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

CREATE POLICY "Users can create their own player record"
  ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create trigger to automatically create player record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.players (id, rebel_points, level, xp)
  VALUES (new.id, 100, 1, 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();