# report-proxy Specification

## Purpose
TBD - created by archiving change lab-3-http-proxy-report. Update Purpose after archive.
## Requirements
### Requirement: Report via student service HttpService

The student service SHALL expose `GET /api/reports/by-course` and MUST obtain the data by calling report-service with HttpService (Nest axios), not by querying the report aggregate itself.

#### Scenario: Successful proxy

- **WHEN** client calls student-service `GET /api/reports/by-course`
- **THEN** student-service calls report-service over HTTP and returns the same `{ course, count }[]` payload

#### Scenario: Upstream failure

- **WHEN** report-service is unreachable
- **THEN** student-service returns 502 with an error message

