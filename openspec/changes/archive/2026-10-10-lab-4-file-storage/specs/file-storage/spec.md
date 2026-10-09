## ADDED Requirements

### Requirement: Store report file in MinIO

The file-storage service SHALL accept file content via `POST /api/files`, persist bytes in MinIO, and return metadata including `id`, `objectKey`, `bucket`, `size`, `contentType`, and `createdAt`.

#### Scenario: JSON upload

- **WHEN** client POSTs `application/json` with string `content` and optional `filename`
- **THEN** service stores the object in the configured MinIO bucket and returns 201/200 with metadata

#### Scenario: CSV body upload

- **WHEN** client POSTs a CSV string body with an appropriate text/csv content type
- **THEN** service stores the object and returns metadata

### Requirement: Retrieve stored file

The file-storage service SHALL expose metadata and content by id.

#### Scenario: Get metadata

- **WHEN** client calls `GET /api/files/:id`
- **THEN** response includes the stored metadata fields for that id

#### Scenario: Get content

- **WHEN** client calls `GET /api/files/:id/content`
- **THEN** response body is the CSV text with `Content-Type: text/csv`
