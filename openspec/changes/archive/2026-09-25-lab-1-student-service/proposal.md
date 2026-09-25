## Why

Нужен основной сервис учёта студентов: CRUD по одной таблице, миграции Liquibase, запуск локально и в Docker, демонстрация через Swagger.

## What Changes

- NestJS `student-service` с доменными операциями: принять, отчислить, редактировать, перевести на курс
- PostgreSQL + Liquibase (одна таблица `students`)
- TypeORM без auto-DDL
- Swagger UI
- Docker Compose: postgres, liquibase, student-service в одной сети

## Capabilities

### New Capabilities

- `students`: жизненный цикл записи студента (enroll/edit/transfer/expel/list/get)
- `student-service-ops`: локальный и docker-запуск, миграции, Swagger

### Modified Capabilities

- (нет)

## Non-goals

- Gateway, report-service, HttpService-прокси
- JWT, очереди, файловое хранилище
- Более одной таблицы

## Impact

- `apps/student-service/**`
- `liquibase/**`
- `docker-compose.yml`
- зависимости уже в root `package.json`
