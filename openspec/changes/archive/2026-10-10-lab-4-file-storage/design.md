## Context

Lab-3 hides report-service behind student-service HttpService proxy. Lab-4 adds object storage so the report can be persisted as a file.

## Goals

- Introduce file-storage-service + MinIO
- Sync export: report builds CSV → HttpService POST → file-storage → MinIO
- Client reaches export only via gateway → student → report

## Decisions

- MinIO as S3-compatible store; file-storage owns bucket ensure + PutObject/GetObject
- Store API: `POST /api/files` accepts JSON `{ filename, content }` (or raw CSV); returns `{ id, objectKey, bucket, size, contentType, filename, createdAt }`
- File bytes and the small metadata (filename, createdAt) live on the object in S3. Not a second Postgres table: the course allows one table, `students`. Not an in-memory map: it would disappear on restart and would not be shared across replicas.
- A missing key is 404. Any other storage error is 503. Report maps a failed POST to 502.
- report-service uses `FILE_STORAGE_SERVICE_URL` + HttpModule; on failure → 502
- Export response = stored file meta + `rows` (same `{ course, count }[]` as JSON report)
- student-service adds `GET /api/reports/by-course/export` proxy mirroring lab-3 pattern
- file-storage may publish a host port for demos; report stays internal

## Non-Goals

- RabbitMQ / queued export
- Auth, CompletableFuture

## Assumptions

- One database table stays `students`. The CSV is not a row in Postgres.
- The client keeps using the gateway. File download for the demo may hit file-storage on its published port.
- `minioadmin` and the database password in `.env.example` are local demo values, not production secrets.

## Alternatives

| Вариант | Почему не он |
|---------|----------------|
| Каталог на диске контейнера | Пропадает вместе с контейнером, нет API как у хранилища |
| Байтa в Postgres | Вторая сущность в той же БД, а методичка просит отдельный сервис и файловое хранилище |
| Очередь уже в lab-4 | Это формулировка lab-5; здесь вызов должен быть синхронным, как RestTemplate |
| Официальный `minio/minio` | Образ снят с Docker Hub; взяли `pgsty/silo` с закреплённым тегом |

Синхронный `HttpService` выбран потому, что методичка прямо говорит «передать по RestTemplate». Очередь откладывает ответ и меняет контракт. Её место — следующая лаба.

Cursor и OpenSpec взяты как процесс, а не как библиотека приложения: спека фиксирует, что проверять, hooks не дают снести тома, роли не дают агенту тихо расширить scope. Код при этом обычный Nest, его можно читать без Cursor.
