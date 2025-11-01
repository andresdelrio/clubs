import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function normalizeBase(rawBase) {
  const withLeading = rawBase.startsWith('/') ? rawBase : `/${rawBase}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

// https://vite.dev/config/
export default ({ mode }) => {
  // Load env from parent directory (project root)
  const env = loadEnv(mode, path.resolve(process.cwd(), '..'), '');
  const basePath = normalizeBase(env.VITE_BASE_PATH || '/');

  return defineConfig({
    base: basePath,
    plugins: [react()],
  });
};
