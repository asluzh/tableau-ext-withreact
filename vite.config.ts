import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/tableau-ext-withreact/',
  root: 'src',
  publicDir: false,
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'src/index.html',
        config: 'src/config.html'
      }
    }
  }
})
