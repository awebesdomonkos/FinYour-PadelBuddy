-- PadelBuddy Supabase Schema (v2 – Supabase Auth)
-- Run in Supabase SQL Editor

-- Drop old password_hash column if migrating from v1
ALTER TABLE IF EXISTS users DROP COLUMN IF EXISTS password_hash;

-- Users table – id references auth.users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS games (
  id text PRIMARY KEY,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS groups (
  id text PRIMARY KEY,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS friend_requests (
  id text PRIMARY KEY,
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop legacy anon grants
REVOKE ALL ON users FROM anon;
REVOKE ALL ON games FROM anon;
REVOKE ALL ON groups FROM anon;
REVOKE ALL ON friend_requests FROM anon;
REVOKE ALL ON notifications FROM anon;

-- Users: authenticated users can read all; own row full write access
CREATE POLICY "users_select_authenticated" ON users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "users_insert_own" ON users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "users_delete_own" ON users
  FOR DELETE TO authenticated USING (auth.uid() = id);

-- Games: authenticated users can read all and write
CREATE POLICY "games_select_authenticated" ON games
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "games_insert_authenticated" ON games
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "games_update_authenticated" ON games
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "games_delete_owner" ON games
  FOR DELETE TO authenticated USING (data->>'creatorId' = auth.uid()::text);

-- Groups: authenticated users full access
CREATE POLICY "groups_all_authenticated" ON groups
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Friend requests: sender/receiver can see and update
CREATE POLICY "friend_requests_select" ON friend_requests
  FOR SELECT TO authenticated
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "friend_requests_insert" ON friend_requests
  FOR INSERT TO authenticated WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "friend_requests_update" ON friend_requests
  FOR UPDATE TO authenticated
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- Notifications: users can only see/update their own
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- NOTE: service_role key bypasses RLS by default.
-- Set SUPABASE_KEY in Vercel to the service_role key for server-side operations.

-- Storage bucket for avatars (run once, or create via Supabase Dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
--   ON CONFLICT DO NOTHING;

-- Storage RLS: users upload only to their own folder; public read
CREATE POLICY "avatars_upload_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');
