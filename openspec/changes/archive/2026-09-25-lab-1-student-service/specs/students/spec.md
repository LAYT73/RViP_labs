## ADDED Requirements

### Requirement: Enroll student

The system SHALL allow creating a student with full name and course number; new students MUST have status `ENROLLED`.

#### Scenario: Successful enroll

- **WHEN** client sends `POST /api/students` with valid `fullName` and `course` (1–6)
- **THEN** system persists a student with status `ENROLLED` and returns 201 with the created entity

#### Scenario: Invalid course

- **WHEN** client sends course outside 1–6
- **THEN** system returns 400

### Requirement: List and get students

The system SHALL expose list and get-by-id endpoints.

#### Scenario: List all

- **WHEN** client sends `GET /api/students`
- **THEN** system returns all students

#### Scenario: Get missing

- **WHEN** client sends `GET /api/students/{id}` for unknown id
- **THEN** system returns 404

### Requirement: Edit student

The system SHALL allow updating full name and/or course of an existing student.

#### Scenario: Successful update

- **WHEN** client sends `PUT /api/students/{id}` with valid fields
- **THEN** system updates and returns the student

### Requirement: Transfer course

The system SHALL allow transferring an enrolled student to another course.

#### Scenario: Transfer enrolled

- **WHEN** client sends `POST /api/students/{id}/transfer` with a valid new course
- **THEN** system updates course and returns the student

#### Scenario: Transfer expelled

- **WHEN** client attempts transfer for an expelled student
- **THEN** system returns 409

### Requirement: Expel student

The system SHALL allow expelling a student by setting status to `EXPELLED`.

#### Scenario: Expel enrolled

- **WHEN** client sends `POST /api/students/{id}/expel`
- **THEN** system sets status `EXPELLED` and returns the student

#### Scenario: Expel already expelled

- **WHEN** client expels an already expelled student
- **THEN** system returns 409
