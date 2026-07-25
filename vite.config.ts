import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Use '/' for Vercel deployments and '/madhuban_website/' for GitHub Pages
const base = process.env.VERCEL ? '/' : (process.env.VITE_BASE_PATH || '/madhuban_website/')

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    proxy: {
      '/madhuban_website/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/madhuban_website\/api/, '/api'),
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
