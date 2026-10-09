#!/usr/bin/env bash
# Inject branch / lab hint at session start.
set -euo pipefail
# stdin JSON from Cursor — ignore body, we only add context
cat >/dev/null || true

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
BRANCH="$(git -C "$ROOT" branch --show-current 2>/dev/null || echo unknown)"
LAB_HINT="$BRANCH"
case "$BRANCH" in
  lab-4) LAB_HINT="lab-4: CSV → file-storage (HttpService) → MinIO; agent docs in docs/agent-platform/" ;;
  lab-5) LAB_HINT="lab-5: report → queue → file-storage; no sync HttpService for store path" ;;
  lab-3) LAB_HINT="lab-3: report hidden; student HttpService proxy + APM" ;;
esac

# sessionStart: additional_context is commonly supported for injection
python3 - <<PY
import json
ctx = """RViP agent session
Branch: ${BRANCH}
Focus: ${LAB_HINT}
Read AGENTS.md and docs/agent-platform/ before changing service boundaries.
Roles: Architect | Implementer | Reviewer | Verifier
Pipeline: Explore → Propose → Apply → Verify → Archive
"""
print(json.dumps({"additional_context": ctx}))
PY
