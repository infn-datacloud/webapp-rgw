import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: "s3webui",
    attributes: { "host.name": process.env.AUTH_URL },
  });
}
