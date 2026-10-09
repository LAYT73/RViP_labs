# Lab 5

Учёт студентов. На этой ветке CSV отчёта уходит в файловое хранилище через RabbitMQ, не прямым HTTP.

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
| http://localhost:15672 | RabbitMQ, `guest` / `guest` |
| http://localhost:9001 | Консоль хранилища, `minioadmin` / `minioadmin` |
| http://localhost:5601 | Kibana, трейсы |

Report с хоста не открывается.

Проверка:

```bash
curl -s http://localhost:3080/api/reports/by-course/export
```

Ответ сразу `status: queued` и `jobId`. Файл в бакете `reports` появляется после consumer. JSON-отчёт без очереди: `GET /api/reports/by-course`.

Postman: [postman/lab-5.postman_collection.json](postman/lab-5.postman_collection.json).

## Как делать следующую лабу

Следующая по методичке — lab 6: основной сервис читает отчёт из файлового хранилища через аналог `CompletableFuture` (у нас это async в Nest, не новый брокер). JWT и сортировка — не эта лаба.

Не пиши агенту «сделай 6». Он начнёт код без контракта. Порядок такой.

1. Ветка от этой, не от `lab-4`:

```bash
git checkout lab-5
git checkout -b lab-6
```

2. В чате Cursor: «роль Architect, код не пиши». Попроси прочитать пункт lab 6 в `task/task.md` и текущие [docs/architecture.md](docs/architecture.md) и `openspec/specs/`. Запусти `/opsx-explore`. На выходе должны быть ответы: кто ходит в storage, что возвращает API, что остаётся в очереди как есть.

3. `/opsx-propose` с именем вроде `lab-6-async-file-read`. В `openspec/changes/lab-6-async-file-read/` появятся `proposal.md`, `design.md`, `specs/`, `tasks.md`. Прочитай их сам. Пока задачи не сходятся с методичкой, код не нужен: правь спеку.

4. Когда tasks устраивают: «роль Implementer, `/opsx-apply`, только `tasks.md`». Агент не добавляет lab 7. Секреты — в `.env.example`, не в `.env`.

5. Проверка на живом compose, не «собралось»:

```bash
docker compose up --build
curl -sD- http://localhost:3080/api/reports/by-course/export
```

Плюс новый сценарий чтения файла из storage, как его зафиксировали в спеке. Упало — обратно Implementer с командой, которая падает.

6. «роль Reviewer»: контракт, порты, README этой ветки. Потом `/opsx-archive` и push `lab-6`.

Роли и стоп-линии: [AGENTS.md](AGENTS.md). Подробнее по шагам: [docs/agent-platform/pipeline.md](docs/agent-platform/pipeline.md).

Спеки этой лабы уже в архиве: `openspec/changes/archive/2026-10-10-lab-5-report-queue/`.
