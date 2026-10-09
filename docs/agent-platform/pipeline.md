# Пайплайн работы агента (lab delivery)

Единый конвейер для lab-4 / lab-5 / следующих. Каждый шаг имеет вход, выход и критерий готовности.

```text
Explore → Propose → Apply → Verify → Archive
Architect  Architect  Implementer  Verifier  Architect
                      (+ Reviewer)
```

## 1. Explore

**Вход:** формулировка из `task/task.md` + текущая ветка.  
**Инструмент:** `/opsx-explore` или skill `openspec-explore`.  
**Выход:** зафиксированные ambiguity (sync vs async, где живёт CSV, ports).  
**Done when:** нет вопросов, которые ломают API или границы сервисов.

Пример ambiguity lab-4, которые закрыли до кода:

- CSV собирает `report-service`, кладёт `file-storage-service` (S3/MinIO).
- Клиент бьёт только в gateway; export = `GET /api/reports/by-course/export`.
- Передача в storage = sync `HttpService` (RestTemplate), очередь — lab-5.

## 2. Propose

**Инструмент:** `/opsx-propose`.  
**Артефакты:** `proposal.md`, `design.md`, `specs/**/spec.md`, `tasks.md`.  
**Done when:** tasks — чеклист с зависимостями; Non-goals явные.

## 3. Apply

**Инструмент:** `/opsx-apply` + skill `rvip-lab-delivery`.  
**Правила:**

- идти строго по `tasks.md`;
- не тащить lab-N+1;
- зеркалить паттерны соседних apps (`apm`, health, Dockerfile).

**Done when:** все `[x]` в tasks, сборки сервисов зелёные.

## 4. Verify

**Инструмент:** skill `rvip-verify-stack`.  
Минимум:

```bash
docker compose up --build -d
curl -sf http://localhost:3080/api/reports/by-course/export
# + проверка объекта в MinIO / GET file content
```

Опционально: `./scripts/simulate-trace.sh` → Kibana waterfall включает `file-storage-service`.

**Done when:** happy-path 200 + файл читается; fail задокументирован, не «потом».

## 5. Archive

**Инструмент:** `/opsx-archive`.  
**Выход:** change в `openspec/changes/archive/…`, ветка запушена, README/task обновлены.

## Definition of Done (лаба)

- [ ] Ветка `lab-N` запушена
- [ ] README/demo команды работают с чистого `compose up --build`
- [ ] Postman-коллекция на ключевой сценарий
- [ ] Методичка ↔ Nest mapping описан (1 абзац)
- [ ] Агентный контур не разъехался с runtime (нет мёртвых skills/hooks)

## Анти-паттерны

| Плохо | Почему | Вместо этого |
|-------|--------|--------------|
| «Сделай lab-4» → сразу 20 файлов | нет acceptance | Propose first |
| Один гигантский commit «everything» | неreviewable | tasks-группировка |
| Verify руками «вроде ок» | регрессии | skill + curl script |
| Править lab-3 на ветке lab-4 без нужды | ломает кумулятивность | только additive |
