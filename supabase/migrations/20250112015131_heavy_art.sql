/*
  # Redeem Codes System

  1. New Tables
    - `redeem_codes`
      - `code` (text, primary key) - The actual code to redeem
      - `reward_amount` (integer) - Amount of rebel points to award
      - `max_uses` (integer) - Maximum number of times this code can be used (null for unlimited)
      - `uses_count` (integer) - Current number of times the code has been used
      - `expires_at` (timestamptz) - When the code expires (null for never)
      - `active` (boolean) - Whether the code is currently active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `redeem_code_uses`
      - `id` (uuid, primary key)
      - `code` (text) - Reference to redeem_codes
      - `player_id` (uuid) - Reference to players
      - `redeemed_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for code redemption and tracking
*/

-- Create redeem_codes table
CREATE TABLE redeem_codes (
  code text PRIMARY KEY,
  reward_amount integer NOT NULL CHECK (reward_amount > 0),
  max_uses integer CHECK (max_uses > 0),
  uses_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create redeem_code_uses table
CREATE TABLE redeem_code_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL REFERENCES redeem_codes(code),
  player_id uuid NOT NULL REFERENCES players(id),
  redeemed_at timestamptz DEFAULT now(),
  UNIQUE(code, player_id)
);

-- Enable RLS
ALTER TABLE redeem_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE redeem_code_uses ENABLE ROW LEVEL SECURITY;

-- Create policies for redeem_codes
CREATE POLICY "Anyone can read active codes"
  ON redeem_codes
  FOR SELECT
  TO public
  USING (active = true AND (expires_at IS NULL OR expires_at > now()));

-- Create policies for redeem_code_uses
CREATE POLICY "Users can read their own redemptions"
  ON redeem_code_uses
  FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "Users can insert their own redemptions"
  ON redeem_code_uses
  FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

-- Create function to redeem a code
CREATE OR REPLACE FUNCTION redeem_code(code_to_redeem text, player uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code_record redeem_codes%ROWTYPE;
  result json;
BEGIN
  -- Get the code and lock it for update
  SELECT * FROM redeem_codes 
  WHERE code = code_to_redeem
  AND active = true
  AND (expires_at IS NULL OR expires_at > now())
  FOR UPDATE
  INTO code_record;

  -- Check if code exists and is valid
  IF code_record.code IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired code');
  END IF;

  -- Check if code has reached max uses
  IF code_record.max_uses IS NOT NULL AND code_record.uses_count >= code_record.max_uses THEN
    RETURN json_build_object('success', false, 'error', 'Code has reached maximum uses');
  END IF;

  -- Check if player has already used this code
  IF EXISTS (
    SELECT 1 FROM redeem_code_uses
    WHERE code = code_to_redeem AND player_id = player
  ) THEN
    RETURN json_build_object('success', false, 'error', 'You have already used this code');
  END IF;

  -- Insert redemption record
  INSERT INTO redeem_code_uses (code, player_id)
  VALUES (code_to_redeem, player);

  -- Update code uses count
  UPDATE redeem_codes
  SET uses_count = uses_count + 1,
      active = CASE 
        WHEN max_uses IS NOT NULL AND uses_count + 1 >= max_uses THEN false
        ELSE active
      END
  WHERE code = code_to_redeem;

  -- Update player's rebel points
  UPDATE players
  SET rebel_points = rebel_points + code_record.reward_amount
  WHERE id = player;

  RETURN json_build_object(
    'success', true,
    'reward_amount', code_record.reward_amount
  );
END;
$$;