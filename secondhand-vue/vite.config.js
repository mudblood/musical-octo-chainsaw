// https://vite.dev/config/

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true, // or '0.0.0.0' to expose on all interfaces
    port: 5173, // optional, for clarity
  },
})
