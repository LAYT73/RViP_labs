# Lab 4

Учёт студентов. На этой ветке CSV отчёта report кладёт в файловое хранилище синхронным `HttpService`. Очереди нет.

Схема: [docs/architecture.md](docs/architecture.md).

## Поднять

```bash
pnpm install
docker compose up --build
```

Если Elasticsearch не стартует на Mac: `sudo sysctl -w vm.max_map_count=262144`.

| Куда | Зачем |
|------|--------|
| http://localhost:3080 | Единственный вход для клиента |
| http://localhost:3001/api/docs | Swagger |
| http://localhost:9001 | Консоль хранилища, `minioadmin` / `minioadmin` |
| http://localhost:5601 | Kibana, трейсы |

Report с хоста не открывается. RabbitMQ на этой ветке не запускается.

Проверка:

```bash
curl -s http://localhost:3080/api/reports/by-course/export
```

В ответе сразу `id`, `objectKey`, `bucket` и `rows`. Это не `queued`. JSON без файла: `GET /api/reports/by-course`.

Postman: [postman/lab-4.postman_collection.json](postman/lab-4.postman_collection.json).

## Как делать следующую лабу

Следующая по методичке — lab 5: те же данные CSV уходят в storage через очередь, а не через `HttpService`. Чтение файла «как CompletableFuture» и JWT — не эта лаба.

Не пиши агенту «сделай 5 и заодно очередь с футурами». Порядок такой.

1. Ветка от этой:

```bash
git checkout lab-4
git checkout -b lab-5
```

2. В чате Cursor: «роль Architect, код не пиши». Попроси прочитать lab 5 в `task/task.md`, [docs/architecture.md](docs/architecture.md) и `openspec/specs/file-storage`. Запусти `/opsx-explore`. Нужно явно решить: export больше не ждёт `POST /api/files`, клиент получает факт постановки в очередь, storage забирает сообщение сам.

3. `/opsx-propose` с именем вроде `lab-5-report-queue`. Смотри `openspec/changes/lab-5-report-queue/`: `proposal.md`, `design.md`, `specs/`, `tasks.md`. В Non-goals должно быть написано, что sync-вызов storage для export убирается, а lab 6 не делается. Пока это не так — правь спеку.

4. «роль Implementer, `/opsx-apply`, только `tasks.md`». На `lab-4` эти правки не коммить.

5. Проверка:

```bash
docker compose up --build
curl -s http://localhost:3080/api/reports/by-course/export
```

Ждёшь `status: queued`. Потом объект в бакете. Если ответ снова с `objectKey` без очереди — это ещё lab 4, не сдавай.

6. Reviewer смотрит, что README и `docs/architecture.md` описывают очередь, а не HttpService. Дальше `/opsx-archive` и push `lab-5`.

Роли: [AGENTS.md](AGENTS.md). Шаги те же, что в [docs/agent-platform/pipeline.md](docs/agent-platform/pipeline.md).

Спека этой лабы: `openspec/changes/archive/2026-10-10-lab-4-file-storage/`.
