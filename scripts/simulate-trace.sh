#!/usr/bin/env bash
# Гоняет разные запросы через gateway и печатает X-Trace-Id + ссылки на waterfall в Kibana APM.
set -euo pipefail

GATEWAY="${GATEWAY:-http://localhost:3080}"
KIBANA="${KIBANA:-http://localhost:5601}"
ES="${ES:-http://localhost:9200}"
FLUSH_SEC="${FLUSH_SEC:-6}"

NAME="Trace Demo $(date +%H%M%S)"
TRACES=() # "label|method path|traceId|status"

req() {
  local label="$1" method="$2" path="$3"
  shift 3
  local headers body status trace
  headers=$(mktemp)
  body=$(mktemp)
  if [[ $# -gt 0 ]]; then
    curl -sS -X "$method" -D "$headers" -o "$body" \
      -H 'Content-Type: application/json' \
      -d "$1" \
      "$GATEWAY$path" || true
  else
    curl -sS -X "$method" -D "$headers" -o "$body" "$GATEWAY$path" || true
  fi
  status=$(awk 'NR==1{print $2}' "$headers")
  trace=$(awk -F': ' 'tolower($1)=="x-trace-id"{gsub(/\r/,"",$2); print $2}' "$headers")
  [[ -z "$trace" ]] && trace="-"
  printf '  %-28s %-6s %-32s → HTTP %s  X-Trace-Id: %s\n' \
    "$label" "$method" "$path" "$status" "$trace"
  local preview
  preview=$(head -c 120 "$body" | tr '\n' ' ')
  [[ -n "$preview" ]] && echo "    body: ${preview}"
  TRACES+=("${label}|${method} ${path}|${trace}|${status}")
  # shellcheck disable=SC2034
  LAST_BODY=$(cat "$body")
  rm -f "$headers" "$body"
}

print_stack() {
  local trace="$1"
  [[ -z "$trace" || "$trace" == "-" ]] && { echo "    (no trace)"; return; }
  curl -s "$ES/apm-*/_search" -H 'Content-Type: application/json' -d "{
    \"size\": 50,
    \"sort\": [{\"@timestamp\": \"asc\"}],
    \"query\": {\"term\": {\"trace.id\": \"$trace\"}},
    \"_source\": [\"processor.event\",\"service.name\",\"transaction.name\",\"span.name\",\"span.type\"]
  }" | python3 -c '
import json,sys
d=json.load(sys.stdin)
print("    docs:", d["hits"]["total"])
for h in d["hits"]["hits"]:
  s=h["_source"]
  ev=s.get("processor",{}).get("event","?")
  svc=s.get("service",{}).get("name","?")
  name=s.get("transaction",{}).get("name") or s.get("span",{}).get("name") or "?"
  indent="  " if ev=="span" else ""
  print(f"    {indent}{ev:12} {svc:18} {name}")
'
}

echo "==> Warm-up (health cache)..."
curl -sf -o /dev/null "$GATEWAY/api/students" || true
sleep 1

echo
echo "==> Requests via gateway"
req "list students"   GET  /api/students
req "enroll student"  POST /api/students "{\"fullName\":\"${NAME}\",\"course\":1}"

STUDENT_ID=$(python3 -c 'import json,sys; print(json.load(sys.stdin).get("id",""))' <<<"$LAST_BODY" 2>/dev/null || true)
if [[ -z "$STUDENT_ID" ]]; then
  echo "WARN: enroll did not return id — skip id-based calls"
else
  echo "    student id: $STUDENT_ID"
  req "get student"           GET  "/api/students/${STUDENT_ID}"
  req "update student"        PUT  "/api/students/${STUDENT_ID}" "{\"fullName\":\"${NAME} Updated\",\"course\":2}"
  req "transfer student"      POST "/api/students/${STUDENT_ID}/transfer" '{"course":3}'
  req "academic leave"        POST "/api/students/${STUDENT_ID}/academic-leave"
  req "return from leave"     POST "/api/students/${STUDENT_ID}/return-from-academic-leave"
fi

req "report by-course" GET /api/reports/by-course

echo
echo "==> Waiting ${FLUSH_SEC}s for APM flush..."
sleep "$FLUSH_SEC"

echo
echo "==> Stacks + Kibana links"
for entry in "${TRACES[@]}"; do
  IFS='|' read -r label route trace status <<<"$entry"
  echo
  echo "—— ${label} (${route}, HTTP ${status})"
  echo "   X-Trace-Id: ${trace}"
  print_stack "$trace"
  if [[ "$trace" != "-" ]]; then
    echo "   Kibana: ${KIBANA}/app/apm/traces?kuery=trace.id%20%3A%20%22${trace}%22&rangeFrom=now-15m&rangeTo=now"
  fi
done

echo
echo "Все Traces: ${KIBANA}/app/apm/traces?rangeFrom=now-15m&rangeTo=now"
echo "Services:   ${KIBANA}/app/apm/services?rangeFrom=now-15m&rangeTo=now"
