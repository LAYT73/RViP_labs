## Context

Lab 1: один Nest-сервис + Postgres + Liquibase. Monorepo уже инициализирован.

## Goals

- Рабочий CRUD студентов
- Одна таблица через Liquibase
- Swagger + docker-compose (postgres, liquibase, student-service)

## Non-Goals

- report/gateway
- auth

## Decisions

- Entity `Student`: uuid PK, `fullName`, `course` 1–6, `status` enum `ENROLLED` | `EXPELLED`
- Validation: `class-validator` + global `ValidationPipe`
- Errors: Nest `NotFoundException` / `ConflictException` / `BadRequestException` (без отдельного filter, если не нужен)
- Liquibase changelog YAML/SQL в `liquibase/changelog/`
- Compose: liquibase зависит от healthy postgres; student-service зависит от liquibase completed
- Ports: Postgres `5432`, student-service `3001`
- Env: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`

## Risks

- Liquibase image/network timing — использовать healthcheck + `condition: service_completed_successfully` где возможно
