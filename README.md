# RADOS Gateway Web Application

This project consists in a web application to easily access file objects stored
within Ceph Object Storage/RADOS Gateway, using the AWS S3 protocol for object
handling, and the OAuth2/OpenID Connect to allow authn/authz with Indigo IAM.

The webapp is implemented using the React, ViteJS, TypeScript and TailwindCSS,
as core frameworks, and the
[aws-sdk v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
framework and [react-oidc-context](https://github.com/authts/react-oidc-context)
library for S3 operations and Oidc/OAuth2 login respectively.

## Indigo IAM Configuration

Before deploying the webapp, a new client must be registered on Indigo IAM.
When registering your client, you must provide the Redirect URI pointing to the
webapp, adding the `/callback` endpoint.
For example, if your deploy endpoint is `https://example.cloud.infn.it`,
the Redirect URI field must be `https://example.cloud.infn.it/callback`.
You can add multiple entries, for example for development you can also add
`http://localhost:8080/callback` or `http://localhost:3000/localhost`, depending
on your deployment configuration.
**Note:** if you need both `http` and `https`, be sure the add both the redirect
uris.

### PKCE Security Protocol

Even though this is not strictly required, it is highly recommended to enable
the PKCE security capability in your Iam Access Manager (IAM) in order to
protect the authorization flow.

> **Important** This is a *public* client, which means that is served to
> an unlimited amount of users. The `client_secret` for your IAM's client is
> thus completely visible to your browser, meaning that **it is not a secret**
> at all, and thus one can use it to interact with IAM.

The Proof Key for Code Exchange (PKCE) is designed to protect the user from
replay attacks. To have a better understanding about how PKCE works, please
refer to [this document](https://oauth.net/2/pkce/).

In order to enable PKCE in Indigo IAM, with your browser go the administration
page of your client. In the **Crypto** tab enable `SHA-256 hash algorithm` for
the `Proof key for code exchange (PKCE) challenge method` section.

## Deployment

This project is configured with a CI/CD pipeline which builds Docker images
for development and production releases. The images are stored
[here](https://baltig.infn.it/infn-cloud/webapp-rgw/container_registry).

## Docker Compose Deployment

The webapp service consists in a NGINX web server provided with the static
website files produces by React's build. The site must be configured as a
"Single Page App" (SPA). In this context, all routes routed through the web
browser must be **always** redirect to the `/` route.
[Here](frontend/nginx.conf) you can find the default configuration.

The web application needs a configured environment file `env.js` located at
`app/public/env.js`. This file is automatically created at runtime, inside
the container, by the [`app/init_env.sh`](app/init_env.sh) script.

### Environments Variables

To deploy the webapp, create two files with environment variables for both
frontend and backend, for example:

```bash
mkdir envs
touch envs/webapp.env
touch envs/backend.env
```

Write the following variables to the two files:

```bash
# backend.env
IAM_AUTHORITY=https://iam.cloud.cnaf.infn.it
IAM_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
IAM_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
IAM_AUDIENCE=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
IAM_SCOPE=openid email profile offline_access
```

for the backend, and

```bash
# webapp.end
S3_ENDPOINT=https://rgw.cloud.infn.it
S3_REGION=ceph-objectstore
S3_ROLE_ARN=arn:aws:iam:::role/S3AccessIAM200
S3_ROLE_DURATION_SECONDS=3600
```

for the frontend.

### NGINX

In order to handle the two services, a NGINX instance is required to proxy pass
requests to the proper service. Keep in mind that what follows is not a full
NGINX configuration to provide TLS encryption or advance features, but it
provides the bare minimum to make the services work.

Create the config file

```bash
mkdir nginx
vi nginx/default.conf
```

and paste the following configuration

```nginx
upstream webapp-rgw {  
  server webapp-rgw-webapp:80;
}

upstream backend {
  server webapp-rgw-backend:8000;
}

server {
  listen 8080;
  
  location / {
    proxy_pass http://webapp-rgw/;
  }

  location /api/ {
    proxy_pass http://backend/api/;
  }
}
```

### docker-compose.yaml

Create the following `docker-compose.yaml` file

```yaml
version: '3'

services:  
  webapp:
    container_name: webapp-rgw-webapp
    image: baltig.infn.it:4567/infn-cloud/webapp-rgw/webapp
    env_file:
      - ./envs/dev.env
  
  backend:
    container_name: baltig.infn.it:4567/infn-cloud/webapp-rgw/backend
    image: webapp-rgw/backend
    env_file:
      - ./envs/dev.env
  
  nginx:
    image: nginx:latest
    container_name: nginx
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf
    ports:
      - 8080:8080

volumes:
  node_modules:

```

and run it with

```bash
docker compose up -d
```

.

## Docker Compose (development)

This project is shipped with a `docker-compose.yaml` intended for development
only. This compose file starts two releases of the webapp, one for development
and one for production, plus a minimal instance of NGINX to manage networking.

Before running the services, you must create an environment file with your
parameters. You can start from the example file located at
`app/envs/example.dev`.

For example, to configure both the development and production frontend releases,
create the following files

```bash
cp app/envs/example.env  app/envs/dev.env
cp app/envs/example.env  app/envs/prod.env
```

Edit these files with your settings and adjust env paths in the
`docker-compose.yaml` files accordingly.

Start the services with

```bash
docker compose up -d --build
```

### TLS/SSL Termination

This project does not provide a setup to configure TLS/SSL termination for https.
In order to enable HTTPS, please create your NGINX configuration and mount it
as volume to your container's directory `/etc/nginx`.

## Kubernetes

This project is shipped with a preconfigured ready to use
[`deployment.yaml`](deployment.yaml) file.

### Create Secret

Before apply the deployment, you need to create a secret for the IAM client. To
create the secret, run

```bash
kubectl create secret generic iam-client-secret \
--from-literal=IAM_CLIENT_ID=<you-client-id> \
--from-literal=IAM_CLIENT_SECRET=<your-client-secret>
```

### Apply the deployment (Frontend and Backend)

Once the secret is created, apply the deployment with

```bash
kubectl apply -f deployment.yaml
```

### Restart the deployment

The CI/CD pipeline is configured to automatically restart the
deployment after new images are build and pushed.
If you want to manually restart the deployment, run

```bash
kubectl rollout restart deployment rgw-s3
```

### Deploy K8s Ingress

To look/edit the Kubernetes Ingress, run

```bash
kubectl -n rook-ceph edit ingress rgw
```

## Development Endpoints

The following endpoint are available

- Webapp dev [localhost:3000](localhost:3000)
- Webapp prod [localhost:8080](localhost:8080)
