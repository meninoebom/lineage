-- Seed Founder Recommendations
-- ==============================
-- Seeds the testimonies table with founder recommendations on canonical texts
-- across major contemplative traditions. This gives the site a "lived-in" feel
-- at launch so resource pages don't show empty recommendation counts.
--
-- Run with: psql <connection_string> -f supabase/seed-recommendations.sql
-- Or paste into the Supabase SQL Editor using the service role key.
--
-- IMPORTANT: Replace the placeholder UUIDs below with real user IDs from
-- auth.users after your Supabase project is set up and founder accounts exist.
-- These UUIDs are placeholders only — inserts will fail if the referenced
-- profiles don't exist (foreign key constraint).
--
-- Idempotent: uses ON CONFLICT (user_id, resource_slug) DO NOTHING,
-- so re-running this script won't create duplicates.

-- Placeholder founder user IDs (replace with real UUIDs after signup)
-- founder_1: Brandon (primary founder account)
-- founder_2: Second founder / early tester account

DO $$
DECLARE
  founder_1 uuid := '00000000-0000-0000-0000-000000000001';
  founder_2 uuid := '00000000-0000-0000-0000-000000000002';
BEGIN

-- ============================================================
-- ZEN / CHAN BUDDHISM (5 resources)
-- ============================================================

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'zen-mind-beginners-mind', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_2, 'zen-mind-beginners-mind', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'the-platform-sutra', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'blue-cliff-record', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'the-gateless-gate-mumonkan', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_2, 'diamond-sutra', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'diamond-sutra', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

-- The Miracle of Mindfulness — with testimony
INSERT INTO public.testimonies (user_id, resource_slug, impact, recommended_at)
VALUES (
  founder_1,
  'the-miracle-of-mindfulness',
  'This was my first real meditation book. Thich Nhat Hanh makes mindfulness feel like the most natural thing in the world — washing dishes, drinking tea, breathing. It gave me permission to start exactly where I was.',
  now()
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;


-- ============================================================
-- THERAVADA / VIPASSANA (5 resources)
-- ============================================================

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'mindfulness-in-plain-english', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_2, 'mindfulness-in-plain-english', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'a-path-with-heart', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_2, 'a-path-with-heart', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'goldstein-insight-meditation', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'satipatthana-direct-path', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

-- Mindfulness by Goldstein — with testimony
INSERT INTO public.testimonies (user_id, resource_slug, impact, recommended_at)
VALUES (
  founder_2,
  'goldstein-mindfulness',
  'The most comprehensive guide to the Satipatthana Sutta I have found. Goldstein walks through each foundation of mindfulness with clarity and decades of practice behind every sentence.',
  now()
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;


-- ============================================================
-- TIBETAN BUDDHISM / VAJRAYANA (5 resources)
-- ============================================================

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'cutting-through-spiritual-materialism', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_2, 'cutting-through-spiritual-materialism', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'when-things-fall-apart', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_2, 'when-things-fall-apart', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'the-way-of-the-bodhisattva', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'tibetan-book-of-living-and-dying', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'rinpoche-the-words-of-my-perfect-teacher', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;


-- ============================================================
-- ADVAITA VEDANTA / HINDUISM (5 resources)
-- ============================================================

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'i-am-that', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_2, 'i-am-that', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'maharshi-be-as-you-are', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'bhagavad-gita', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_2, 'bhagavad-gita', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'yoga-sutras-of-patanjali', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

-- I Am That — with testimony
INSERT INTO public.testimonies (user_id, resource_slug, impact, recommended_at)
VALUES (
  founder_2,
  'maharshi-the-spiritual-teaching-of-ramana-maharshi',
  'Ramana Maharshi''s self-inquiry method is deceptively simple — "Who am I?" — but sitting with this book changed the way I relate to every thought that arises. A foundational text for anyone drawn to direct investigation.',
  now()
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;


-- ============================================================
-- CHRISTIAN CONTEMPLATIVE (5 resources)
-- ============================================================

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'cloud-of-unknowing', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'dark-night-of-the-soul', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'interior-castle', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_2, 'keating-open-mind-open-heart', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'keating-open-mind-open-heart', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

-- Cloud of Unknowing — with testimony
INSERT INTO public.testimonies (user_id, resource_slug, impact, recommended_at)
VALUES (
  founder_2,
  'cloud-of-unknowing',
  'A 14th-century anonymous monk writing about letting go of concepts to rest in pure presence — and it reads like it could have been written yesterday. The apophatic path in its most distilled form.',
  now()
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;


-- ============================================================
-- SUFISM (4 resources)
-- ============================================================

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'essential-rumi', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_2, 'essential-rumi', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'the-conference-of-the-birds', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'helminski-living-presence-revised', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'the-heart-of-sufism', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

-- Conference of the Birds — with testimony
INSERT INTO public.testimonies (user_id, resource_slug, impact, recommended_at)
VALUES (
  founder_2,
  'the-conference-of-the-birds',
  'Attar''s allegory of the soul''s journey is one of the most beautiful things I''ve ever read. The birds searching for the Simurgh only to discover it was themselves all along — that landing has stayed with me for years.',
  now()
)
ON CONFLICT (user_id, resource_slug) DO NOTHING;


-- ============================================================
-- TAOISM (1 resource — small tradition representation in catalog)
-- ============================================================

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'tao-te-ching', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_2, 'tao-te-ching', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;


-- ============================================================
-- MAHAYANA / CROSS-TRADITION (2 resources)
-- ============================================================

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_1, 'the-heart-sutra', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;

INSERT INTO public.testimonies (user_id, resource_slug, recommended_at)
VALUES (founder_2, 'the-heart-sutra', now())
ON CONFLICT (user_id, resource_slug) DO NOTHING;


END $$;

-- ============================================================
-- Summary
-- ============================================================
-- Total recommendations seeded: ~45
-- Traditions covered: Zen/Chan, Theravada/Vipassana, Tibetan/Vajrayana,
--   Advaita Vedanta/Hinduism, Christian Contemplative, Sufism, Taoism, Mahayana
-- Bare recommendations (recommend only): ~40
-- Recommendations with testimony text: 5
--   - The Miracle of Mindfulness (Zen)
--   - Mindfulness by Goldstein (Theravada)
--   - Spiritual Teaching of Ramana Maharshi (Advaita)
--   - The Cloud of Unknowing (Christian)
--   - The Conference of the Birds (Sufism)
