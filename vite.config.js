import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://attendance-backend-production-ade0.up.railway.app',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
  preview: {
    port: 5173,
  },
})
