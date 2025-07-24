import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.cjs'
  },
  server: {
    host: true, // or use '0.0.0.0' to be explicit
    port: 5173  // optional: change port if needed
  }
})
