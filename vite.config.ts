import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/hf-api': {
        // 🚀 AÑADIMOS LA RUTA EXACTA DEL NUEVO ROUTER DE INFERENCIA
        target: 'https://router.huggingface.co/hf-inference', 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hf-api/, '')
      }
    }
  }
})