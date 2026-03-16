import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    typecheck: { tsconfig: './tsconfig.test.json' },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
