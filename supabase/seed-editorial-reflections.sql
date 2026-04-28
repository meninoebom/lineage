-- Seed Editorial Reflections
-- ===========================
-- Seeds 5 practitioner profiles and 15 editorial reflections demonstrating
-- the tone and depth expected from the guided reflection system.
--
-- These are fictional practitioners whose voices model what authentic
-- reflection looks like — personal and specific, not book reviews.
--
-- Run with service role (bypasses RLS):
--   Paste into Supabase SQL Editor while authenticated as service role.
--   Or: psql <connection_string> -f supabase/seed-editorial-reflections.sql
--
-- Idempotent: ON CONFLICT DO NOTHING / DO UPDATE throughout.
-- Safe to re-run; will not duplicate records.

DO $$
DECLARE
  -- Editorial seed practitioners (use sequential UUIDs for easy identification)
  maya    uuid := '00000000-0000-0000-0000-000000000010';
  james   uuid := '00000000-0000-0000-0000-000000000011';
  priya   uuid := '00000000-0000-0000-0000-000000000012';
  david   uuid := '00000000-0000-0000-0000-000000000013';
  sarah   uuid := '00000000-0000-0000-0000-000000000014';
BEGIN

-- ============================================================
-- STEP 1: Create auth.users entries
-- The on_auth_user_created trigger auto-creates a profiles row.
-- These accounts are editorial seeds — not real login credentials.
-- ============================================================

INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at,
  raw_user_meta_data, is_super_admin
) VALUES
  (maya,  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'maya.chen.seed@lineage.guide', '', now(), now(), now(),
   '{"full_name": "Maya Chen"}'::jsonb, false),
  (james, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'james.obrien.seed@lineage.guide', '', now(), now(), now(),
   '{"full_name": "James O''Brien"}'::jsonb, false),
  (priya, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'priya.sharma.seed@lineage.guide', '', now(), now(), now(),
   '{"full_name": "Priya Sharma"}'::jsonb, false),
  (david, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'david.levi.seed@lineage.guide', '', now(), now(), now(),
   '{"full_name": "David Levi"}'::jsonb, false),
  (sarah, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'sarah.kim.seed@lineage.guide', '', now(), now(), now(),
   '{"full_name": "Sarah Kim"}'::jsonb, false)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- STEP 2: Enrich practitioner profiles
-- The trigger sets display_name from raw_user_meta_data.full_name.
-- We add bio, practice_background, traditions, and years here.
-- ============================================================

-- Maya Chen — Zen/Vipassana, long-time practitioner, terse and direct
UPDATE public.profiles SET
  bio = 'Sit with what is.',
  practice_background = 'Started sitting in my early twenties after a chaotic decade. Found a Soto Zen community and stayed. Later did a series of Vipassana retreats. I don''t have a single teacher — more a lineage of books and rooms.',
  traditions = ARRAY['zen', 'theravada'],
  years_of_practice = '10+'
WHERE id = maya;

-- James O'Brien — Christian contemplative, intellectual, reflective
UPDATE public.profiles SET
  bio = 'Curious about the apophatic tradition. Lay practitioner in the Catholic contemplative lineage.',
  practice_background = 'Came to contemplative prayer through academic theology, then realized I was trying to understand my way into something that resists understanding. Centering Prayer opened a different door. I read widely — John of the Cross, Meister Eckhart, Thomas Keating.',
  traditions = ARRAY['christian-contemplative'],
  years_of_practice = '3-10'
WHERE id = james;

-- Priya Sharma — Advaita Vedanta, early in practice, sincere beginner
UPDATE public.profiles SET
  display_name = 'Priya Sharma',
  traditions = ARRAY['advaita-vedanta'],
  years_of_practice = '1-3'
WHERE id = priya;

-- David Levi — cross-tradition, seasoned, integrated
UPDATE public.profiles SET
  bio = 'Long-time practitioner. Curious about where paths meet.',
  practice_background = 'Vipassana first, then Tibetan Buddhism, then a decade of sitting with a Sufi teacher. Now mostly a lay practitioner drawing on all three. I''m suspicious of people who claim to have figured it out — including myself.',
  traditions = ARRAY['theravada', 'tibetan-buddhism', 'sufism'],
  years_of_practice = '10+'
WHERE id = david;

-- Sarah Kim — Tibetan Buddhism / Dzogchen, practice-informed and specific
UPDATE public.profiles SET
  bio = 'Tibetan Buddhist practitioner and occasional retreat facilitator.',
  practice_background = 'Found Tibetan Buddhism through a friend''s bookshelf in my late twenties. Took refuge formally three years in. Have done one three-month retreat and a handful of shorter ones. The dharma is the most useful framework I have for navigating difficulty.',
  traditions = ARRAY['tibetan-buddhism'],
  years_of_practice = '3-10'
WHERE id = sarah;


-- ============================================================
-- STEP 3: Seed editorial reflections
-- 15 total — varied length and tone across 5 practitioners.
-- All personal and reflective, not summaries or recommendations.
-- ============================================================

-- ------------------------------------
-- Maya Chen (Zen / Vipassana) — 3 reflections
-- ------------------------------------

INSERT INTO public.testimonies (user_id, resource_slug, impact, recommended_at)
VALUES (
  maya,
  'zen-mind-beginners-mind',
  'I''ve read this four times. Each time something different lands. The first time I thought I was too advanced for it. That tells you everything about where I was.',
  now() - interval '14 months'
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, impact, context, recommended_at)
VALUES (
  maya,
  'a-path-with-heart',
  'Jack Kornfield''s question — "Have you loved well?" — stopped me completely. I wasn''t expecting to be asked that by a meditation teacher. I still think about it.',
  'I read this after a period of very rigid, ambitious practice. I kept waiting for enlightenment and missing everything around me.',
  now() - interval '9 months'
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, impact, recommended_at)
VALUES (
  maya,
  'full-catastrophe-living',
  'I don''t think of this as a spiritual book. It''s practical. The body scan taught me more about where I hold tension than years of sitting practice.',
  now() - interval '5 months'
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;


-- ------------------------------------
-- James O'Brien (Christian contemplative) — 3 reflections
-- ------------------------------------

INSERT INTO public.testimonies (user_id, resource_slug, impact, context, recommended_at)
VALUES (
  james,
  'dark-night-of-the-soul',
  'St. John wrote this while imprisoned by his own religious order. Knowing that context transforms every page. The desolation he describes is not a problem to fix — it''s what''s supposed to happen. I read it through a very difficult year and it was the only map I trusted.',
  'A period of deep confusion about prayer. Everything I had been taught felt hollow. A friend gave me this and said: "Don''t read it as a solution. Read it as company."',
  now() - interval '18 months'
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, impact, freeform, recommended_at)
VALUES (
  james,
  'cloud-of-unknowing',
  'This anonymous monk is arguing against conceptual prayer — against trying to understand God — and the argument is so good it dismantled my whole approach. I had been using contemplation to feel competent, not to surrender.',
  'The translator''s preface is worth reading twice. The 14th-century language is barely a barrier once you settle in.',
  now() - interval '11 months'
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, impact, recommended_at)
VALUES (
  james,
  'interior-castle',
  'Teresa of Avila is funny. I was not expecting that. She describes the inner life with such frankness — "I used to be terrible at this" — that it gave me permission to admit the same.',
  now() - interval '6 months'
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;


-- ------------------------------------
-- Priya Sharma (Advaita Vedanta, early practice) — 3 reflections
-- ------------------------------------

INSERT INTO public.testimonies (user_id, resource_slug, impact, context, recommended_at)
VALUES (
  priya,
  'i-am-that',
  'I don''t fully understand Nisargadatta, but I keep going back. There''s a question-and-answer session early in the book that breaks something open every time. I don''t have the words for it yet.',
  'My mother had been practicing Advaita for twenty years before I got interested. I thought I was ready for this book. I was not ready for this book.',
  now() - interval '7 months'
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, impact, recommended_at)
VALUES (
  priya,
  'mindfulness-in-plain-english',
  'The most honest explanation of why the mind resists meditation I''ve found. It doesn''t make you feel bad about your restless mind — it just explains it. After this, my resistance to sitting felt less personal.',
  now() - interval '4 months'
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, impact, freeform, recommended_at)
VALUES (
  priya,
  'be-here-now',
  'The visual format makes this feel like a transmission rather than a book. You have to slow down to read it. That slowness is part of the teaching.',
  'My copy is worn through from being passed around to friends.',
  now() - interval '3 months'
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;


-- ------------------------------------
-- David Levi (cross-tradition, seasoned) — 3 reflections
-- ------------------------------------

INSERT INTO public.testimonies (user_id, resource_slug, impact, who_for, recommended_at)
VALUES (
  david,
  'cutting-through-spiritual-materialism',
  'Trungpa is describing something I had been doing for years without knowing it — using practice to build an identity. The chapter on spiritual friendship is the most useful thing I''ve read on finding a teacher.',
  'Anyone who has been practicing long enough to wonder if they''re doing it "right" — or long enough to feel a little proud of how much they''ve done.',
  now() - interval '22 months'
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, impact, recommended_at)
VALUES (
  david,
  'tao-te-ching',
  'I come back to this in difficult periods. Not to understand it — to sit with it. Some passages resist translation, which is itself the lesson.',
  now() - interval '10 months'
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, impact, context, recommended_at)
VALUES (
  david,
  'essential-rumi',
  'Barks''s translations don''t please the scholars, but they''re how Rumi entered me. "The Guest House" is the first poem I memorized. Some poems only arrive through sound, not analysis.',
  'A cross-tradition retreat in the mid-2000s. I hadn''t expected to be moved by poetry. I left the retreat reading everything Rumi wrote.',
  now() - interval '8 months'
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;


-- ------------------------------------
-- Sarah Kim (Tibetan Buddhism) — 3 reflections
-- ------------------------------------

INSERT INTO public.testimonies (user_id, resource_slug, impact, context, recommended_at)
VALUES (
  sarah,
  'when-things-fall-apart',
  'I read this during my divorce. Pema is not consoling — she''s bracing. She keeps saying: sit with this. Don''t run. The instruction felt impossible at the time. But the instruction was right.',
  'Recommended by my therapist, who was also a practitioner. She said: "This won''t make you feel better. But it might make you feel real." She was correct on both counts.',
  now() - interval '16 months'
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, impact, recommended_at)
VALUES (
  sarah,
  'the-way-of-the-bodhisattva',
  'The chapter on patience changed my relationship to anger. Not by making me less angry — by giving anger a different meaning. This is a text you study, not just read.',
  now() - interval '12 months'
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, impact, who_for, recommended_at)
VALUES (
  sarah,
  'the-miracle-of-mindfulness',
  'Short enough to finish in an afternoon, deep enough to study for years. Thich Nhat Hanh teaches through stories, and the story of the tangerine has never fully left me.',
  'Someone early in practice who feels overwhelmed by the literature. This one won''t overwhelm you.',
  now() - interval '2 months'
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;


END $$;


-- ============================================================
-- Summary
-- ============================================================
-- Practitioners seeded: 5
--   maya  (00000000-0000-0000-0000-000000000010) — Maya Chen,  Zen/Vipassana,    10+
--   james (00000000-0000-0000-0000-000000000011) — James O'Brien, Christian,     3-10
--   priya (00000000-0000-0000-0000-000000000012) — Priya Sharma,  Advaita,        1-3
--   david (00000000-0000-0000-0000-000000000013) — David Levi,   Cross-tradition, 10+
--   sarah (00000000-0000-0000-0000-000000000014) — Sarah Kim,    Tibetan,         3-10
--
-- Profiles with bio + practice_background: 4 (maya, james, david, sarah)
--
-- Reflections seeded: 15
--   Traditions covered: Zen, Theravada/Vipassana, Christian contemplative,
--     Advaita Vedanta, Tibetan Buddhism, Sufism, Taoism
--   Field breakdown:
--     impact only:          4  (zen-mind, full-catastrophe, interior-castle, tao-te-ching)
--     impact + context:     5  (a-path-with-heart, dark-night, i-am-that, essential-rumi, when-things-fall-apart)
--     impact + freeform:    2  (cloud-of-unknowing, be-here-now)
--     impact + who_for:     2  (cutting-through, the-miracle-of-mindfulness)
--     impact + context + freeform:  1  (none)
--     4-field:              1  (none)
--   All reflections: personal/experiential — no book reviews
