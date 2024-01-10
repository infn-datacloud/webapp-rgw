# Dev Containers

Using Dev Containers, the only requirement is Docker (or similar container
software such as Podman o Colima). All the setup is located in the
[`.devcontainer`](../../.devcontainer) directory, the `devcontainer.json`
configuration file, a `docker-compose.yaml` to deploy the services
(webapp, backend and NGINX) and a `Dockerfile`. The latter defines a simple
container for running the webapp development server, which differs from the
container used for production deployment, which is located in
[app/Dockerfile](app/Dockerfile).
Since there is no distinction between the production and development version
of the backend container, the same
[`backend/Dockerfile`](../../backend/Dockerfile) is used.

To start the development environment, simply open the project with VSCode and
click on `Open/Reopen in Container`. The first time the docker images will be
downloaded/built and all the dependencies installed. Once the VSCode environment
is ready, you should see the following running containers

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
the development [ViteJS](https://vitejs.dev) development server will not
automatically start after reopening the project in VSCode's Dev Containers.
If this is the case, or you are using classic Docker compose containers, you
can manually start the server by running

```shell
cd app
npm install # To do once, if node nodules are not installed yet
npm run dev
```

The output should be the same as shown above.
