import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' permite servir a app em qualquer subcaminho (GitHub Pages: /nome-do-repo/)
export default defineConfig({
  base: './',
  plugins: [react()],
})
