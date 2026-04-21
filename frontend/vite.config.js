import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['node_modules/', 'src/test/', 'e2e/', 'dist/'],
    },
    exclude: ['node_modules', 'dist', 'e2e'],
  },
  plugins: [
    react(),
    tailwindcss(),
    process.env.ANALYZE === 'true' && visualizer({ open: true, filename: 'dist/stats.html', gzipSize: true }),
  ].filter(Boolean),
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
