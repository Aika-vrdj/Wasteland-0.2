/*
  # Add player stats update function

  1. New Functions
    - update_player_stats: Atomic function to update player's RP and XP
  
  2. Description
    - Handles rebel points changes
    - Updates experience points
    - Manages level progression
*/

CREATE OR REPLACE FUNCTION update_player_stats(
  p_id uuid,
  rp_change integer,
  xp_gained integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_rp integer;
  current_xp integer;
  current_level integer;
  new_xp integer;
  new_level integer;
  xp_needed integer;
BEGIN
  -- Get current stats
  SELECT rebel_points, xp, level
  INTO current_rp, current_xp, current_level
  FROM players
  WHERE id = p_id
  FOR UPDATE;

  -- Calculate new values
  current_rp := current_rp + rp_change;
  new_xp := current_xp + xp_gained;
  new_level := current_level;
  
  -- Calculate level ups
  LOOP
    xp_needed := new_level * 100;
    EXIT WHEN new_xp < xp_needed;
    new_xp := new_xp - xp_needed;
    new_level := new_level + 1;
  END LOOP;

  -- Update player record
  UPDATE players
  SET rebel_points = current_rp,
      xp = new_xp,
      level = new_level
  WHERE id = p_id;
END;
$$;