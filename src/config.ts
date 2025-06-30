// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

if (!process.env.AUTH_URL) {
  throw Error("AUTH_URL environment variable not set");
}

const otelServiceName = "s3webui";

const otelServiceNamespace = new URL(process.env.AUTH_URL).hostname;

const otelExportOtlpEndpoint =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??
  "https://otello.cloud.cnaf.infn.it:8443/collector/v1/traces";

export const settings = {
  otelServiceName,
  otelServiceNamespace,
  otelExportOtlpEndpoint,
};
