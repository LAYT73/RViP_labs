## ADDED Requirements

### Requirement: Consume report export messages

In addition to the REST store API, the file-storage service SHALL consume `report.export.csv` messages and persist the payload content to MinIO.

#### Scenario: Message stored

- **WHEN** a valid export message arrives on the queue
- **THEN** file-storage stores the CSV and logs the consume event
