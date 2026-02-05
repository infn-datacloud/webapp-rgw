# RADOS Gateway Web Application

This project consists in a web application to easily access file objects stored
within Ceph Object Storage/RADOS Gateway, using the AWS S3 protocol for object
handling, and the OAuth2/OpenID Connect for authorization and authentication via
the Secure Token Service (STS).

The webapp is implemented using the React, Next.js, TypeScript and TailwindCSS,
as core frameworks.
The OAuth2 support is provided by the [Auth.js](https://authjs.dev) framework.
All S3 operations are implemented using the official
[AWS SDK for javascript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/).

## OpenID/OAuth2 Client Configuration

The webapp acts as client OpenID Conenct/OAuth2 client and thus, registering the
client is required.

The following sections describe how to configure an OpenID Connect/OAuth2
client.

### Redirect URIs

Redirect URIs must be in the form of
`<WEBAPP_RGW_BASE_URL>/api/auth/callback/indigo-iam`
(without the trailing `/`), where `<WEBAPP_RGW_BASE_URL>` is the
hostname of the machine hosting the application.

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

Enable the following scopes

- `email`
- `openid`
- `profile`

### Grant Types and Crypto

The `authorization_code` grant type is required.
Enable the PKCE crypto feature with SHA-256 has algorithm.

## Configuration

Before start the application, an environment file is needed. An example can be
found at [envs/example.env](envs/example.env).

- `WEBAPP_RGW_BASE_URL`: hostname of your deployment, for example
  https://s3webui.cloud.infn.it or http://localhost:3000
- `WEBAPP_RGW_AUTH_SECRET`: secret to encrypt session cookies (see below)
- `WEBAPP_RGW_OIDC_ISSUER`: OpenID Connect Issuer
- `WEBAPP_RGW_OIDC_CLIENT_ID`: OpenID Connect Client ID
- `WEBAPP_RGW_OIDC_CLIENT_SECRET` OpenID Connect Client Secret
- `WEBAPP_RGW_OIDC_AUDIENCE`: OpenID Connect Audience
- `WEBAPP_RGW_S3_ENDPOINT`: Rados Gateway/S3 API Endpoint
- `WEBAPP_RGW_S3_REGION`: Rados Gateway/S3 Region Name
- `WEBAPP_RGW_S3_ROLE_ARN`: Rados Gateway Role/S3 ARN
- `WEBAPP_RGW_S3_ROLE_DURATION_SECONDS`: Rados Gateway/S3 Role duration in seconds

### Auth Secret

The application needs a secret to encrypt/decrypt session cookies.

> **N.B.**: This is a _real_ secret and must be kept secure.

You can generate an `WEBAPP_RGW_AUTH_SECRET` with the following command:

```shell
openssl rand -base64 32
```

#### Multi-replicas

If you are are going to the deploy in high availability, thus in manifold
replicas, use the same `WEBAPP_RGW_AUTH_SECRET` for each replica. In this way,
sessions started from a replica can be maintained also with the other replicas.

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

To change the OpenTelemetry OTLP collector endpoint set the environment variable

```
WEBAPP_RGW_OTEL_EXPORTER_OTLP_ENDPOINT=https://otello.cloud.cnaf.infn.it/collector/v1/traces
```

To completely disable telemetry set the following environment variable

```shell
WEBAPP_RGW_OTEL_DISABLE_TELEMETRY=1
```
