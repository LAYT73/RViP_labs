# Архитектура приложения (lab-4)

Ветка `lab-4`. И JSON-отчёт, и сохранение CSV идут **синхронно**. Очереди на этой ветке нет.

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
  ST -->|HttpService| RP
  RP --> PG
  RP -->|HttpService POST CSV| FS --> S3
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
  RP -->|POST /api/files| FS
  FS -->|PutObject| SILO
  GW --> ST
  ST -->|прокси /api/reports| RP
  APM --> ES
  KB --> ES
```

## Два сценария отчёта

| Запрос | Поведение на lab-4 |
|--------|--------------------|
| `GET /api/reports/by-course` | Синхронный JSON `{ course, count }[]` |
| `GET /api/reports/by-course/export` | Report собирает CSV, `HttpService` делает `POST /api/files`, ответ — метаданные объекта и `rows` |

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

### Экспорт CSV через HttpService

```mermaid
sequenceDiagram
  actor C as Клиент
  participant G as gateway
  participant S as student-service
  participant R as report-service
  participant F as file-storage-service
  participant M as Silo

  C->>G: GET /api/reports/by-course/export
  G->>S: proxy
  S->>R: HttpService
  R->>R: собрать CSV
  R->>F: POST /api/files
  F->>M: PutObject reports/{id}.csv
  F-->>R: id, objectKey, bucket, size
  R-->>C: 200 метаданные + rows
```

Это аналог RestTemplate из методички: вызов блокирующий, клиент получает файл уже сохранённым. На `lab-5` тот же URL отвечает `queued` и пишет объект из RabbitMQ.

## Кто за что отвечает

| Сервис | Владеет |
|--------|---------|
| gateway | Единый вход, `X-Trace-Id`, health upstream |
| student-service | CRUD студентов, прокси обоих report-эндпоинтов |
| report-service | Агрегат по курсам, сборка CSV, синхронный вызов storage |
| file-storage-service | `POST/GET /api/files`, запись в S3 |
| Silo | Бакет `reports` |
| PostgreSQL | Таблица `students` (схема только Liquibase) |

Имя файла и время лежат в metadata объекта, а не во второй таблице: в курсе разрешена одна таблица `students`, а идентификатор файла уже есть в ключе `reports/{id}.csv`. Нет объекта — 404. Хранилище не отвечает — 503, это не «файл не найден».

## Наружу с хоста

| URL | Назначение |
|-----|------------|
| http://localhost:3080 | Gateway |
| http://localhost:3001/api/docs | Swagger student-service |
| http://localhost:3003 | File-storage |
| http://localhost:9001 | Консоль Silo (`minioadmin` / `minioadmin`) |
| http://localhost:5601 | Kibana APM |

RabbitMQ на этой ветке не поднимается.
