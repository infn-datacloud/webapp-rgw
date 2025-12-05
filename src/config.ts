// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import packageInfo from "../package.json";

if (
  process.env.NEXT_PHASE !== "phase-production-build" &&
  !process.env.AUTH_URL
) {
  throw Error("AUTH_URL environment variable not set");
}

const authUrl = process.env.authUrl ?? "http://webapp-rgw.test.example";

const otelServiceName = "s3webui";

const otelServiceNamespace = new URL(authUrl).hostname;

const otelExportOtlpEndpoint =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??
  "https://otello.cloud.cnaf.infn.it:8443/collector/v1/traces";

const appVersion = packageInfo.version ?? "0.0.0";

export const settings = {
  otelServiceName,
  otelServiceNamespace,
  otelExportOtlpEndpoint,
  appVersion,
};
