/*
  # Create Storage Buckets for Collectible Images

  1. New Storage Buckets
    - `collectible-images`
      - Public bucket for storing collectible images
      - Allows public read access
      - Requires authentication for uploads

  2. Security
    - Enable public access for reading images
    - Restrict uploads to authenticated users only
*/

-- Create public storage bucket for collectible images
INSERT INTO storage.buckets (id, name, public)
VALUES ('collectible-images', 'collectible-images', true);

-- Allow public access to read images
CREATE POLICY "Public access to collectible images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'collectible-images');

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload collectible images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'collectible-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own images
CREATE POLICY "Users can update their own images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'collectible-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'collectible-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );