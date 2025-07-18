import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    host: 'localhost',
    port: 5173,
  },
  optimizeDeps: {
    include: ['sockjs-client', '@stomp/stompjs'],
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
})
