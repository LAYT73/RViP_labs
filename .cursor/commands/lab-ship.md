---
name: "/lab-ship"
id: "lab-ship"
category: "Workflow"
description: "Сделать лабу по уже принятому OpenSpec: код, проверка, архив, push."
---

Реализуй открытый OpenSpec change текущей ветки `lab-N` и сдай ветку. Лабу `N+1` не делай.

## Шаги

1. Убедись, что ветка `lab-N` и в `openspec/changes/` (не в archive) есть один change этой лабы. Если change нет — остановись и скажи запустить `/lab-next`. Если их несколько — спроси какой.
2. Роль Implementer. Иди по `tasks.md` через skill `openspec-apply-change`. Не добавляй поведение следующей лабы. Секреты не коммить; новые переменные — в `.env.example`.
3. Обнови `docs/architecture.md` под то, что реально изменилось. В `README.md` в блок «Что уже есть» допиши абзац про лабу N тем же языком, что и предыдущие пункты. Workflow в README не переписывай.
4. Роль Verifier. `docker compose up --build` и сценарий из спеки через gateway `http://localhost:3080`. В ответе человеку — команды и HTTP-коды. Если проверка упала из-за только что написанного кода, исправь и повтори один раз.
5. `/opsx-archive` этот change (skill `openspec-archive-change`), чтобы требования попали в `openspec/specs/`.
6. Коммит и `git push -u origin HEAD` только этой ветки. Без `--force`. Без `.env`.

В конце: SHA, что проверял, ссылка на архив change.
