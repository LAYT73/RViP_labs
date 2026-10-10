## Why

Methodichka lab-5: send report data to the file-storage service through a message queue instead of a synchronous HTTP POST.

## What Changes

- RabbitMQ in Docker Compose
- report-service: export builds CSV and publishes to queue; API returns `{ status: queued, jobId, rows, filename }`
- file-storage-service: RabbitMQ microservice consumer stores CSV into MinIO
- Remove sync HttpService POST from report export path (file-storage REST remains for read/demo)
- Postman lab-5 + README queue mapping

## Capabilities

### New Capabilities

- `report-export-queue`: async report CSV delivery via RabbitMQ from report-service to file-storage consumer

### Modified Capabilities

- `course-reports`: export becomes queue publish + queued response (no sync file-storage POST)
- `file-storage`: consume `report.export.csv` events and persist content to MinIO
- `report-proxy`: proxy still forwards export; payload shape is queued result

## Non-goals

- JWT / auth
- CompletableFuture / parallel fan-out
- Changing student CRUD or JSON by-course report

## Impact

- `apps/report-service/src/reports/**`, `apps/file-storage-service/**` (consumer + hybrid HTTP/RMQ bootstrap)
- `apps/student-service/src/reports/**` (export response type)
- `docker-compose.yml`, `.env.example`, `postman/lab-5.postman_collection.json`, README

## Assumptions

- В очередь уходит только CSV-экспорт. `GET /api/reports/by-course` остаётся обычным HTTP.
- Имя файла в сообщении не становится ключом S3. Ключ по-прежнему `reports/{uuid}.csv`.
- Нет API «готов ли job». Скачивание — `GET /api/files/:id/content`, когда объект уже записан.
