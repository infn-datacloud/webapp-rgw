# Development

This document is a collections of guidelines about how to contribute to this
project.

The projects is composed of a backend service and a frontend webapp.
The backend is a minimal Python app on top of the
[FastAPI](https://fastapi.tiangolo.com) framework, whose sole purpose is to
handle the Oidc/OAuth2 authN/authZ flow.

The frontend is a Typescript ReactJS based web application, and is the core of
the project. Is relies on main frameworks: the official
[AWS JavaScript SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
for all S3 operations, and [TailwindCSS](https://tailwindcss.com) as styling
framework.

In addition, NGINX is required to proxy pass the requests to backend and
frontend during development, and to serve the built static files for
deployment.

## Getting Started

To run the backend, the frontend and NGINX, docker is the only requirement.
The project is configured to be executed via the
[Visual Studio Code Dev Container](https://code.visualstudio.com/docs/devcontainers/containers)
extension for VSCode, since it provides a common and convenient ecosystem with
all the requirements needed for the development. This guide assumes that you use
the VSCode Dev Containers and does not provide instructions for manual
installation of the dependencies.

If you can not, o don't want, use Dev Containers, you can use Docker compose.
To have a staring point, have a look at this
[`docker-compose.yaml`](../../.devcontainer/docker-compose.yaml)

## Guides

Here a collection of guides organized by topic.

- [Dev Containers](dev-containers.md)
- [Git Workflow](git-workflow.md)
- [GitLab CI/CD](gitlab-ci.md)
- [Project Tree](project-tree.md)
- [React Hooks](react-hooks.md)
- UI/UX [TODO]
