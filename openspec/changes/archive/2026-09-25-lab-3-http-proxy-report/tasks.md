## 1. Student proxy

- [x] 1.1 Add HttpModule and ReportsProxyService/Controller on student-service
- [x] 1.2 Configure REPORT_SERVICE_URL env
- [x] 1.3 Rebuild student Dockerfile / compose env

## 2. Lock down report and gateway

- [x] 2.1 Remove host port publish from report-service
- [x] 2.2 Point gateway `/api/reports` to student-service
- [x] 2.3 Update Postman and README
- [x] 2.4 Archive OpenSpec change
