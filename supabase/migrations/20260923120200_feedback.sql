-- Admins live in their own table rather than a users.is_admin column: the "Users update own"
-- policy lets a user rewrite their own users row, so a column there would let anyone promote
-- themselves. This table has RLS on and no client policies — only the API (service_role) reads it.
CREATE TABLE IF NOT EXISTS public.app_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_admins FROM anon, authenticated;

-- In-app feedback. Written/read only through the API.
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category text NOT NULL CHECK (category IN ('bug', 'suggestion', 'other')),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  page text,
  user_agent text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON public.feedback (created_at DESC);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.feedback FROM anon, authenticated;

-- Grant admin after the owner has registered in the app, e.g.:
--   INSERT INTO public.app_admins (user_id)
--   SELECT id FROM public.users WHERE email = 'info@awebes.hu';
