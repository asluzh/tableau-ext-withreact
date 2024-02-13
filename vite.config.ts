import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/tableau-ext-withreact/',
  root: 'src',
  publicDir: '../public',
  plugins: [
    react()
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'src/index.html',
        config: 'src/config.html'
      },
      // output: {
      //   assetFileNames: (assetInfo) => {
      //     if (assetInfo.name === 'style.css') return 'custom.css';
      //     return assetInfo.name;
      //   },
      // },
    }
  }
})
