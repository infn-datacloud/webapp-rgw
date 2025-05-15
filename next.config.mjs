/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/browser",
        permanent: true,
      },
    ];
  },
  serverRuntimeConfig: {
    appVersion: process.env.npm_package_version || "",
  },
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: [
      "@opentelemetry/auto-instrumentations-node",
      "@opentelemetry/sdk-node",
    ],
  },
};

export default nextConfig;
