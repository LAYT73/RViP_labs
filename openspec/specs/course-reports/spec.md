# course-reports Specification

## Purpose
Course enrollment reporting: JSON counts by course and CSV export persisted through file-storage.
## Requirements
### Requirement: Course enrollment report

The report service SHALL return counts of enrolled students grouped by course from the shared database.

#### Scenario: Empty database

- **WHEN** there are no enrolled students
- **THEN** `GET /api/reports/by-course` returns an empty array

#### Scenario: Mixed statuses

- **WHEN** enrolled and expelled students exist on courses 1 and 2
- **THEN** response includes only enrolled counts per course as `{ course, count }`

#### Scenario: List shape

- **WHEN** report is requested
- **THEN** items are sorted by course ascending

### Requirement: Sync CSV export to file-storage

The report service SHALL expose `GET /api/reports/by-course/export` that builds a CSV of enrolled counts by course, POSTs it to file-storage-service via HttpService (Nest axios), and returns stored-file metadata plus the report `rows`.

#### Scenario: Successful export

- **WHEN** client calls `GET /api/reports/by-course/export`
- **THEN** report-service POSTs CSV to file-storage and returns metadata fields (`id`, `objectKey`, `bucket`, `size`, `contentType`, `createdAt`) together with `rows` as `{ course, count }[]`

#### Scenario: File storage unavailable

- **WHEN** file-storage-service is unreachable
- **THEN** report-service returns 502
