import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Add `env` namespace to window
interface EnvInterface {
  IAM_AUTHORITY: string;
  IAM_CLIENT_ID: string;
  IAM_REDIRECT_URI: string;
  IAM_SCOPE: string;
  IAM_AUDIENCE: string;
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

const oidcConfig = {
  authority: window.env.IAM_AUTHORITY,
  client_id: window.env.IAM_CLIENT_ID,
  redirect_uri: window.env.IAM_REDIRECT_URI,
  audience: window.env.IAM_AUDIENCE,
  scope: window.env.IAM_SCOPE,
  grant_type: "authorization_code",
  response_type: "code"
};

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
    <App
      oidcConfig={oidcConfig}
      s3Config={s3Config}
    />
  </React.StrictMode>
);