# Архитектура агентной системы

Два контура в одном репо: **runtime (микросервисы)** и **control plane (агенты)**.

```text
┌─────────────────────────────────────────────────────────────────┐
│                     CONTROL PLANE (Cursor)                      │
│                                                                 │
│  User prompt                                                    │
│       │                                                         │
│       ▼                                                         │
│  ┌──────────┐   policy    ┌─────────────┐   playbooks          │
│  │  Hooks   │────────────▶│   Agent     │◀──────── Skills      │
│  └──────────┘             │  (roles)    │◀──────── Rules       │
│                           └──────┬──────┘                      │
│                                  │                             │
│                                  ▼                             │
│                         OpenSpec changes                       │
│                    proposal / design / specs / tasks           │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   │ apply
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     RUNTIME (lab-4)                             │
│                                                                 │
│  Client → Gateway → Student → Report ──HttpService──▶ File API │
│                                              │                  │
│                                              ▼                  │
│                                           MinIO (S3)            │
│                                                                 │
│  Observability: Elastic APM → Kibana traces                     │
└─────────────────────────────────────────────────────────────────┘
```

## Компоненты control plane

### 1. Rules (`.cursor/rules`)

Долгоживущие ограничения модели: стиль Nest, запрет `synchronize: true`, кумулятивность веток.  
Аналог: `CONTRIBUTING.md` + lint rules, но инжектится в контекст агента автоматически.

### 2. Skills (`.cursor/skills`)

Процедурные playbooks с триггером по описанию задачи.  
Аналог: runbook в Notion / internal CLI docs. Агент **обязан** читать skill перед работой, а не импровизировать.

### 3. Hooks (`.cursor/hooks.json`)

Синхронные политики на событиях агента (shell, session).  
Аналог: pre-commit + OPA gate, только до выполнения опасной команды.

### 4. OpenSpec (`openspec/`)

Change control: что меняем, почему, acceptance, tasks.  
Аналог: RFC + Jira epic + checklist. Без этого lab с новой границей сервиса = хаос.

### 5. Roles (`AGENTS.md` + `roles.md`)

Разделение обязанностей снижает «агент сделал всё и сломал контракт».  
Handoff явный: Architect → Implementer → Verifier → Reviewer.

## Почему не один «всемогущий» агент

| Режим | Проблема | Наш ответ |
|-------|----------|-----------|
| Один чат на всё | теряется acceptance | OpenSpec artifacts |
| Сразу код | нет design trade-offs | Architect first |
| Без verify | «у меня locally works» | `rvip-verify-stack` |
| Без hooks | destructive ops | shell gate |

## Связь с lab-4 runtime

Агентная архитектура **не заменяет** микросервисную — она её производит:

- новый сервис `file-storage-service` появился как capability в change, не как «давай ещё папку»;
- sync call report→storage через `HttpService` зафиксирован как Nest-эквивалент RestTemplate;
- MinIO выбран как S3-compatible object storage (то, что реально используют в компаниях), а не `./uploads` на диске контейнера.
