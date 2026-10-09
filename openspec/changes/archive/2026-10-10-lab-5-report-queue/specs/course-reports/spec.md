## MODIFIED Requirements

### Requirement: Sync CSV export to file-storage

The report service SHALL expose `GET /api/reports/by-course/export` that builds a CSV of enrolled counts by course, publishes it to the report export RabbitMQ queue, and returns a queued acknowledgment — not synchronous file-storage metadata.

#### Scenario: Successful export

- **WHEN** client calls `GET /api/reports/by-course/export`
- **THEN** report-service publishes the CSV to the queue and returns `{ status: "queued", jobId, rows, filename }` where `rows` is `{ course, count }[]` and `filename` identifies the intended stored object

#### Scenario: Broker unavailable

- **WHEN** RabbitMQ is unreachable during export
- **THEN** report-service fails the request (error / 5xx) rather than returning a successful queued status
