import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import './index.css';

// Add `env` namespace to window
interface EnvInterface {
  IAM_AUTHORITY: string;
  IAM_CLIENT_ID: string;
  IAM_CLIENT_SECRET?: string;
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

const oidcConfig: AuthProviderProps = {
  authority: window.env.IAM_AUTHORITY,
  client_id: window.env.IAM_CLIENT_ID,
  client_secret: window.env.IAM_CLIENT_SECRET,
  redirect_uri: `${new URL(window.location.href).origin}/callback`,
  scope: "openid profile email",
  response_type: "code",
  monitorSession: true,
  extraQueryParams: {
    audience: window.env.IAM_AUDIENCE
  },
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
    <AuthProvider {...oidcConfig}>
      <App s3Config={s3Config} />
    </AuthProvider>
  </React.StrictMode>
);