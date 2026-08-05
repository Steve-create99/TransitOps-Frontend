import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy target: VITE_PROXY_TARGET > local backend > Railway fallback
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget =
    env.VITE_PROXY_TARGET ||
    'https://web-production-f8ec21.up.railway.app'


  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    preview: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
