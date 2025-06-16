import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ command, mode }) => {
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
    plugins: [react(), tsconfigPaths()],
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
        },
      },
    },
  };
});
