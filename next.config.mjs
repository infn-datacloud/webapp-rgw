/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/home",
        permanent: true,
      },
    ];
  },
  serverRuntimeConfig: {
    appVersion: process.env.npm_package_version || "",
  },
};

export default nextConfig;
