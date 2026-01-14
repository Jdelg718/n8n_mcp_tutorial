-- Migration: Add Telegram Chat ID to Profiles
-- Purpose: Enable multi-user scaling by linking Telegram Chat IDs to Supabase Users

-- 1. Add the column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

-- 2. Make it unique (one chat ID = one user)
ALTER TABLE profiles 
ADD CONSTRAINT profiles_telegram_chat_id_unique UNIQUE (telegram_chat_id);

-- 3. Add an index for fast lookups (critical for n8n performance)
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_chat_id 
ON profiles(telegram_chat_id);

-- Comment for documentation
COMMENT ON COLUMN profiles.telegram_chat_id IS 'Linking column for Telegram Bot to look up User UUID';
