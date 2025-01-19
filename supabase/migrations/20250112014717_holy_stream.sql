/*
  # Fix player creation and querying

  1. Changes
    - Modify trigger to handle race conditions
    - Add ON CONFLICT clause to prevent duplicate key errors
    - Add single_row parameter to queries

  2. Security
    - Maintain existing RLS policies
    - Ensure data consistency
*/

-- Modify the trigger function to handle race conditions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.players (id, rebel_points, level, xp, last_sign_in)
  VALUES (new.id, 100, 1, 0, NULL)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;