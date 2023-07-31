import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
