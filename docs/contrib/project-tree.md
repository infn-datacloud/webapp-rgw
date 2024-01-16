# Project Tree

This documents describes the current project tree structure and how code is
organized.

## Main Tree

The root tree of this repository is

```shell
├── app           # frontend source code
├── backend       # backend source code
├── docs          # documentation
├── envs          # where to put custom environment files
└── nginx         # NGINX configurations for development and production
```

## App

The webapp tree

```shell
app
├── dist           # build artifacts. git-ignored, present only after npm build
├── public         # public static files like logos, fonts, env files and more
└── src
    ├── commons    # general purpose utilities
    ├── components # collection of general JSX components (Button, TextField, etc)
    ├── models     # collection of data models
    ├── routes     # collection of routes used by react-router (site pages)
    └── services   # collection of main services like OAuth2, Notifications S3
```

### Routes

This section describes how to organize routes, or site pages, code.

The [`app/src/routes/index.tsx`](app/src/routes/index.tsx) file contains general
variables, like the `router` or `staticRoutes` objects,
which can be directly imported from the `routes` module, for example

```tsx
import { router, staticRoutes } from 'routes';
```

Each distinct route, than is organized within its respective directory. If the
webapp has, for example, the `/login`, `/home` and `/foo` routes (or pages), the
`routes` directory will have three subdirectories named `Login`, `Home` and
`Foo`, each containing its own `index.tsx` file, which exposes the exported
fields. Thus, the minimum tree would look like

```shell
app/src/routes
├── Home
│   └── index.tsx
├── Login
│   └── index.tsx
├── Foo
│   └── index.tsx
└── index.tsx
```

and the route is used with

```tsx
import { Login } from 'routes/login';
```

If the route (page) needs advance functionality and/or custom components, they
can be defined within the route subdirectory, for example

```shell
app/src/routes
├── Home
│   └── index.tsx
├── Login
│   └── index.tsx
├── Foo
│   ├── components
│   │   ├── BeautifulComponent.tsx
│   │   └── AwesomeComponent.tsx
│   ├── index.tsx
│   ├── reducer.ts
│   └── services.tsx
└── index.tsx
```

### Services

To learn how to organize the services source code, please refer to the
[React Hooks guide](react-hooks.md).


## Backend

The backend tree structure. The `src/routes` directory contains code organized
in subdirectory, one per each route.
Every router directory respect the same structure as shown below

```shell
backend
├── Dockerfile
└── src
    ├── app.py              # entrypoint
    ├── requirements.txt    # dependency manifest
    └── routes
        ├── __init__.py     # routes module definitions
        └── <endpoint>      # implementation of the /api/v1/<endpoint> route
            ├── __init__.py # define functions to be exported to the router
            ├── models.py   # Pydantic data models of the route
            ├── routes.py   # definition of the HTTP requests (GET/POST/DELETE, ...)
            └── services.py # functions and utilities used by `routes.py`
