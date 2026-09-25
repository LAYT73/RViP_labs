## ADDED Requirements

### Requirement: Unified entrypoint

The gateway SHALL expose student and report APIs on a single host/port by reverse-proxying to backends.

#### Scenario: Students via gateway

- **WHEN** client calls `GET /api/students` on the gateway
- **THEN** request is proxied to student-service and response returned

#### Scenario: Reports via gateway

- **WHEN** client calls `GET /api/reports/by-course` on the gateway
- **THEN** request is proxied to report-service and response returned
