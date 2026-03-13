import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
server: {
  proxy: {
    '/auth':        'http://localhost:3000',
    '/collection':  'http://localhost:3000',
    '/request':     'http://localhost:3000',
    '/environment': 'http://localhost:3000',
    '/history':     'http://localhost:3000',
    '/proxy':       'http://localhost:3000',  // ← add this
  }
}
})
