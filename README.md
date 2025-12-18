# RADOS Gateway Web Application

This project consists in a web application to easily access file objects stored
within Ceph Object Storage/RADOS Gateway, using the AWS S3 protocol for object
handling, and the OAuth2/OpenID Connect for authorization and authentication
with Indigo IAM.

The webapp is implemented using the React, Next.js, TypeScript and TailwindCSS,
as core frameworks.
The OAuth2 support is provided by the [Auth.js](https://authjs.dev) framework,
while all S3 operations are implemented using the official
[AWS SDK for javascript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/).

## IAM Client Configuration

The webapp acts as client for IAM backend and thus, registering the client is
required. This step is required the first time only (or whenever the local
database volume is deleted/recreated).

To register a new client, go to the chosen IAM instance, login as admin,
register a new client and configure it as described in the following sections.

### Redirect URIs

In the client main page, add all needed redirect uris, in the form of
`<WEBAPP_URL>/api/auth/callback/indigo-iam`
(without the trailing `/`), where `<WEBAPP_URL>` is the hostname of the machine
hosting the application.

It is possible to configure more than one redirect URI.

For development:

```shell
http://localhost:300/api/auth/callback/indigo-iam
```

For a production deployment, the redirect uri will be, for example:

```shell
https://s3webui.cloud.infn.it/api/auth/callback/indigo-iam
```

### Scopes

In the _Scopes_ tab, assure that the following scopes are enabled

- `email`
- `openid`
- `profile`

### Grant Types

In the _Grant Types_ tab, enable `authorization_code`.
Finally, in the **Crypto** section enable PKCE with SHA-256 has algorithm.

## Configuration

Before start the application, an environment file is needed. An example can be
found at [envs/example.env](envs/example.env).

- `AUTH_URL`: hostname of your deployment, for example `htts://s3webui.cloud.infn.it`
  or `http://localhost:8080`
- `AUTH_SECRET`: secret to encrypt session cookies (see below)
- `IAM_AUTHORITY_URL`: INDIGO IAM endpoint
- `IAM_CLIENT_ID`: INDIGO IAM client ID
- `IAM_CLIENT_SECRET`: INDIGO IAM client secret
- `IAM_AUDIENCE`: INDIGO IAM audience for Rados Gateway
- `IAM_SCOPE`: must be exactly `openid email profile`
- `S3_ENDPOINT`: endpoint of Rados Gateway
- `S3_REGION`: Rados Gateway region
- `S3_ROLE_ARN`: Rados Gateway role ARN
- `S3_ROLE_DURATION_SECONDS`: duration of the Role (1h: 3600)

### Auth Secret

The application needs a secret to encrypt/decrypt session cookies.

> **N.B.**: This is a _real_ secret and must be kept secure.

You can generate an `AUTH_SECRET` with the following command:

```shell
openssl rand -base64 32
```

#### Multi-replicas

If you are are going to the deploy in high availability, thus in manifold
replicas, use the same `AUTH_SECRET` for each replica. In this way, sessions
started from a replica can be maintained also with the other replicas.

## Deployment

This project is configured with a CI/CD pipeline which builds Docker images
for development and production releases. The images are stored
[here](https://hub.docker.com/r/indigopaas/webapp-rgw).

To start the application run

```shell
docker run --rm --name s3webui -p 8080:80 --env-file .env indigopaas/webapp-rgw
```

If you have trouble in reaching the Rados Gateway endpoint from within the
container, you can specify the private IP address using the `--add-host` flag
to the `docker run` command, for example

```shell
docker run \
  --rm \
  --name s3webui \
  -d \
  --add-host rgw.cloud.infn.it=10.200.0.18 \
  --add-host s3webui.cloud.infn.it=10.200.0.18 \
  -p 127.0.0.1:8080:80 \
  --env-file .env \
  indigopaas/webapp-rgw
```

## Telemetry

The application supports Opentelemetry instrumentation and INFN-CNAF Otello
service. Telemetry is enabled by default and sends traces to
https://otello.cloud.cnaf.infn.it/collector/v1/traces.

It is possible to change the OTLP collector endpoint setting the
`OTEL_EXPORTER_OTLP_ENDPOINT` variable.

To disable telemetry export the following environment variable

```shell
OTEL_DISABLE_TELEMETRY=1
```
