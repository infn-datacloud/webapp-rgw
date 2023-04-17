import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { OAuthProvider } from './services/OAuth2';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const oidcConfig = {
  authority: "https://keycloak-demo.cloud.cnaf.infn.it:8222",
  client_id: "66a8f7e8-a5ef-4ef1-8e2e-3389f1170ae7",
  redirect_uri: "http://localhost:8080/callback",
  audience: "b573bc60-c58f-4924-90e5-ac0f5bcb576e",
  scope: "openid email profile offline_access",
  grant_type: "authorization_code",
  response_type: "code"
};

root.render(
  <React.StrictMode>
    <OAuthProvider {...oidcConfig}>
      <App />
    </OAuthProvider>
  </React.StrictMode>
);