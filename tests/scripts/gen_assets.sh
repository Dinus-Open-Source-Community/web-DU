#!/usr/bin/env bash
# Regenerate the static asset list from the production build.
# Run after `npm run build`: ./tests/scripts/gen_assets.sh
set -euo pipefail

python3 - <<'PY'
import json
import re
from pathlib import Path

root = Path("frontend/dist")
html = (root / "index.html").read_text(encoding="utf-8")
paths = re.findall(r'(?:src|href)="(/assets/[^"]+)"', html)
paths += ["/Logo.svg", "/favicon.ico"]

# Match the Latin font weights the dashboard actually requests.
for pattern in (
    "assets/plus-jakarta-sans-latin-(400|500|600|700)-normal-*.woff2",
    "assets/dynapuff-latin-700-normal-*.woff2",
):
    for path in sorted(root.glob(pattern)):
        paths.append("/" + path.relative_to(root).as_posix())

unique = list(dict.fromkeys(paths))
missing = [p for p in unique if not (root / p.lstrip("/")).is_file()]
if missing:
    raise SystemExit(f"missing built assets: {missing}")

Path("tests/assets.json").write_text(json.dumps(unique, indent=2) + "\n", encoding="utf-8")
print(f"wrote tests/assets.json ({len(unique)} assets)")
PY
