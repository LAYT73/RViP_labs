---
name: rvip-verify-stack
description: >-
  Smoke-verify the Docker Compose stack after service or compose changes:
  health endpoints, gateway happy-path, optional APM trace. Use after
  implementing a lab or fixing runtime wiring.
---

# RViP verify stack

## Steps

1. `docker compose ps` — expected services up (or `compose up --build -d` if down).
2. Hit health of changed services.
3. Happy-path via **gateway** (not bypassing it unless testing an internal API on purpose):

| Branch | Command |
|--------|---------|
| lab-3+ | `curl -sD- http://localhost:3080/api/reports/by-course` |
| lab-4+ | `curl -sD- http://localhost:3080/api/reports/by-course/export` |
| lab-5+ | same export; confirm async/queue behavior per README |

4. If export returns `id`, fetch content from file-storage (`/api/files/:id/content`) or MinIO console.
5. Optional: `./scripts/simulate-trace.sh` and confirm services in the printed stack.
6. Report: PASS/FAIL table with HTTP codes and one repro command per failure.

## Fail policy

Do not silently “fix while verifying” under this skill. Return failures to Implementer with repro.
