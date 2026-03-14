import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_API_URL || 'http://localhost:3000'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/auth':        backendUrl,
        '/collection':  backendUrl,
        '/request':     backendUrl,
        '/environment': backendUrl,
        '/history':     backendUrl,
        '/proxy':       backendUrl,
      }
    }
  }
})