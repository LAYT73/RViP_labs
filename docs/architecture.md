# Архитектура приложения (lab-5)

Ветка `lab-5`. Отчёт в JSON по-прежнему синхронный. CSV в файловое хранилище уходит **через очередь**.

Образ object storage: `pgsty/silo` (S3-совместимый; официальный `minio/minio` снят с Docker Hub).

## Контекст

```mermaid
flowchart LR
  Client[Клиент / Postman / Swagger]
  subgraph edge [Публичный вход]
    GW[gateway :3080]
  end
  subgraph domain [Домен]
    ST[student-service :3001]
    RP[report-service]
  end
  subgraph async [Доставка файла]
    Q[RabbitMQ]
    FS[file-storage-service :3003]
  end
  subgraph data [Данные]
    PG[(PostgreSQL)]
    S3[(Silo / S3)]
  end
  subgraph obs [Наблюдаемость]
    APM[APM Server]
    ES[(Elasticsearch)]
    KB[Kibana :5601]
  end

  Client --> GW --> ST
  ST -->|CRUD| PG
  ST -->|HttpService JSON-отчёт| RP
  RP --> PG
  RP -->|publish CSV| Q --> FS --> S3
  ST -.-> APM
  RP -.-> APM
  FS -.-> APM
  GW -.-> APM
  APM --> ES --> KB
```

`report-service` с хоста не публикуется. Клиент ходит только в gateway.

## Контейнеры

```mermaid
flowchart TB
  subgraph compose [docker compose / сеть rvip-net]
    GW[gateway]
    ST[student-service]
    RP[report-service]
    FS[file-storage-service]
    RMQ[rabbitmq :5672 / UI :15672]
    SILO[silo :9000 / console :9001]
    PG[postgres :55432]
    LB[liquibase]
    ES[elasticsearch]
    KB[kibana]
    APM[apm-server]
  end

  LB -->|схема students| PG
  ST --> PG
  RP --> PG
  RP -->|очередь report.export.csv| RMQ
  FS -->|consume| RMQ
  FS -->|PutObject| SILO
  GW --> ST
  ST -->|GET /api/reports/by-course| RP
  APM --> ES
  KB --> ES
```

## Два сценария отчёта

| Запрос | Поведение на lab-5 |
|--------|--------------------|
| `GET /api/reports/by-course` | Синхронный JSON `{ course, count }[]`. Очереди нет. |
| `GET /api/reports/by-course/export` | Report публикует CSV и сразу отвечает `{ status: "queued", jobId, rows, filename }`. Файл появляется в бакете `reports` после consumer. |

### Синхронный отчёт

```mermaid
sequenceDiagram
  actor C as Клиент
  participant G as gateway
  participant S as student-service
  participant R as report-service
  participant D as PostgreSQL

  C->>G: GET /api/reports/by-course
  G->>S: proxy
  S->>R: HttpService
  R->>D: GROUP BY course, status = ENROLLED
  D-->>R: rows
  R-->>S: JSON
  S-->>G: JSON
  G-->>C: 200 + X-Trace-Id
```

### Экспорт CSV через очередь

```mermaid
sequenceDiagram
  actor C as Клиент
  participant G as gateway
  participant S as student-service
  participant R as report-service
  participant Q as RabbitMQ
  participant F as file-storage-service
  participant M as Silo

  C->>G: GET /api/reports/by-course/export
  G->>S: proxy
  S->>R: HttpService
  R->>R: собрать CSV
  R->>Q: emit report.export.csv
  R-->>C: 200 queued + jobId + rows
  Q->>F: доставка сообщения
  F->>M: PutObject reports/{id}.csv
```

На ветке `lab-4` второго сценария нет: report вызывает `POST /api/files` синхронно и возвращает метаданные объекта сразу.

## Кто за что отвечает

| Сервис | Владеет |
|--------|---------|
| gateway | Единый вход, `X-Trace-Id`, health upstream |
| student-service | CRUD студентов, прокси обоих report-эндпоинтов |
| report-service | Агрегат по курсам, сборка CSV, публикация в очередь |
| file-storage-service | Приём сообщения, запись и чтение объекта в S3 |
| Silo | Бакет `reports` |
| RabbitMQ | Очередь `report.export.csv` |
| PostgreSQL | Таблица `students` (схема только Liquibase) |

`POST /api/files` на file-storage оставлен для ручной отладки, основной путь лабы — очередь.

## Наружу с хоста

| URL | Назначение |
|-----|------------|
| http://localhost:3080 | Gateway |
| http://localhost:3001/api/docs | Swagger student-service |
| http://localhost:3003 | File-storage |
| http://localhost:15672 | RabbitMQ UI (`guest` / `guest`) |
| http://localhost:9001 | Консоль Silo (`minioadmin` / `minioadmin`) |
| http://localhost:5601 | Kibana APM |
