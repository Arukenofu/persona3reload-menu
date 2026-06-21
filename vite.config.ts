import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { generateMusicNamesPlugin } from './scripts/generate-music-names'

export default defineConfig({
  plugins: [
    generateMusicNamesPlugin(),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'iconify-icon'
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  publicDir: 'static',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', 'three/addons/loaders/GLTFLoader.js']
        }
      }
    }
  }
})
