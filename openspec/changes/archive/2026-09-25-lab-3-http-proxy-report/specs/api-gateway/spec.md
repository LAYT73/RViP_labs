## MODIFIED Requirements

### Requirement: Unified entrypoint

The gateway SHALL expose student and report APIs on a single host/port. Report paths MUST be proxied to student-service. Report-service MUST NOT be reachable from the host network.

#### Scenario: Students via gateway

- **WHEN** client calls `GET /api/students` on the gateway
- **THEN** request is proxied to student-service and response returned

#### Scenario: Reports via gateway

- **WHEN** client calls `GET /api/reports/by-course` on the gateway
- **THEN** request is proxied to student-service (which calls report-service internally via HttpService)

#### Scenario: No direct report port

- **WHEN** client attempts to reach report-service on published host ports
- **THEN** the connection fails because the port is not published
