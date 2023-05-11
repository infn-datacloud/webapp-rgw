import React from 'react';
import ReactDOM from 'react-dom/client';
import { OAuthProvider } from './services/OAuth2';
import { S3ServiceProvider } from './services/S3Service';
import App from './App';
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
  awsConfig: {
    endpoint: window.env.S3_ENDPOINT,
    region: window.env.S3_REGION
  }
}

root.render(
  <React.StrictMode>
    <OAuthProvider {...OidcConfig}>
      <S3ServiceProvider {...s3Config}>
        <App />
      </S3ServiceProvider>
    </OAuthProvider>
  </React.StrictMode>
);