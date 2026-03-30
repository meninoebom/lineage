-- Practitioner Testimonies Schema
-- Run in Supabase SQL Editor to set up the database

-- Practitioner profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text check (char_length(display_name) <= 100),
  traditions text[] default '{}',
  years_of_practice text check (years_of_practice in ('<1', '1-3', '3-10', '10+')),
  banned boolean default false,
  created_at timestamptz default now()
);

-- Testimonies on resources
create table public.testimonies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  resource_slug text not null check (char_length(resource_slug) <= 200),
  impact text check (char_length(impact) <= 2000),
  context text check (char_length(context) <= 2000),
  who_for text check (char_length(who_for) <= 2000),
  freeform text check (char_length(freeform) <= 2000),
  created_at timestamptz default now(),
  unique(user_id, resource_slug)
);

-- Indexes
create index testimonies_resource_slug_idx on public.testimonies (resource_slug);
create index testimonies_user_id_idx on public.testimonies (user_id);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.testimonies enable row level security;

-- Profiles: anyone can read, users can update their own, users can insert their own
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Testimonies: anyone can read
create policy "Testimonies are viewable by everyone"
  on public.testimonies for select using (true);

-- Testimonies: non-banned users can insert their own
create policy "Non-banned users can insert own testimonies"
  on public.testimonies for insert with check (
    auth.uid() = user_id
    and not (select banned from public.profiles where id = auth.uid())
  );

-- Testimonies: users can update their own
create policy "Users can update own testimonies"
  on public.testimonies for update using (auth.uid() = user_id);

-- Testimonies: users can delete their own
create policy "Users can delete own testimonies"
  on public.testimonies for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', null));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Testimony counts view for efficient batch loading
create or replace view public.testimony_counts as
select resource_slug, count(*)::int as count
from public.testimonies
group by resource_slug;

grant select on public.testimony_counts to anon, authenticated;
