import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readdirSync } from 'fs';
import { join } from 'path';
import config from './package.json';

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const config = require('./package.json');
export default defineConfig(({ mode }) => {
  console.log('defineConfig', mode);
  const production = mode === 'production';
  console.log('mode', mode);
  return {
    root: './src',
    base: './', // use relative paths
    publicDir: '../public',
    clearScreen: false,
    server: {
      port: 3000,
      strictPort: true,
    },

    resolve: {
      alias: {
      },
    },
    optimizeDeps: {
    },
    // to make use of `TAURI_PLATFORM`, `TAURI_ARCH`, `TAURI_FAMILY`, `TAURI_PLATFORM_VERSION`, `TAURI_PLATFORM_TYPE` and `TAURI_DEBUG` env variables
    envPrefix: ['VITE_', 'TAURI_'],
    build: {
      outDir: '../build',
      emptyOutDir: true,
      // tauri supports es2021
      target: ['es2021', 'chrome97', 'safari13'],
      // don't minify for debug builds
      minify: !process.env.TAURI_DEBUG && 'esbuild',
      // produce sourcemaps for debug builds
      sourcemap: !!process.env.TAURI_DEBUG,
    },
    plugins: [react()],

    define: {
      PRODUCTION: production,
      OAUTH_CLIENT_ID: '"1f653ca15007e4ba9087"',
      OAUTH_CLIENT_SECRET: '"c4fb0a4d2addd1830744890e1fed4da4ae051ad8"'
    },
  };
});