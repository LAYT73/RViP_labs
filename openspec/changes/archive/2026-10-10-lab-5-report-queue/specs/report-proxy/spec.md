## MODIFIED Requirements

### Requirement: Proxy CSV export via student service

The student service SHALL expose `GET /api/reports/by-course/export` and MUST obtain the result by calling report-service with HttpService, returning the same queued payload.

#### Scenario: Successful export proxy

- **WHEN** client calls student-service `GET /api/reports/by-course/export`
- **THEN** student-service calls report-service over HTTP and returns `{ status: "queued", jobId, rows, filename }`

#### Scenario: Upstream failure on export

- **WHEN** report-service is unreachable during export
- **THEN** student-service returns 502
