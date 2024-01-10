# Project Tree 

This documents shows the current project tree structure and how code is
organized.

## Main Tree

The main tree looks like the following

```shell
├── app
├── backend
├── docs
├── envs
└── nginx
```

- `app`: webapp/frontend source code
- `backend`: backend source code
- `docs`: documentation
- `envs`: directory where to put custom environment files
- `nginx`: directory with NGINX configurations for development and production

## App

The webapp tree looks like the following

```shell
app
├── dist  # git-ignored, present only after npm build
│   └── assets
├── public
└── src
    ├── commons
    ├── components
    ├── models
    ├── routes
    └── services
```

- `dist`: where build artifacts are saved
- `public`: public static files like favicon, logos, robots.txt, fonts and env files
- `src`: source code

And in particular, the `src`'s directories:

- `commons`: directory containing general purpose utilities
- `components`: collection of JSX components (Button, TextField, etc)
- `models`: collection of data models
- `routes`: collection of routes used by `react-router`. Equivalent of "site pages"
- `services`: collection of main services like OAuth2, Notifications, S3
operations etc

### Routes

This section describes how to organize the routes, or site pages, code.

The `index.tsx` file located in `app/src/routes` is a file containing "general"
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
// do stuff with Login JSX component
```

If the route (page) needs more functionalities or custom (non-general purpose)
components, their can be defined within the route subdirectory, for example

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
The backend tree

```shell
backend
├── Dockerfile
└── src
    ├── app.py
    ├── requirements.txt
    └── routes
        ├── __init__.py
        └── oauth
            ├── __init__.py
            ├── models.py
            ├── routes.py
            └── services.py

```

- `src`: source code directory
- `src/app.py`: entrypoint
- `src/routes`: directory whose children are subdirectory containing code per
each route. The `oauth` subdirectory contains code for the `/api/v1/oauth` route

### Routes

The `src/routes` directory contains code organized per different routes,
maintaining the same structure. For example, code for the API route
`<endpoint>/api/v1/foo`, will be organized like

```shell
..
└── routes
    ├── ...
    └── foo
        ├── __init__.py
        ├── models.py
        ├── routes.py
        └── services.py
```
where the files represent

-  `__init__.py`: modules what must be exported to the router
- `models.py`: collection Pydantic modules representing the route data models
- `routes.py`: definition of the HTTP requests like GET/POST/DELETE etc
- `services.py`: functions and utilities used by `routes.py` and specific for
this route.
