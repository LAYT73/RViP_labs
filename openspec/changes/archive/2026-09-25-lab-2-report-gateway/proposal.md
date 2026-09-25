## Why

Лаба 2: второй сервис отчётов по той же БД и API-шлюз для доступа к обоим сервисам через единую точку (проверка через Postman).

## What Changes

- `report-service`: `GET /api/reports/by-course` — агрегация enrolled студентов по курсам
- `gateway`: прокси `/students/**` → student-service, `/reports/**` → report-service
- Docker Compose: добавить report-service и gateway
- Минимальная Postman-коллекция

## Capabilities

### New Capabilities

- `course-reports`: отчёт количества студентов по курсам
- `api-gateway`: единый вход к student и report сервисам

### Modified Capabilities

- (нет requirement-level изменений students)

## Non-goals

- Убрать прямой доступ к report (это lab-3)
- HttpService-прокси из student-service
- Auth

## Impact

- `apps/report-service/**`, `apps/gateway/**`, `docker-compose.yml`, `nest-cli.json`, `postman/`
