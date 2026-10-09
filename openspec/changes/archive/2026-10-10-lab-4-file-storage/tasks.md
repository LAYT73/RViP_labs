## 1. File storage + MinIO

- [x] 1.1 Add `file-storage-service` Nest app (health, files module, APM/logging like siblings)
- [x] 1.2 Wire MinIO client; ensure bucket; implement store/get metadata/content
- [x] 1.3 Add MinIO (+ console) and file-storage to docker-compose / env example

## 2. Sync export path

- [x] 2.1 report-service: HttpModule + `exportByCourse` CSV → POST `/api/files`
- [x] 2.2 student-service: proxy `GET /api/reports/by-course/export`
- [x] 2.3 Gateway already routes `/api/reports` to student — verify export path

## 3. Docs and delivery

- [x] 3.1 Postman lab-4 + README RestTemplate→HttpService / MinIO mapping
- [x] 3.2 Agent platform docs (`AGENTS.md`, `docs/agent-platform`, Cursor rules/skills/hooks)
- [x] 3.3 Archive OpenSpec change
