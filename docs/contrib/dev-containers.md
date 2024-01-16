# Dev Containers

To use Dev Containers, Docker is the only requirement (or similar container
software such as Podman o Colima). The setup is located in the
[`.devcontainer`](../../.devcontainer) directory. Its content is

- `devcontainer.json`configuration file
- `docker-compose.yaml` to deploy the services (webapp, backend and NGINX)
- `Dockerfile`

The file [`.devcontainer/Dockerfile`] (.devcontainer/Dockerfile)
defines a simple container for running the webapp development server,
which differs from the container used for production deployment located at
[`app/Dockerfile`](app/Dockerfile).
Since there is no distinction between the production and development version
of the backend container, the same
[`backend/Dockerfile`](../../backend/Dockerfile) is used.

To start the development environment, simply open the project with VSCode and
click on `Open/Reopen in Container`. During the first run, the Docker images are
downloaded/built and all the dependencies installed. Once the VSCode environment
is ready, with `docker ps` you should see the following running containers

- `webapp-rgw-dev`
- `webapp-rgw-dev-backend`
- `webapp-rgw-dev-nginx`

Once the environment is loaded in VSCode, the development server should
automatically start prompting something like

```text
VITE v4.4.7  ready in 2129 ms

➜  Local:   http://localhost:3000/
➜  Network: http://172.18.0.3:3000/
➜  press h to show help
```

## Manually start the development server

In case you have already built and started the containers, it is possible that
the [ViteJS](https://vitejs.dev) development server will not
automatically start after reopening the project with VSCode's Dev Containers.
In this case, or if you are using classic Docker compose containers, you
can manually start the server by running

```shell
cd app
npm install # To do once, if node nodules are not installed yet
npm run dev
```

The output should be the same as shown above.
