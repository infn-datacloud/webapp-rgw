// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { NodeSDK } from "@opentelemetry/sdk-node";
import { Resource } from "@opentelemetry/resources";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { AwsInstrumentation } from "@opentelemetry/instrumentation-aws-sdk";
import { settings } from "@/config";

const sdk = new NodeSDK({
  resource: new Resource({
    "service.name": settings.otelServiceName,
    "service.namespace": settings.otelServiceNamespace,
  }),
  instrumentations: [new AwsInstrumentation()],
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({ url: settings.otelExportOtlpEndpoint })
  ),
});

sdk.start();
