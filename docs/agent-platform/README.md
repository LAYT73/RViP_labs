# Agent Platform (Cursor) — обзор для защиты lab-4

Документ описывает **как устроена агентная разработка** в этом репозитории: не «я попросил ChatGPT написать код», а управляемый конвейер с ролями, спеками, skills и hooks.

Целевая аудитория: руководитель/препод, который смотрит на зрелость процесса так же, как на качество микросервисов.

---

## Зачем это в бэкенд-лабе

В проде агент без ограждений = риск: сломанные контракты, `down -v` на общей БД, scope creep.  
Здесь те же практики, что и у платформенных команд:

| Инженерная практика | Как отражено в Cursor |
|---------------------|------------------------|
| ADR / design doc | OpenSpec `design.md` |
| Ticket + acceptance | `proposal.md` + `specs/**/spec.md` + `tasks.md` |
| Code owners / roles | `AGENTS.md` роли Architect / Implementer / Reviewer / Verifier |
| Guardrails в CI | Hooks: destructive shell gate |
| Playbooks | Skills (`rvip-lab-delivery`, `rvip-verify-stack`, OpenSpec) |
| Coding standards | `.cursor/rules/*.mdc` |

---

## Карта артефактов

```text
AGENTS.md                      ← контракт «как работать с агентами»
docs/agent-platform/
  README.md                    ← этот файл (зачем / что показать)
  architecture.md              ← компоненты агентной системы
  pipeline.md                  ← порядок шагов lab delivery
  roles.md                     ← роли и handoff
.cursor/
  rules/                       ← всегда-on / glob-правила
  skills/                      ← playbooks для агента
  hooks.json + hooks/          ← runtime policy
  commands/opsx-*.md           ← slash-команды OpenSpec
openspec/                      ← machine-readable change control
```

---

## Что показать на защите (2 минуты)

1. **Роли** — открыть `AGENTS.md`, объяснить, почему Implementer не меняет scope.
2. **Пайплайн** — `docs/agent-platform/pipeline.md`: Explore → Propose → Apply → Verify.
3. **Skill** — `.cursor/skills/rvip-lab-delivery/SKILL.md`: чеклист сдачи лабы.
4. **Hook** — `.cursor/hooks.json`: агент не может тихо сделать `compose down -v` / force-push.
5. **Связка с кодом lab-4** — агент реализовал цепочку  
   `gateway → student → report → HttpService → file-storage → MinIO`  
   по тому же контракту, что и методичка (RestTemplate → HttpService).

Дальше: [architecture](./architecture.md) · [pipeline](./pipeline.md) · [roles](./roles.md).
