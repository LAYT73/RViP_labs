## ADDED Requirements

### Requirement: Queue-backed report export delivery

The system SHALL deliver CSV report content from report-service to file-storage-service via RabbitMQ (pattern `report.export.csv`) rather than a synchronous HTTP POST on the export path.

#### Scenario: Publish on export

- **WHEN** report-service handles `GET /api/reports/by-course/export`
- **THEN** it emits a message containing `filename`, CSV `content`, and `requestedAt` to the report export queue

#### Scenario: Consume and store

- **WHEN** file-storage-service receives `report.export.csv`
- **THEN** it stores the message content in MinIO under the given filename
