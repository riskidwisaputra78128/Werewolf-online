import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => ({
  root: new URL('.', import.meta.url).pathname,
  plugins: mode === 'single' ? [viteSingleFile()] : [],
  define: { __OFFLINE_ONLY__: JSON.stringify(mode === 'single') },
  build: { outDir: mode === 'single' ? 'dist-single' : 'dist', emptyOutDir: true, chunkSizeWarningLimit: 2000 },
  server: { fs: { allow: ['..'] }, proxy: { '/socket.io': { target: 'http://localhost:3000', ws: true }, '/api': 'http://localhost:3000' } },
}));
