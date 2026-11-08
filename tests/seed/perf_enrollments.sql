-- Replace perf enrollments with :rows rows. Run with:
--   docker exec -i web-du-db-perf psql -U doscom -d doscom_perf -v rows=1000000 < tests/seed/perf_enrollments.sql
-- Only the isolated perf database is touched.
\set ON_ERROR_STOP on

BEGIN;

TRUNCATE TABLE enrollments CASCADE;

WITH students AS (
  SELECT uid, row_number() OVER (ORDER BY email_hash) - 1 AS i
  FROM users
  WHERE email_hash LIKE 'perf-student-hash-%'
),
courses AS (
  SELECT uid, row_number() OVER (ORDER BY slug) - 1 AS j
  FROM courses
  WHERE slug LIKE 'perf-course-%'
),
generated AS (
  SELECT
    n,
    n % 100000 AS student_i,
    ((n / 100000) + (n % 1000)) % 1000 AS course_j,
    now() - (random() * 180) * interval '1 day' AS enrolled_at,
    CASE
      WHEN random() < 0.35 THEN 0::numeric
      WHEN random() < 0.60 THEN round((random() * 0.49)::numeric, 2)
      WHEN random() < 0.90 THEN round((0.50 + random() * 0.49)::numeric, 2)
      ELSE 1.0::numeric
    END AS progress
  FROM generate_series(0, (:rows)::int - 1) AS n
)
INSERT INTO enrollments (uid, user_uid, course_uid, enrolled_at, progress, status)
SELECT
  gen_random_uuid(),
  s.uid,
  c.uid,
  g.enrolled_at,
  g.progress,
  'active'::enrollment_status
FROM generated g
JOIN students s ON s.i = g.student_i
JOIN courses c ON c.j = g.course_j;

COMMIT;

ANALYZE enrollments;

SELECT 'enrollments' AS metric, count(*) AS value FROM enrollments;
