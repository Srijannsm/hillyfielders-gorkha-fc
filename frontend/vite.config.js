import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // Rewrite cookie domain so httpOnly auth cookies work in development
        cookieDomainRewrite: 'localhost',
      },
    },
  },
  build: {
    // Inline assets smaller than 4 KB as base64 (saves round-trips for tiny icons)
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy vendor libs into separate cache-friendly chunks
          'vendor-react':  ['react', 'react-dom', 'react-router-dom'],
          'vendor-query':  ['@tanstack/react-query'],
          'vendor-ui':     ['react-helmet-async'],
        },
      },
    },
  },
})
