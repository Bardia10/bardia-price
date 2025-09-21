import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow external connections including custom domains
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'myapp.test' // Add your custom domain here
    ]
  },
});

