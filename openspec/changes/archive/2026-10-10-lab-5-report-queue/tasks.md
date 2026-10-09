## 1. Broker + publish

- [x] 1.1 Add RabbitMQ service to docker-compose / env
- [x] 1.2 report-service: ClientProxy emit on export; return queued JSON
- [x] 1.3 Remove sync file-storage HttpService POST from export path

## 2. Consumer

- [x] 2.1 file-storage: connect microservice + `ReportExportConsumer`
- [x] 2.2 Store consumed CSV via existing FilesService → MinIO
- [x] 2.3 Hybrid HTTP+RMQ bootstrap in file-storage main

## 3. Proxy and docs

- [x] 3.1 student-service export type/docs for queued response
- [x] 3.2 Postman lab-5 + README queue mapping
- [x] 3.3 Archive OpenSpec change
