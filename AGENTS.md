# AGENTS.md — как агентам работать в этом репозитории

Этот файл — контракт между человеком и агентами Cursor. Цель: воспроизводимая инженерная работа, а не «чат с кодом».

## Стек и границы

- NestJS 11 monorepo (pnpm), PostgreSQL + Liquibase, Docker Compose.
- Домен: учёт студентов (вариант 2).
- Ветки кумулятивные: `lab-1` → `lab-2` → `lab-3` → `lab-4` → `lab-5`.
- Spring-термины методички → Nest: RestTemplate → `HttpService`, CompletableFuture → позже.

Подробности агентной платформы: [`docs/agent-platform/`](docs/agent-platform/README.md).

## Роли (выбирать явно)

| Роль | Когда | Что делает | Чего не делает |
|------|--------|------------|----------------|
| **Architect** | новая лаба / смена границ сервисов | proposal, design, ADR-коротко | не пишет прод-код |
| **Implementer** | есть approved design/tasks | код, compose, postman | не меняет scope молча |
| **Reviewer** | перед push / защитой | риски, контракты, регрессии | не рефакторит «заодно» |
| **Verifier** | после impl | curl/compose/APM smoke | не чинит, только фиксирует fail |

Маршрутизация: если задача про «как устроить» → Architect; «сделай» → Implementer; «проверь» → Verifier; «посмотри глазами сеньора» → Reviewer.

## Обязательный пайплайн

```text
Explore → Propose (OpenSpec) → Apply → Verify → Archive → Demo notes
```

1. **Explore** — `/opsx-explore` или skill `openspec-explore`: уточнить ambiguity.
2. **Propose** — `/opsx-propose`: `proposal` + `specs` + `design` + `tasks`.
3. **Apply** — `/opsx-apply`: только по `tasks.md`, чекбоксы.
4. **Verify** — skill `rvip-verify-stack`: health + ключевой happy-path + (если APM) trace.
5. **Archive** — `/opsx-archive` когда лаба стабильна на ветке.

Не прыгать из «сделай lab-N» сразу в код без артефактов, если меняются границы сервисов или контракты API.

## Skills (проектные)

| Skill | Назначение |
|-------|------------|
| `openspec-*` | спеки / apply / archive |
| `rvip-lab-delivery` | end-to-end сдача лабы под методичку |
| `rvip-verify-stack` | smoke после изменений compose/сервисов |

## Hooks (автоматические ограничения)

См. `.cursor/hooks.json`:

- блокировка разрушительных git/docker команд без явного confirm;
- session context: ветка + lab hint.

## Правила кода

`.cursor/rules/` — conventions Nest monorepo и safety по веткам. Не плодить сервисы «на будущее»; только то, что требует текущая лаба.

## Do / Don't

**Do**

- Держать один публичный вход: gateway.
- Прятать внутренние сервисы (report с lab-3) от host ports.
- Маппить требования методички явно в README/task.

**Don't**

- `synchronize: true` в TypeORM.
- Force-push в `main`/`master`.
- `docker compose down -v` без явной просьбы (сотрёт Postgres/MinIO data).
- Тащить lab-N+1 фичи в текущую ветку.
