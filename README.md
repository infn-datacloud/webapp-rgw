# RADOS Gateway Web Application

This project consists in web application to easily access file objects stored
with Ceph Object Storage/RADOS Gateway, using the S3 protocol. Parallel to the
webapp frontend, a backend service is shipped to provide a workaround for IAM
access until the PIXE protocol will be fully supported.

Frontend is implemented using the React, ViteJS, TypeScript and TailwindCSS
stack, while backend is built in Python with the FastAPI framework.

## IAM Configuration

Before deploying the webapp, a new client must be registered on IAM.
When registering your client, you must provide the Redirect URI pointing to the
webapp, adding the `/callback` endpoint.
For example, your deploy endpoint is `www.example.cloud.infn.it`, the Redirect
URI field must be `www.example.cloud.infn.it/callback`.
You can add multiple entries, for example for development you can also add
`localhost:8080/callback` or `localhost:3000/localhost`, depending on your
deployment configuration.  

## Deployment

This project is configured with a CI/CD pipeline which builds two Docker images
for backend and frontend services. The images are stored
[here](https://baltig.infn.it/infn-cloud/webapp-rgw/container_registry).

## Docker Compose

This project is shipped with a ready to use `docker-compose.yaml` for production
deployment and one `docker-compose.dev.yaml` file for development. Both files
start the backend and frontend services, along with a NGINX instance to handle
networking.

Before running the deployment, you must create a set of environment files for
both the backend and frontend services. You can start from the example files
located at `backend/envs/example.dev` and `frontend/envs/example.dev`.

For example, to configure both the development and production frontend services
and the backend, create the following files

```bash
cp backend/envs/example.env  backend/envs/prod[dev].env
cp frontend/envs/example.env frontend/envs/prod[dev].env
```

A detailed description of the environmental variables is presented in the
following Manual Deployment section.

Edit these files with your settings and adjust env paths in the
`docker-compose[.dev].yaml` files accordingly.

Deploy the services for production with running

```bash
docker compose up -d --build
```

or

```bash
docker compose -f docker-compose.dev.yaml up --build -d
```

for development.

### TLS/SSL Termination

This project does not provide a setup to configure TLS/SSL termination for https.
In order to enable HTTPS, please modify the [nginx/default.conf](nginx/default.conf)
configuration file as you wish.

## Manual Deployment

### Frontend Configuration

The frontend service consists in a NGINX web server provided with the static
website files produces by React build. The site must be configure as a
"Single Page App" (SPA). In this context, all routes routed through the web
browser must be **always** redirect to the `/` route.
[Here](frontend/nginx.conf) you can find the default configuration.

The web application needs a configured environment file `env.js` located at
`frontend/public/env.js`. This file is automatically created at runtime, inside
the container, by the [`frontend/init_env.sh`](frontend/init_env.sh) script.

In order to run, the following variables are required to be set in the
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

In addition, you must bind the port 80 to your container.

```shell
docker run \
  -p 8080:80 \
  -e IAM_AUTHORITY=... \
  -e ... \
  frontend
```

If you need, you can also provide a custom configuration for the nginx web server
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

To run the backend service, the following environmental variables
are required to be set in the container

```shell
IAM_AUTHORITY
IAM_CLIENT_ID
IAM_CLIENT_SECRET
S3_ENDPOINT
S3_ROLE_ARN
S3_REGION_NAME     # can be empty, but defined
```

You find an example at [example.dev](backend/envs/example.env).

In addition, you must bind the port 8000 to your container.

```shell
docker run \
  -p 8080:8000 \ 
  -e IAM_AUTHORITY=... \
  -e ... \
  backend
```

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

kubectl -n rook-ceph edit ingress rgw

## Development Endpoints

The following endpoint are available

- Webapp dev [localhost:3000](localhost:3000)
- Webapp prod [localhost:8080](localhost:8080)
- API dev [localhost:3000/api/v1/](localhost:3000/api/v1/)
- API prod [localhost:8080/api/v1/](localhost:8080/api/v1/)
