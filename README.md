# RViP labs

NestJS monorepo: учёт студентов (вариант 2).

## Stack

- NestJS + TypeORM + PostgreSQL
- Liquibase (миграции)
- Docker Compose

## Labs

- `lab-1` — student-service + Swagger
- `lab-2` — report-service + gateway
- `lab-3` — отчёт через HttpService из student-service

## Quick start (lab-1)

```bash
pnpm install
docker compose up --build
```

Swagger: http://localhost:3001/api/docs
