# Роли агентов и handoff

Роли — это не разные модели, а **разные контракты поведения** в одном Cursor Agent. Перед задачей роль называют явно («работай как Reviewer»).

## Architect

**Миссия:** зафиксировать границы и trade-offs.  
**Читает:** `task/task.md`, текущий `docker-compose.yml`, соседние labs.  
**Пишет:** OpenSpec proposal/design/specs/tasks, короткие ADR в design.  
**Стоп-линия:** не коммитит runtime-код; если тянет руки — создаёт task, не файл сервиса.

Вопросы, которые обязан закрыть:

1. Кто владелец данных / файла?
2. Sync или async между сервисами?
3. Что торчит наружу (host ports)?
4. Что Explicit Non-goal для этой лабы?

## Implementer

**Миссия:** закрыть `tasks.md` минимальным диффом.  
**Читает:** design + specs + существующие apps как образец.  
**Пишет:** код, compose, postman, README-demo.  
**Стоп-линия:** не меняет acceptance; при блокере эскалирует в Architect (обновить design).

Чеклист перед «готово»:

- зеркало соседнего сервиса (health, apm, Dockerfile);
- env в `.env.example`;
- нет секретов в git.

## Verifier

**Миссия:** доказать, что система делает то, что в спеке.  
**Делает:** `compose up`, curl/Postman, сверка status codes и тела, при необходимости APM trace.  
**Пишет:** короткий отчёт pass/fail + команды воспроизведения.  
**Стоп-линия:** не чинит код сам в той же роли; fail → обратно Implementer.

## Reviewer

**Миссия:** взгляд tech lead до push/защиты.  
Смотрит:

- контракты API и обратная совместимость внутри ветки;
- failure modes (502 storage down, empty report);
- безопасность (MinIO creds только env, нет world-writable volumes лишних);
- читаемость для защиты (README не врёт).

Не устраивает большой refactor «пока здесь».

## Handoff protocol

```text
Architect  --(tasks ready)-->  Implementer
Implementer --(builds green)--> Verifier
Verifier   --(pass)----------> Reviewer
Reviewer   --(LGTM)----------> human push / archive
Verifier   --(fail)-----------> Implementer (с repro)
```

Артефакт handoff — всегда файл или явный список (tasks checkboxes / verify report), не «в чате договорились».
