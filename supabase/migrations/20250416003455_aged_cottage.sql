/*
  # Create submissions table

  1. New Tables
    - `submissions`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `monthly_spend` (integer)
      - `estimated_waste` (text)
      - `target_impression_share` (text)
      - `incrementality_testing` (text)
      - `broad_match` (text)
      - `search_terms_review` (text)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `submissions` table
    - Add policy for inserting submissions
*/

CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  monthly_spend integer NOT NULL,
  estimated_waste text NOT NULL,
  target_impression_share text NOT NULL,
  incrementality_testing text NOT NULL,
  broad_match text NOT NULL,
  search_terms_review text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert submissions"
  ON submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Submissions are viewable by anyone"
  ON submissions
  FOR SELECT
  TO anon
  USING (true);