const { defineConfig } = require('vite')
const preact = require('@preact/preset-vite')

module.exports = defineConfig({
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
