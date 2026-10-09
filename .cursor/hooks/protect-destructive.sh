#!/usr/bin/env bash
# Gate destructive git/docker commands. Fail closed.
set -euo pipefail

INPUT="$(cat)"
CMD="$(printf '%s' "$INPUT" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("command",""))' 2>/dev/null || true)"

deny() {
  local msg="$1"
  python3 -c 'import json,sys; print(json.dumps({"permission":"deny","user_message":sys.argv[1],"agent_message":sys.argv[1]}))' "$msg"
  exit 0
}

ask() {
  local msg="$1"
  python3 -c 'import json,sys; print(json.dumps({"permission":"ask","user_message":sys.argv[1],"agent_message":sys.argv[1]}))' "$msg"
  exit 0
}

# Hard deny: force push to main/master
if printf '%s' "$CMD" | grep -Eqi 'git[[:space:]]+push[[:space:]]+.*(--force|-f)([[:space:]]|$).*(main|master)'; then
  deny "Blocked: force-push to main/master is not allowed in this repo."
fi

# Ask: volume wipe
if printf '%s' "$CMD" | grep -Eqi 'docker[[:space:]]+compose[[:space:]]+.*down[[:space:]]+.*-v|docker-compose[[:space:]]+.*down[[:space:]]+.*-v'; then
  ask "This will wipe Compose volumes (Postgres/MinIO/ES data). Confirm explicitly if intended."
fi

# Ask: hard reset
if printf '%s' "$CMD" | grep -Eqi 'git[[:space:]]+reset[[:space:]]+--hard'; then
  ask "git reset --hard discards local work. Confirm if intended."
fi

printf '%s\n' '{"permission":"allow"}'
exit 0
