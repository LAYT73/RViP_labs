## Why

Methodichka lab-4: save the course enrollment report as CSV into a file-storage service (RestTemplate → Nest `HttpService`), backed by object storage (MinIO).

## What Changes

- New `file-storage-service` REST API storing/retrieving CSV objects in MinIO
- MinIO (+ optional console) in Docker Compose
- report-service: `GET /api/reports/by-course/export` builds CSV and POSTs to file-storage via HttpService; returns file metadata + rows
- student-service: proxies `/api/reports/by-course/export` via existing report HttpService proxy
- Postman lab-4 collection, README mapping, agent platform docs as lab-4 deliverable

## Capabilities

### New Capabilities

- `file-storage`: store/retrieve report files via REST; persist bytes in MinIO

### Modified Capabilities

- `course-reports`: add sync CSV export that POSTs to file-storage and returns stored-file metadata plus report rows
- `report-proxy`: proxy export endpoint through student-service to report-service

## Non-goals

- Message queue / async export (lab-5)
- JWT / auth
- CompletableFuture / parallel fan-out

## Impact

- `apps/file-storage-service/**`, `apps/report-service/**`, `apps/student-service/src/reports/**`
- `docker-compose.yml`, `.env.example`, `package.json`, `postman/`
- Agent platform: `AGENTS.md`, `docs/agent-platform/**`, `.cursor/{rules,skills,hooks}`
