#!/usr/bin/env bash
# Generate short-lived JWT tokens once, before a load test.
# Usage: BASE_URL=http://localhost:8081 ./tests/scripts/gen_tokens.sh
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8081}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@doscom.id}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"
SUPERADMIN_EMAIL="${SUPERADMIN_EMAIL:-superadmin@doscom.id}"
SUPERADMIN_PASSWORD="${SUPERADMIN_PASSWORD:-superadmin123}"
OUT="${OUT:-tests/tokens.json}"

login() {
  curl -fsS -X POST "$BASE_URL/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$1\",\"password\":\"$2\"}"
}

ADMIN_JSON=$(login "$ADMIN_EMAIL" "$ADMIN_PASSWORD")
SUPER_JSON=$(login "$SUPERADMIN_EMAIL" "$SUPERADMIN_PASSWORD")

python3 - "$OUT" "$ADMIN_JSON" "$SUPER_JSON" <<'PY'
import json
import sys

out, admin_raw, super_raw = sys.argv[1], sys.argv[2], sys.argv[3]
admin = json.loads(admin_raw)["data"]
superadmin = json.loads(super_raw)["data"]
payload = {
    "admin": {"token": admin["token"], "expires_at": admin["expires_at"]},
    "superadmin": {"token": superadmin["token"], "expires_at": superadmin["expires_at"]},
}
with open(out, "w", encoding="utf-8") as handle:
    json.dump(payload, handle, indent=2)
print(f"wrote {out} (admin exp {admin['expires_at']}, superadmin exp {superadmin['expires_at']})")
PY
