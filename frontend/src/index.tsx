import React from 'react';
import ReactDOM from 'react-dom/client';
import { OAuthProvider } from './services/OAuth2';
import { S3ServiceProvider } from './services/S3Service';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const OidcConfig = {
  authority: "https://keycloak-demo.cloud.cnaf.infn.it:8222",
  client_id: "66a8f7e8-a5ef-4ef1-8e2e-3389f1170ae7",
  redirect_uri: `${window.location.href}callback`,
  audience: "b573bc60-c58f-4924-90e5-ac0f5bcb576e",
  scope: "openid email profile offline_access",
  grant_type: "authorization_code",
  response_type: "code"
};

const s3Config = {
  awsConfig: {
    endpoint: "https://vm-131-154-97-121.cloud.cnaf.infn.it",
    region: "nova"
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