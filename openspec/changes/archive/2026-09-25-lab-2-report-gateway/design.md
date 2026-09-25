## Context

Lab 1 done. Shared Postgres + Liquibase already exist.

## Goals

- report-service on same DB
- Nest gateway with http-proxy-middleware
- Postman collection hitting gateway

## Decisions

- Ports: report `3002`, gateway `3000`, student remains `3001`
- Gateway routes: `/api/students` → student, `/api/reports` → report (path preserved)
- Report uses TypeORM queryBuilder / raw group by on `students` where status=ENROLLED
- Duplicate Student entity lightly in report-service (or minimal query without full CRUD) — keep a thin entity for TypeORM mapping only
- Compose: both services on `rvip-net`; gateway depends on both

## Non-Goals

- Closing direct ports on report (lab-3)
