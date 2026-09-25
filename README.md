# RViP labs

NestJS monorepo: учёт студентов (вариант 2).

## Run

```bash
pnpm install
docker compose up --build
```

| Что | URL |
|-----|-----|
| Gateway | http://localhost:3080 |
| Student + Swagger | http://localhost:3001/api/docs |
| Report | только внутри Docker-сети (`report-service:3002`) |
| Postgres (host) | localhost:55432 |

Postman:

- Lab 2: [`postman/lab-2.postman_collection.json`](postman/lab-2.postman_collection.json)
- Lab 3: [`postman/lab-3.postman_collection.json`](postman/lab-3.postman_collection.json)

Ветки: `lab-1` → `lab-2` → `lab-3`.
