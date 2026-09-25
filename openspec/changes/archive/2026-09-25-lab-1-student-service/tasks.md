## 1. Schema and Docker

- [x] 1.1 Add Liquibase changelog creating `students` table
- [x] 1.2 Add `docker-compose.yml` with postgres, liquibase, student-service
- [x] 1.3 Add Dockerfile for student-service
- [x] 1.4 Add `.env.example` for local run

## 2. Student domain

- [x] 2.1 Add Student entity, status enum, DTOs
- [x] 2.2 Implement StudentsService (enroll, list, get, update, transfer, expel)
- [x] 2.3 Implement StudentsController under `/api/students`
- [x] 2.4 Wire TypeORM + ConfigModule in AppModule (`synchronize: false`)

## 3. Swagger and bootstrap

- [x] 3.1 Configure Swagger at `/api/docs`
- [x] 3.2 Enable ValidationPipe in main.ts
- [x] 3.3 Update README with lab-1 run instructions

## 4. Verify

- [x] 4.1 Build student-service successfully
- [x] 4.2 Archive OpenSpec change after implementation
