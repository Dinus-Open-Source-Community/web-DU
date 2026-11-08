#!/usr/bin/env bash
# Sample backend/DB/k6 resource use independently while a k6 run is active.
# Usage: ./tests/scripts/monitor.sh results/dashboard/resources-run-1.csv 900
set -euo pipefail

OUT="${1:?usage: $0 <csv-path> [seconds]}"
DURATION="${2:-900}"
INTERVAL="${INTERVAL:-2}"
DBUSER="$(grep '^DB_USER=' .env | cut -d= -f2-)"
DBUSER="${DBUSER:-doscom}"
mkdir -p "$(dirname "$OUT")"

echo "timestamp_ms,backend_cpu_pct,backend_mem,db_cpu_pct,db_mem,pg_connections,pg_active,proc_cpu_pct,proc_rss_kb" > "$OUT"

start=$SECONDS
while (( SECONDS - start < DURATION )); do
  ts="$(date +%s%3N)"
  stats="$(docker stats --no-stream --format '{{.Name}},{{.CPUPerc}},{{.MemUsage}}' web-du-backend-perf web-du-db-perf 2>/dev/null || true)"
  backend_cpu="$(awk -F, '$1=="web-du-backend-perf"{gsub(/%/,"",$2); print $2}' <<<"$stats")"
  backend_mem="$(awk -F, '$1=="web-du-backend-perf"{print $3}' <<<"$stats")"
  db_cpu="$(awk -F, '$1=="web-du-db-perf"{gsub(/%/,"",$2); print $2}' <<<"$stats")"
  db_mem="$(awk -F, '$1=="web-du-db-perf"{print $3}' <<<"$stats")"
  conns="$(docker exec web-du-db-perf psql -U "$DBUSER" -d doscom_perf -Atc "select count(*) || ',' || count(*) filter (where state='active') from pg_stat_activity where datname='doscom_perf';" 2>/dev/null || echo '0,0')"
  proc="$(ps -eo %cpu=,rss=,comm= 2>/dev/null | awk '$3=="k6" || $3=="loadgen" {cpu+=$1; rss+=$2} END {printf "%.1f %d", cpu+0, rss+0}')"
  conn_total="${conns%%,*}"
  conn_active="${conns##*,}"
  proc_cpu="${proc%% *}"
  proc_rss="${proc##* }"
  printf '%s,%s,"%s",%s,"%s",%s,%s,%s,%s\n' \
    "$ts" "${backend_cpu:-0}" "${backend_mem:-0B / 0B}" "${db_cpu:-0}" "${db_mem:-0B / 0B}" "${conn_total:-0}" "${conn_active:-0}" "${proc_cpu:-0}" "${proc_rss:-0}" >> "$OUT"
  sleep "$INTERVAL"
done

echo "wrote $OUT"
