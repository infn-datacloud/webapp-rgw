// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { NodeSDK } from "@opentelemetry/sdk-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { AwsInstrumentation } from "@opentelemetry/instrumentation-aws-sdk";
import { settings } from "@/config";

const {
  WEBAPP_RGW_OTEL_SERVICE_NAME,
  WEBAPP_RGW_OTEL_SERVICE_NAMESPACE,
  WEBAPP_RGW_OTEL_EXPORTER_OTLP_ENDPOINT,
} = settings;

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    "service.name": WEBAPP_RGW_OTEL_SERVICE_NAME,
    "service.namespace": WEBAPP_RGW_OTEL_SERVICE_NAMESPACE,
  }),
  instrumentations: [new AwsInstrumentation()],
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({ url: WEBAPP_RGW_OTEL_EXPORTER_OTLP_ENDPOINT })
  ),
});

sdk.start();
