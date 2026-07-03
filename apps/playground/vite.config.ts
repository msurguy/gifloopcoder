import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// BASE_PATH is set to /gifloopcoder/ for GitHub Pages project-site deploys.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      // Consume the library from source for HMR during development.
      gifloopcoder: fileURLToPath(new URL('../../packages/glc/src/index.ts', import.meta.url)),
    },
  },
  build: {
    target: 'es2021',
  },
});
