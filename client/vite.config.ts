import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    // Exclude the large binary model shards from file-system watching
    // to prevent EBUSY errors on Windows and unnecessary HMR triggers
    watch: {
      ignored: [
        '**/public/models/**',
        '**/*.shard*',
      ],
    },
  },

  // Exclude face-api.js from Vite's dependency pre-bundling
  // (it uses Node.js fs internally — browser build must be used as-is)
  optimizeDeps: {
    exclude: ['face-api.js'],
  },

  // Ensure model JSON manifests are not inlined — they must be fetched at runtime
  assetsInclude: ['**/*.json'],
});
