-- Profile writes go through api/[...path].ts only (service_role, bypasses RLS).
-- "Users update own" had no WITH CHECK and covered the whole row, so a user could write
-- server-maintained fields in users.data (reliabilityScore, totalRatings, friendIds, ...)
-- directly with the public anon key. Registration now creates the row via PUT /api/users/:id.
DROP POLICY IF EXISTS "Users update own" ON public.users;
DROP POLICY IF EXISTS "Users insert own" ON public.users;
-- "Users read own" stays: AuthContext reads the signed-in user's own row directly.
