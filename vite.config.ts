import { defineConfig, loadEnv, type ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import eslintPlugin from 'vite-plugin-eslint';
import Components from 'unplugin-react-components/vite';
import tailwindcss from 'tailwindcss';

export default defineConfig(({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd());
  return {
    base: env.VITE_APP_ROUTER_PREFIX,
    plugins: [
      react(),
      eslintPlugin(),
      Components({
        dts: true,
        dirs: ['src/components'],
        resolvers: [],
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    css: {
      postcss: {
        plugins: [tailwindcss],
      },
    },
    build: {
      outDir: env.VITE_APP_OUTPUT,
      sourcemap: Boolean(env.VITE_APP_SOURCEMAP),
    },
    server: {
      host: 'localhost',
      port: 5588,
      proxy: {
        '/api': {
          target: env.VITE_APP_PROXY_API,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
      cors: true,
    },
  };
});
