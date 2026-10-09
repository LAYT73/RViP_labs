## ADDED Requirements

### Requirement: Sync CSV export to file-storage

The report service SHALL expose `GET /api/reports/by-course/export` that builds a CSV of enrolled counts by course, POSTs it to file-storage-service via HttpService (Nest axios), and returns stored-file metadata plus the report `rows`.

#### Scenario: Successful export

- **WHEN** client calls `GET /api/reports/by-course/export`
- **THEN** report-service POSTs CSV to file-storage and returns metadata fields (`id`, `objectKey`, `bucket`, `size`, `contentType`, `createdAt`) together with `rows` as `{ course, count }[]`

#### Scenario: File storage unavailable

- **WHEN** file-storage-service is unreachable
- **THEN** report-service returns 502
