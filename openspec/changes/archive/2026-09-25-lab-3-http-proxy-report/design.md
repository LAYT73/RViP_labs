## Context

Lab 2 has report + gateway with direct routes to both services.

## Goals

- Close host access to report-service
- Proxy reports through student-service via HttpService
- Gateway report path → student-service

## Decisions

- `REPORT_SERVICE_URL=http://report-service:3002` inside student container; local default `http://localhost:3002` only for dev (port unpublished in compose lab-3 — local run of report still possible via compose network / optional internal)
- For compose: remove `ports` from report-service entirely
- Gateway: both `/api/students` and `/api/reports` → `STUDENT_SERVICE_URL`
- HttpModule register with timeout; map axios errors to BadGatewayException

## Non-Goals

- Changing report SQL
