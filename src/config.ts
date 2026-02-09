// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import packageInfo from "../package.json";

function loadAppVersion() {
  return packageInfo.version ?? "0.0.0";
}

function loadEnvVariable(key: string, defaultValue?: string) {
  if (process.env[key]) {
    return process.env[key];
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return "";
  }
  throw Error(`${key} environment variable not set`);
}

function loadBaseUrl() {
  return loadEnvVariable(
    "WEBAPP_RGW_BASE_URL",
    "http://webapp-rgw.test.example"
  );
}

function loadAuthSecret() {
  return loadEnvVariable("WEBAPP_RGW_AUTH_SECRET");
}

function loadOidcIssuer() {
  return loadEnvVariable("WEBAPP_RGW_OIDC_ISSUER");
}

function loadOidcClientId() {
  return loadEnvVariable("WEBAPP_RGW_OIDC_CLIENT_ID");
}

function loadOidcClientSecret() {
  return loadEnvVariable("WEBAPP_RGW_OIDC_CLIENT_SECRET");
}

function loadOidcScope() {
  return "openid email profile";
}

function loadOidcAudience() {
  return loadEnvVariable("WEBAPP_RGW_OIDC_AUDIENCE", "");
}

function loadS3Endpoint() {
  return loadEnvVariable("WEBAPP_RGW_S3_ENDPOINT");
}

function loadS3Region() {
  return loadEnvVariable("WEBAPP_RGW_S3_REGION", "");
}

function loadS3RoleArn() {
  return loadEnvVariable("WEBAPP_RGW_S3_ROLE_ARN", "");
}

function loadS3RoleDurationSeconds() {
  return parseInt(
    loadEnvVariable("WEBAPP_RGW_S3_ROLE_DURATION_SECONDS", "600")
  );
}

function loadOtelServiceName() {
  return loadEnvVariable("WEBAPP_RGW_OTEL_SERVICE_NAME", "s3webui");
}

function loadOtelServiceNamespace() {
  const baseURL = loadBaseUrl();
  return new URL(baseURL).hostname;
}

function loadOtelExporterOtlpEndpoint() {
  return loadEnvVariable(
    "WEBAPP_RGW_OTEL_EXPORTER_OTLP_ENDPOINT",
    "https://otello.cloud.cnaf.infn.it:8443/collector/v1/traces"
  );
}

function loadOtelDisableTelemetry() {
  const maybeDisabled = loadEnvVariable(
    "WEBAPP_RGW_OTEL_DISABLE_TELEMETRY",
    "false"
  );
  return maybeDisabled === "true" || maybeDisabled === "1";
}

export const settings = {
  WEBAPP_RGW_VERSION: loadAppVersion(),
  WEBAPP_RGW_BASE_URL: loadBaseUrl(),
  WEBAPP_RGW_AUTH_SECRET: loadAuthSecret(),
  WEBAPP_RGW_OIDC_ISSUER: loadOidcIssuer(),
  WEBAPP_RGW_OIDC_CLIENT_ID: loadOidcClientId(),
  WEBAPP_RGW_OIDC_CLIENT_SECRET: loadOidcClientSecret(),
  WEBAPP_RGW_OIDC_SCOPE: loadOidcScope(),
  WEBAPP_RGW_OIDC_AUDIENCE: loadOidcAudience(),
  WEBAPP_RGW_S3_ENDPOINT: loadS3Endpoint(),
  WEBAPP_RGW_S3_REGION: loadS3Region(),
  WEBAPP_RGW_S3_ROLE_ARN: loadS3RoleArn(),
  WEBAPP_RGW_S3_ROLE_DURATION_SECONDS: loadS3RoleDurationSeconds(),
  WEBAPP_RGW_OTEL_CLIENT_SECRET: loadOidcClientSecret(),
  WEBAPP_RGW_OTEL_SERVICE_NAME: loadOtelServiceName(),
  WEBAPP_RGW_OTEL_SERVICE_NAMESPACE: loadOtelServiceNamespace(),
  WEBAPP_RGW_OTEL_EXPORTER_OTLP_ENDPOINT: loadOtelExporterOtlpEndpoint(),
  WEBAPP_RGW_OTEL_DISABLE_TELEMETRY: loadOtelDisableTelemetry(),
};
