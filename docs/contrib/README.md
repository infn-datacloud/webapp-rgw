# Development

This document is a collections of guidelines about how to contribute to this
project.

This projects is composed of a backend service and a frontend webapp.
The backend is a minimal Python service
whose sole purpose is to handle the Oidc/OAuth2 AuthN/AuthZ flow, and is
implemented using the [FastAPI](https://fastapi.tiangolo.com) framework.

The frontend is a Typescript ReactJS based web application,
which is the core of the project. Is uses two main frameworks, that are
the official 
[AWS JavaScript SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/) for
all S3 operations and [TailwindCSS](https://tailwindcss.com) CSS framework for
styling.

An NGINX proxy pass instance is also needed to
route the requests to the backend and frontend.

## Getting Started

To run the backend and frontend, Python 3.11 and Node.js v20 are required,
respectively. Docker is also required to run NGINX.

Although it is possible to manually install them manually, it is highly
recommended to use the
[Visual Studio Code Dev Container](https://code.visualstudio.com/docs/devcontainers/containers)
extension for VSCode, since it provides a common and convenient ecosystem with
all the requirements needed for the development. This guide assumes that you use
the VSCode Dev Containers and does not provide instructions for manual
installation of the dependencies.

## Guides

Here, a collection of guides is listed, organized by topics

- [Dev Containers](dev-containers.md)
- [Git Workflow](git-workflow.md)
- [GitLab CI/CD](gitlab-ci.md)
- [Project Tree](project-tree.md)
- [React Hooks](react-hooks.md)
- UI/UX [TODO]
