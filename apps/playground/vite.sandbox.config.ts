import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Builds the sandbox-iframe runtime as a single classic (IIFE) script into
// public/, where the main build picks it up as a static asset. A classic
// script is required: the sandboxed iframe has an opaque origin, and module
// scripts fetch with CORS mode + Origin: null, which is fragile across hosts.
export default defineConfig({
  resolve: {
    alias: {
      gifloopcoder: fileURLToPath(new URL('../../packages/glc/src/index.ts', import.meta.url)),
    },
  },
  build: {
    target: 'es2021',
    outDir: 'public',
    emptyOutDir: false,
    copyPublicDir: false,
    lib: {
      entry: fileURLToPath(new URL('./src/sandbox/runtime.ts', import.meta.url)),
      name: 'GLCSandbox',
      formats: ['iife'],
      fileName: () => 'sandbox.iife.js',
    },
  },
});
