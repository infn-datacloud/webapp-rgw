import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true
    })
  ],
  server: {
    port: 3000,
    hmr: {
      path: "/ws",
      clientPort: 3000
    },
    watch: {
      usePolling: true
    }
  },
  define: {
    'APP_VERSION': JSON.stringify(process.env.npm_package_version),
  }
})
