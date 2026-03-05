import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // 🌟 [추가] define 설정
  define: {
    global: 'window',
  },
})
