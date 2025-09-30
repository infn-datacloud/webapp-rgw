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
  images: {
    remotePatterns: [new URL("https://gravatar.com/avatar/*?r=g&d=identicon")],
  },
  serverRuntimeConfig: {
    appVersion: process.env.npm_package_version || "",
  },
  serverExternalPackages: [
    "@opentelemetry/auto-instrumentations-node",
    "@opentelemetry/sdk-node",
  ],
};

export default nextConfig;
