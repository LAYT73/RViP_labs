# student-service-ops Specification

## Purpose
TBD - created by archiving change lab-1-student-service. Update Purpose after archive.
## Requirements
### Requirement: Schema via Liquibase

The system SHALL create the `students` table only through Liquibase migrations (single table).

#### Scenario: Fresh database

- **WHEN** Liquibase runs against an empty PostgreSQL database
- **THEN** table `students` exists with columns id, full_name, course, status, created_at, updated_at

### Requirement: TypeORM read/write without DDL

The application SHALL connect with TypeORM `synchronize: false` and MUST NOT auto-create schema.

#### Scenario: App start after migrations

- **WHEN** migrations completed and student-service starts
- **THEN** CRUD operations work against existing schema

### Requirement: Local and Docker run

The service SHALL run against Postgres in Docker both from host (local) and as a container in the same Docker network.

#### Scenario: Docker compose up

- **WHEN** `docker compose up --build` succeeds
- **THEN** student-service is reachable on published port and can query Postgres

### Requirement: Swagger

The service SHALL expose OpenAPI UI for manual demonstration.

#### Scenario: Open docs

- **WHEN** client opens `/api/docs`
- **THEN** Swagger UI lists student endpoints

