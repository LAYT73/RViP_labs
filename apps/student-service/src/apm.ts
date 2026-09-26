import apm from 'elastic-apm-node';

const serviceName = process.env.ELASTIC_APM_SERVICE_NAME ?? 'unknown-service';
const serverUrl = process.env.ELASTIC_APM_SERVER_URL ?? 'http://localhost:8200';
const active = process.env.ELASTIC_APM_ACTIVE !== 'false';

if (active) {
  apm.start({
    serviceName,
    serverUrl,
    environment: process.env.NODE_ENV ?? 'development',
    captureBody: 'errors',
    logLevel: (process.env.ELASTIC_APM_LOG_LEVEL as 'info') ?? 'error',
  });
}

export default apm;
