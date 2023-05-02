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
[Here](frontend/nginx.conf) you can find a configuration example which you can
use as

```shell
docker run -p 8080:80 -v $(pwd)/frontend/nginx.conf:/etc/nginx/conf.d/default.conf frontend
```

### Backend Configuration

The only configuration needed to the backend service is an env file, or otherwise
you can directly expose the environmental variables needed, as shown at
[example.dev](backend/envs/example.env)
