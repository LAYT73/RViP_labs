# report-proxy Specification

## Purpose
Student-service HttpService proxy for report-service APIs so clients never call report-service directly.
## Requirements
### Requirement: Report via student service HttpService

The student service SHALL expose `GET /api/reports/by-course` and MUST obtain the data by calling report-service with HttpService (Nest axios), not by querying the report aggregate itself.

#### Scenario: Successful proxy

- **WHEN** client calls student-service `GET /api/reports/by-course`
- **THEN** student-service calls report-service over HTTP and returns the same `{ course, count }[]` payload

#### Scenario: Upstream failure

- **WHEN** report-service is unreachable
- **THEN** student-service returns 502 with an error message

### Requirement: Proxy CSV export via student service

The student service SHALL expose `GET /api/reports/by-course/export` and MUST obtain the result by calling report-service with HttpService, returning the same queued payload.

#### Scenario: Successful export proxy

- **WHEN** client calls student-service `GET /api/reports/by-course/export`
- **THEN** student-service calls report-service over HTTP and returns `{ status: "queued", jobId, rows, filename }`

#### Scenario: Upstream failure on export

- **WHEN** report-service is unreachable during export
- **THEN** student-service returns 502
