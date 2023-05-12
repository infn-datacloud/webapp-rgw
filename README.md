# Ceph Webapp POC

This project is a proof of concept of a web application to manage Ceph Object
Storage.

Frontend is made React and backend with FastAPI and boto3.

## Run the project

To run the project, use

```bash
docker compose up
```

## Development Endpoints

The following endpoint are available

- Webapp [localhost:3000](localhost:3000)
- API [localhost:3000/api/v1/](localhost:3000/api/v1/)
- Minio [localhost:9000](localhost:9000)

## Deployment

This project is configured with a CI/CD pipeline which builds two Docker images
for backend and frontend services. The images are stored
[here](https://baltig.infn.it/jgasparetto/ceph-webapp-poc/container_registry).

### Frontend Configuration

The frontend service consists in a NGINX web server provided with the static
website files produces by React build. The site must be configure as a
"Single Page App" (SPA). In this context, all routes routed through the web
browser must be **always** redirect to the `/` route.
[Here](frontend/nginx.conf) you can find the default configuration.

The web application needs a configured envinroment file `env.js` located at
`frontend/public/env.js`. This file is automatically created at runtime, inside
the container, by the [`frontend/init_env.sh`](frontend/init_env.sh) script.

In order to run, the following variables **are required** to be set in the
container.

```shell
IAM_AUTHORITY
IAM_CLIENT_ID
IAM_REDIRECT_URI
IAM_SCOPE
IAM_AUDIENCE
S3_ENDPOINT
S3_REGION   # Cannot be empty, use whatever you want if not need, e.g. 'nova'
```

In addition, you **must** bind the port 80 to your container.

```shell
docker run \
  -p 8080:80 \
  -e IAM_AUTHORITY=... \
  -e ... \
  frontend
```

If you need, you can also provide a custom configuration for the nginx webserver
using the command

```shell
docker run \
  -p 8080:80 \ 
  -e IAM_AUTHORITY=... \
  -e ... \
  -v <path/to/your/conf>:/etc/nginx/conf.d/default.conf \
  frontend
```

### Backend Configuration

To run the backend service, the following environtmental variables
**are required** to be set in the container

```shell
IAM_AUTHORITY
IAM_CLIENT_ID
IAM_CLIENT_SECRET
S3_ENDPOINT
S3_ROLE_ARN
S3_REGION_NAME     # can be empty, but defined
```

You find an example at [example.dev](backend/envs/example.env).

In addition, you **must** bind the **port 8000** to your container.

```shell
docker run \
  -p 8080:8000 \ 
  -e IAM_AUTHORITY=... \
  -e ... \
  backend
```

## Deployment with Kubernetes

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

### Apply the deployment

Once the secret is created, apply the deployment with

```bash
kubectl apply -f demployment.yaml
```

### Restart the deployment

The CI/CD pipeline is configured to automatically restart the
deployment after new images are build and pushed.
If you want to manually restart the deployment, run

```bash
kubectl rollout restart deployment rgw-s3
```
