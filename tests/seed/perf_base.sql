-- Perf-only base data. Safe to re-run: inserts are idempotent.
-- Run against the isolated perf database, never the development database.
\set ON_ERROR_STOP on

BEGIN;

-- 100k synthetic students. They are analytics rows only; they never log in.
INSERT INTO users (uid, name, email, email_hash, role, is_verified, created_at)
SELECT
  gen_random_uuid(),
  'Perf Student ' || n,
  'perf.student.' || n || '@perf.local',
  'perf-student-hash-' || n,
  'student'::user_role,
  true,
  now() - (random() * 365) * interval '1 day'
FROM generate_series(1, 100000) AS n
ON CONFLICT (email_hash) DO NOTHING;

-- 100 synthetic mentors, so the mentor aggregation has realistic cardinality.
INSERT INTO users (uid, name, email, email_hash, role, is_verified, created_at)
SELECT
  gen_random_uuid(),
  'Perf Mentor ' || n,
  'perf.mentor.' || n || '@perf.local',
  'perf-mentor-hash-' || n,
  'mentor'::user_role,
  true,
  now() - (random() * 365) * interval '1 day'
FROM generate_series(1, 100) AS n
ON CONFLICT (email_hash) DO NOTHING;

-- 1,000 published courses assigned round-robin to the synthetic mentors.
WITH mentors AS (
  SELECT uid, row_number() OVER (ORDER BY email_hash) - 1 AS rn
  FROM users
  WHERE email_hash LIKE 'perf-mentor-hash-%'
),
admin AS (
  SELECT uid FROM users WHERE role = 'admin' LIMIT 1
),
category AS (
  SELECT uid FROM course_categories LIMIT 1
),
class_type AS (
  SELECT uid FROM class_types LIMIT 1
)
INSERT INTO courses (
  uid, mentor_uid, created_by_uid, category_uid, class_type_uid,
  title, subtitle, slot, slug, description, level, status,
  price, is_published, what_you_learn, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  m.uid,
  a.uid,
  c.uid,
  ct.uid,
  'Perf Course ' || n,
  'Synthetic course for load testing',
  100,
  'perf-course-' || n,
  'Synthetic course for load testing',
  'PEMULA'::course_level,
  'ACTIVE'::course_status,
  0,
  true,
  '["Perf fixture"]'::jsonb,
  now() - (random() * 365) * interval '1 day',
  now()
FROM generate_series(1, 1000) AS n
JOIN mentors m ON m.rn = (n - 1) % 100
CROSS JOIN admin a
CROSS JOIN category c
CROSS JOIN class_type ct
ON CONFLICT (slug) DO NOTHING;

COMMIT;

ANALYZE users;
ANALYZE courses;

SELECT 'base users' AS metric, count(*) AS value FROM users
UNION ALL
SELECT 'base courses', count(*) FROM courses;
