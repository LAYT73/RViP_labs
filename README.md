# RViP labs

NestJS monorepo: учёт студентов (вариант 2).

## Lab 1

```bash
pnpm install
docker compose up --build
```

- API: http://localhost:3001
- Swagger: http://localhost:3001/api/docs

Локально (Postgres уже в Docker):

```bash
docker compose up -d postgres liquibase
cp .env.example .env
pnpm start:student:dev
```

Postgres на хосте: порт `55432` (внутри сети Docker — `5432`).
