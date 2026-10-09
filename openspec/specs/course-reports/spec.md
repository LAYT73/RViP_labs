# course-reports Specification

## Purpose
Course enrollment reporting: JSON counts by course and async CSV export via RabbitMQ to file-storage.
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

The report service SHALL expose `GET /api/reports/by-course/export` that builds a CSV of enrolled counts by course, publishes it to the report export RabbitMQ queue, and returns a queued acknowledgment — not synchronous file-storage metadata.

#### Scenario: Successful export

- **WHEN** client calls `GET /api/reports/by-course/export`
- **THEN** report-service publishes the CSV to the queue and returns `{ status: "queued", jobId, rows, filename }` where `rows` is `{ course, count }[]` and `filename` identifies the intended stored object

#### Scenario: Broker unavailable

- **WHEN** RabbitMQ is unreachable during export
- **THEN** report-service fails the request (error / 5xx) rather than returning a successful queued status
