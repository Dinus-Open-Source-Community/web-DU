#!/usr/bin/env bash
# Reset only the isolated perf database to a chosen enrollment volume.
# Usage: ./tests/scripts/reset_dataset.sh 10000|100000|1000000
set -euo pipefail

ROWS="${1:?usage: $0 <rows>}"
DBUSER="$(grep '^DB_USER=' .env | cut -d= -f2-)"
DBUSER="${DBUSER:-doscom}"

docker exec -i web-du-db-perf psql -U "$DBUSER" -d doscom_perf -v rows="$ROWS" \
  < tests/seed/perf_enrollments.sql

docker exec web-du-db-perf psql -U "$DBUSER" -d doscom_perf -Atc \
  "select 'users=' || count(*) from users
   union all select 'courses=' || count(*) from courses
   union all select 'enrollments=' || count(*) from enrollments;"
