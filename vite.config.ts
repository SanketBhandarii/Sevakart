import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 👈 sets `@` to point to `src` folder
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
