import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      include: "**/*.{js,jsx,ts,tsx}"
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'pages': path.resolve(__dirname, './src/pages'),
      'components': path.resolve(__dirname, './src/components'),
      'context': path.resolve(__dirname, './src/context'),
      'services': path.resolve(__dirname, './src/services'),
      'utils': path.resolve(__dirname, './src/utils')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  build: {
    outDir: 'build',
  },
  server: {
    port: 3000,
  }
}); 