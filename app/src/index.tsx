import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Add `env` namespace to window
interface EnvInterface {
  S3_ENDPOINT: string;
  S3_REGION: string;
  S3_ROLE_ARN: string;
  S3_ROLE_DURATION_SECONDS: string;
}
declare global {
  interface Window { env: EnvInterface }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const s3Config = {
  awsConfig: {
    endpoint: window.env.S3_ENDPOINT,
    region: window.env.S3_REGION,
    roleArn: window.env.S3_ROLE_ARN,
    roleSessionDurationSeconds: parseInt(window.env.S3_ROLE_DURATION_SECONDS)
  }
}

root.render(
  <React.StrictMode>
    <App s3Config={s3Config} />
  </React.StrictMode>
);