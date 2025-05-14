import { registerOTel } from "@vercel/otel";

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation.node.ts')
  }
  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME,
    attributes: { 
      "service.namespace": process.env.OTEL_SERVICE_NAMESPACE
    },
  });
}
