import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.docx'],
  test: {
    environment: 'jsdom',
    passWithNoTests: true,
    exclude: ['**/node_modules/**', '**/.claude/**', '**/.superpowers/**'],
    isolate: true,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
        isolate: true,
      },
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    sequence: {
      shuffle: false,
    },
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
      '@piar-digital-app': path.resolve(rootDir, './src'),
    },
  },
});
