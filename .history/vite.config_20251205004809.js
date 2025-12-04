import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://hospital-prj-2025-1-be.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path
      }
    }
  }
})
