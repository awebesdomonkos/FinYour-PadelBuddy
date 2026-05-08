-- PadelBuddy Supabase Schema
-- Futtasd ezt a Supabase SQL Editor-ban

create table if not exists users (
  id text primary key,
  email text unique not null,
  name text not null,
  password_hash text not null,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists games (
  id text primary key,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists groups (
  id text primary key,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists friend_requests (
  id text primary key,
  from_user_id text not null,
  to_user_id text not null,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists notifications (
  id text primary key,
  user_id text not null,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Disable Row Level Security (mi kezeljük az auth-ot JWT-vel)
alter table users disable row level security;
alter table games disable row level security;
alter table groups disable row level security;
alter table friend_requests disable row level security;
alter table notifications disable row level security;

-- Engedélyezd az anon kulcsnak az olvasást/írást
grant all on users to anon;
grant all on games to anon;
grant all on groups to anon;
grant all on friend_requests to anon;
grant all on notifications to anon;
