-- ============================================================
-- Supabase Row Level Security (RLS) migration
-- Run this in Supabase SQL Editor to lock down direct DB access
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Revoke direct anon access (the API uses service_role key, not anon)
-- IMPORTANT: After running this, change SUPABASE_KEY in Vercel to the
-- service_role key (NOT the anon key) from Supabase > Settings > API

-- Deny all anon access to every table
CREATE POLICY "deny_anon_users"          ON users             FOR ALL TO anon USING (false);
CREATE POLICY "deny_anon_games"          ON games             FOR ALL TO anon USING (false);
CREATE POLICY "deny_anon_groups"         ON groups            FOR ALL TO anon USING (false);
CREATE POLICY "deny_anon_notifications"  ON notifications     FOR ALL TO anon USING (false);
CREATE POLICY "deny_anon_friend_req"     ON friend_requests   FOR ALL TO anon USING (false);

-- Allow service_role full access (used by the API server)
CREATE POLICY "service_role_users"         ON users             FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_games"         ON games             FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_groups"        ON groups            FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_notifications" ON notifications     FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_friend_req"    ON friend_requests   FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- IMPORTANT: After running this SQL:
-- 1. Go to Supabase > Settings > API
-- 2. Copy the "service_role" key (secret key, not anon key)
-- 3. Update SUPABASE_KEY in Vercel environment variables to use
--    the service_role key instead of the anon key
-- ============================================================
