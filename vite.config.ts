import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // JSON-Importe sind standardmäßig unterstützt
  server: {
    proxy: {
      '/api': {
        target: 'https://eb-due.mirosens.com',
        changeOrigin: true,
        secure: true
      }
    }
  },
  build: {
    rollupOptions: {
      external: ['@prisma/client', 'prisma'],
    },
  }
})

