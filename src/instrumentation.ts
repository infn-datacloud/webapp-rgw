// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { OTLPHttpJsonTraceExporter, registerOTel } from "@vercel/otel";
import { settings } from "@/config";

const {
  WEBAPP_RGW_OTEL_DISABLE_TELEMETRY,
  WEBAPP_RGW_OTEL_SERVICE_NAME,
  WEBAPP_RGW_OTEL_SERVICE_NAMESPACE,
  WEBAPP_RGW_OTEL_EXPORTER_OTLP_ENDPOINT,
} = settings;

export async function register() {
  if (WEBAPP_RGW_OTEL_DISABLE_TELEMETRY) {
    return;
  }

  console.log(
    `Telemetry enabled: sending data to ${WEBAPP_RGW_OTEL_EXPORTER_OTLP_ENDPOINT}. ` +
      "To disable telemetry export the WEBAPP_RGW_OTEL_EXPORTER_OTLP_ENDPOINT=1 environment variable."
  );

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation.node.ts");
  }
  registerOTel({
    serviceName: WEBAPP_RGW_OTEL_SERVICE_NAME,
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: WEBAPP_RGW_OTEL_EXPORTER_OTLP_ENDPOINT,
    }),
    attributes: {
      "service.namespace": WEBAPP_RGW_OTEL_SERVICE_NAMESPACE,
    },
  });
}
