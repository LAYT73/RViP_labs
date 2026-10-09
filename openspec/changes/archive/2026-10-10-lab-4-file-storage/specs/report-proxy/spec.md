## ADDED Requirements

### Requirement: Proxy CSV export via student service

The student service SHALL expose `GET /api/reports/by-course/export` and MUST obtain the result by calling report-service with HttpService, returning the same payload.

#### Scenario: Successful export proxy

- **WHEN** client calls student-service `GET /api/reports/by-course/export`
- **THEN** student-service calls report-service over HTTP and returns the export payload (file metadata + `rows`)

#### Scenario: Upstream failure on export

- **WHEN** report-service is unreachable during export
- **THEN** student-service returns 502
