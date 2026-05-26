-- Add display_name (alias/privacy name) to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
