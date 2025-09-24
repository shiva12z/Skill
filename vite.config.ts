import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    strictPort: true,
    cors: false, // disable cross-origin access to dev server
    fs: {
      strict: true,
      // Expand default deny list to explicitly cover env files and dotfiles
      deny: [
        '.env',
        '.env.*',
        '**/*.env',
        '**/*.env.*',
        // common sensitive dotfiles
        '.git',
        '**/.git',
      ],
    },
  },
  preview: {
    host: 'localhost',
    strictPort: true,
    cors: false,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
