## Why

Лаба 3: убрать прямой доступ к report-service; клиент получает отчёт через первый сервис, который ходит во второй по HttpService (аналог RestTemplate).

## What Changes

- student-service: `GET /api/reports/by-course` через `HttpService` → report-service
- report-service: не публиковать порт наружу; доступ только из docker-сети
- gateway: `/api/reports` проксировать на student-service (не на report)
- обновить Postman

## Capabilities

### New Capabilities

- `report-proxy`: student-service проксирует отчёт через HttpService

### Modified Capabilities

- `api-gateway`: reports route target меняется на student-service; прямой доступ к report закрыт

## Non-goals

- CSV / file storage / queues
- Auth

## Impact

- `apps/student-service/**`, `apps/gateway/**`, `docker-compose.yml`, `postman/`
