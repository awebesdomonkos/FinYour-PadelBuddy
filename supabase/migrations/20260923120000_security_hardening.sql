-- The anon key is public (served by /api/config), so RLS is the only guard on direct
-- Supabase REST access. All writes to games/groups/friend_requests/notifications go
-- through api/[...path].ts with the service_role key (which bypasses RLS). The browser
-- only touches: its own users row, its own notifications (realtime), and avatars storage.

-- 1. Close direct-access holes -------------------------------------------------------
-- Any logged-in user could UPDATE any game/group (e.g. make themselves group admin).
DROP POLICY IF EXISTS "Games insert"  ON public.games;
DROP POLICY IF EXISTS "Games update"  ON public.games;
DROP POLICY IF EXISTS "Groups insert" ON public.groups;
DROP POLICY IF EXISTS "Groups update" ON public.groups;
-- games.data / groups.data embed chat messages: USING (true) exposed every chat to the anon key.
DROP POLICY IF EXISTS "Games read"    ON public.games;
DROP POLICY IF EXISTS "Groups read"   ON public.groups;
-- WITH CHECK (true) for role public let anyone insert a notification for any user.
DROP POLICY IF EXISTS "Notif insert"  ON public.notifications;
DROP POLICY IF EXISTS "FR insert"     ON public.friend_requests;
DROP POLICY IF EXISTS "FR update"     ON public.friend_requests;

-- 2. Avatar uploads (storage.objects had no policies, so every upload was rejected) -----
DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_select_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;
CREATE POLICY "avatars_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
-- upsert: true needs SELECT + UPDATE on the existing object as well
CREATE POLICY "avatars_select_own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Live in-app notifications -----------------------------------------------------------
-- The client subscribes to postgres_changes on notifications, but the table was never
-- added to the realtime publication, so no event was ever delivered.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
