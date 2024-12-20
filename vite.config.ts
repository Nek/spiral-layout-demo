import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  optimizeDeps: {
    include: ['preact', 'preact/hooks']
  },
  plugins: [preact()],
  server: {
    open: true
  },
  build: {
    sourcemap: true
  },
  resolve: {
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat'
    }
  }
})
