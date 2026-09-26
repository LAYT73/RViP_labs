# RViP labs

NestJS monorepo: учёт студентов (вариант 2).

## Run (lab-3)

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
| Postgres (host) | localhost:55432 |
| Kibana (логи/трейсы) | http://localhost:5601 |
| Elasticsearch | http://localhost:9200 |
| APM Server | http://localhost:8200 |

В Kibana: **Observability → APM** — трейсы `gateway` → `student-service` → `report-service`.  
В ответах API смотри заголовок `X-Trace-Id`.

Postman: [`postman/lab-3.postman_collection.json`](postman/lab-3.postman_collection.json)

Ветки: `lab-1` → `lab-2` → `lab-3`.
