# RViP labs

NestJS monorepo: учёт студентов (вариант 2).

## Lab 1–2

```bash
pnpm install
docker compose up --build
```

| Что | URL |
|-----|-----|
| Gateway | http://localhost:3080 |
| Student + Swagger | http://localhost:3001/api/docs |
| Report | http://localhost:3002 |
| Postgres (host) | localhost:55432 |

Postman: [`postman/lab-2.postman_collection.json`](postman/lab-2.postman_collection.json)

Локально (сервисы на хосте, БД в Docker):

```bash
docker compose up -d postgres liquibase
cp .env.example .env
pnpm start:student:dev
pnpm start:report:dev
pnpm start:gateway:dev
```
