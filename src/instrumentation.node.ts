import { NodeSDK } from "@opentelemetry/sdk-node";
import { Resource } from "@opentelemetry/resources";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { AwsInstrumentation } from "@opentelemetry/instrumentation-aws-sdk";

const sdk = new NodeSDK({
  resource: new Resource({
      "service.name": process.env.OTEL_SERVICE_NAME,
      "service.namespace": process.env.OTEL_SERVICE_NAMESPACE
  }),
  instrumentations: [new AwsInstrumentation()],
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
});

sdk.start();
