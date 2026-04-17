import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/ml-api': {
        target: 'https://ai-healtcare-13.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ml-api/, '')
      }
    }
  }
})