## Context

Lab-3 hides report-service behind student-service HttpService proxy. Lab-4 adds object storage so the report can be persisted as a file.

## Goals

- Introduce file-storage-service + MinIO
- Sync export: report builds CSV → HttpService POST → file-storage → MinIO
- Client reaches export only via gateway → student → report

## Decisions

- MinIO as S3-compatible store; file-storage owns bucket ensure + PutObject/GetObject
- Store API: `POST /api/files` accepts JSON `{ filename, content }` (or raw CSV); returns `{ id, objectKey, bucket, size, contentType, createdAt }`
- Metadata kept in-memory/process map keyed by id (lab scope; no new Postgres schema)
- report-service uses `FILE_STORAGE_SERVICE_URL` + HttpModule; on failure → 502
- Export response = stored file meta + `rows` (same `{ course, count }[]` as JSON report)
- student-service adds `GET /api/reports/by-course/export` proxy mirroring lab-3 pattern
- file-storage may publish a host port for demos; report stays internal

## Non-Goals

- RabbitMQ / queued export
- Auth, CompletableFuture
