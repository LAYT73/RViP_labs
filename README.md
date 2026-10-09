# RViP labs

NestJS monorepo: учёт студентов (вариант 2).

## Run (lab-3 … lab-5)

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
| RabbitMQ AMQP / UI | http://localhost:5672 / http://localhost:15672 |
| Postgres (host) | localhost:55432 |
| Kibana (логи/трейсы) | http://localhost:5601 |
| Elasticsearch | http://localhost:9200 |
| APM Server | http://localhost:8200 |

### Lab-5: CSV → RabbitMQ → MinIO

Цепочка: `gateway → student-service → report-service → RabbitMQ → file-storage-service → MinIO`.

`GET /api/reports/by-course` — синхронный JSON (как раньше).  
`GET /api/reports/by-course/export` — публикует CSV в очередь `report.export.csv` и сразу отвечает:

```bash
curl -s http://localhost:3080/api/reports/by-course/export | jq
# { "status": "queued", "jobId": "<uuid>", "rows": [...], "filename": "report-by-course.csv" }
```

Consumer в `file-storage-service` пишет объект в бакет MinIO `reports`.  
REST `POST /api/files` на file-storage остаётся для ручной отладки.  
RabbitMQ UI: `guest` / `guest` на http://localhost:15672.

### Lab-4 (ветка `lab-4`): sync HttpService → MinIO

На ветке `lab-4` экспорт ходил синхронно: report → HttpService POST → file-storage → MinIO (ответ с метаданными файла).

### Observability (lab-3)

В Kibana: **Observability → APM → Traces** (стек 7.17) — waterfall `gateway` → `student-service` → `report-service` (+ async store через очередь).  
В ответах API смотри заголовок `X-Trace-Id`.

Симуляция стека вызовов (включая export):

```bash
chmod +x scripts/simulate-trace.sh
./scripts/simulate-trace.sh
```

Если поднимал старый Elasticsearch 8.x — сбрось том:
`docker compose down -v` (сотрёт и Postgres data) или удали только `es_data` / используй новый `es_data_v7`.

Postman: [`postman/lab-3.postman_collection.json`](postman/lab-3.postman_collection.json), [`postman/lab-4.postman_collection.json`](postman/lab-4.postman_collection.json), [`postman/lab-5.postman_collection.json`](postman/lab-5.postman_collection.json)

Agent platform: [`AGENTS.md`](AGENTS.md), [`docs/agent-platform/`](docs/agent-platform/).

Ветки: `lab-1` → `lab-2` → `lab-3` → `lab-4` → `lab-5`.
