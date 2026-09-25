# course-reports Specification

## Purpose
TBD - created by archiving change lab-2-report-gateway. Update Purpose after archive.
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

