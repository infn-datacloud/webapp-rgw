import React from 'react';
import ReactDOM from 'react-dom/client';
import { OAuthProvider } from './services/OAuth2';
import { withS3 } from './services/S3Service';
import App from './App';
import './index.css';
import { withNotifications } from './services/Notification';

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
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const OidcConfig = {
  authority: window.env.IAM_AUTHORITY,
  client_id: window.env.IAM_CLIENT_ID,
  redirect_uri: window.env.IAM_REDIRECT_URI,
  audience: window.env.IAM_AUDIENCE,
  scope: window.env.IAM_SCOPE,
  grant_type: "authorization_code",
  response_type: "code"
};

const s3Config = {
  awsConfig :{
    endpoint: window.env.S3_ENDPOINT,
    region: window.env.S3_REGION,
    roleArn: window.env.S3_ROLE_ARN,
    roleSessionDurationSeconds: parseInt(window.env.S3_ROLE_DURATION_SECONDS)
  }
}

let ExtendedApp = withS3(App, s3Config);
ExtendedApp = withNotifications(ExtendedApp);

root.render(
  <React.StrictMode>
    <OAuthProvider {...OidcConfig}>
      <ExtendedApp />
    </OAuthProvider>
  </React.StrictMode>
);