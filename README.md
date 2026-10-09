# RViP labs

NestJS monorepo: учёт студентов (вариант 2).

## Run (lab-4)

```bash
pnpm install
docker compose up --build
```

На macOS при первом старте Elasticsearch может потребоваться:
`sudo sysctl -w vm.max_map_count=262144`

| Что | URL |
|-----|-----|
| Gateway | http://localhost:3080 |
| Student + Swagger | http://localhost:3001/api/docs |
| Report | только внутри Docker-сети |
| File-storage | http://localhost:3003 |
| MinIO API / Console | http://localhost:9000 / http://localhost:9001 |
| Postgres (host) | localhost:55432 |
| Kibana (логи/трейсы) | http://localhost:5601 |
| Elasticsearch | http://localhost:9200 |
| APM Server | http://localhost:8200 |

### Lab-4: CSV → HttpService → MinIO

Цепочка: `gateway → student-service → report-service → HttpService POST → file-storage-service → MinIO`.

`GET /api/reports/by-course` — синхронный JSON (как раньше).  
`GET /api/reports/by-course/export` — считает отчёт, синхронно сохраняет CSV в file-storage/MinIO и отвечает метаданными файла + `rows`:

```bash
curl -s http://localhost:3080/api/reports/by-course/export | jq
# { "id": "...", "objectKey": "reports/....csv", "bucket": "reports", "size": ..., "contentType": "text/csv", "createdAt": "...", "rows": [...] }
```

REST `POST /api/files` на file-storage остаётся для ручной отладки.  
MinIO console: `minioadmin` / `minioadmin` на http://localhost:9001.

Асинхронная очередь (RabbitMQ) — ветка `lab-5`.

### Observability (lab-3)

В Kibana: **Observability → APM → Traces** (стек 7.17) — waterfall `gateway` → `student-service` → `report-service` → `file-storage-service`.  
В ответах API смотри заголовок `X-Trace-Id`.

Симуляция стека вызовов (включая export):

```bash
chmod +x scripts/simulate-trace.sh
./scripts/simulate-trace.sh
```

Если поднимал старый Elasticsearch 8.x — сбрось том:
`docker compose down -v` (сотрёт и Postgres data) или удали только `es_data` / используй новый `es_data_v7`.

Postman: [`postman/lab-3.postman_collection.json`](postman/lab-3.postman_collection.json), [`postman/lab-4.postman_collection.json`](postman/lab-4.postman_collection.json)

Agent platform: [`AGENTS.md`](AGENTS.md), [`docs/agent-platform/`](docs/agent-platform/).

Ветки: `lab-1` → `lab-2` → `lab-3` → `lab-4` → `lab-5`.
