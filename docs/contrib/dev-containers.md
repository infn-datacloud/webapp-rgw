# Dev Containers

Using the Dev Containers, the only requirement is Docker (or similar container
software such as Podman o Colima). All the setup is located in the
[.devcontainer](.devcontainer) directory which contains three main files,
the `devcontainer.json` manifest, a `docker-compose.yaml` file to manage the
services (webapp, backend and NGINX) and a `Dockerfile`. The latter defines a
simple container for running the webapp development server, which differs
from the container used for production deployment, which is located in
[app/Dockerfile](app/Dockerfile). Since there is no distinction between the
the production and development version of the backend container, the same
[backend/Dockerfile](backend/Dockerfile) is used.

To start the development environment, simply open the project with VSCode and
click on `Open/Reopen in Container`. The first time, the docker images will be
downloaded/built and all the dependencies installed. Once the VSCode environment
is ready, you should see the following running containers

- `webapp-rgw-dev`
- `webapp-rgw-dev-backend`
- `webapp-rgw-dev-nginx`

Once the environment is loaded within VSCode, the development server should
automatically start, and the following will be prompted

```text
VITE v4.4.7  ready in 2129 ms

➜  Local:   http://localhost:3000/
➜  Network: http://172.18.0.3:3000/
➜  press h to show help
```

## Manually start the development server

In case you have already built and stated the containers, it is possible that
the development server won't start automatically after reopening the project
with VSCode's Dev Containers. If this is the case, or you don't want to use
containers, you can manually start the server.

To manually start the development server, run

```shell
cd app
npm install # To do once, if node nodules are not installed yet
npm run dev
```

and the output should be

```text
VITE v4.4.7  ready in 2129 ms

➜  Local:   http://localhost:3000/
➜  Network: http://172.18.0.3:3000/
➜  press h to show help
```
