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
  compiler: {
    removeConsole: { exclude: ["error"] },
  },
};

export default nextConfig;
