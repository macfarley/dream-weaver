import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(() => {
  const originalWarn = console.warn;

  // Patch console.warn to filter specific Sass deprecation warnings
  console.warn = (msg, ...args) => {
    if (typeof msg === 'string') {
      if (
        msg.includes('Deprecation Warning') &&
        (msg.includes('lighten(') || msg.includes('green()') || msg.includes('Global built-in functions'))
      ) {
        return; // Suppress these messages
      }
    }
    originalWarn(msg, ...args);
  };

  return {
    plugins: [
      react(), 
      tsconfigPaths(),
      visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      })
    ],
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            bootstrap: ['react-bootstrap', 'bootstrap'],
            router: ['react-router', 'react-router-dom'],
            icons: ['lucide-react'],
            dateFns: ['date-fns'],
          }
        }
      }
    }
  };
});
