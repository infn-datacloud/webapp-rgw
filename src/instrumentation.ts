// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { OTLPHttpJsonTraceExporter, registerOTel } from "@vercel/otel";
import { settings } from "@/config";

export async function register() {
  if (process.env.OTEL_DISABLE_TELEMETRY) {
    return;
  }

  console.log(
    `Telemetry enabled: sending data to ${settings.otelExportOtlpEndpoint}. To disable telemetry export the OTEL_DISABLE_TELEMETRY environment variable.`
  );

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation.node.ts");
  }
  registerOTel({
    serviceName: settings.otelServiceName,
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: settings.otelExportOtlpEndpoint,
    }),
    attributes: {
      "service.namespace": settings.otelServiceNamespace,
    },
  });
}
