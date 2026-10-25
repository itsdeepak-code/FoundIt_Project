import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const API_URL = 'http://localhost:5050';

// In development, Vite forwards /api and /uploads to the Express server.
// The browser only ever talks to localhost:5173, so cookies just work.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': API_URL,
      '/uploads': API_URL,
    },
  },
});
