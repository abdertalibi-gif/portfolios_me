import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

function portfolioApi(): Plugin {
  return {
    name: 'portfolio-api',
    configureServer(server) {
      // The Express middlewares are configured in server/index.ts,
      // which is started separately via `npm run start`.
      // No Resend initialization occurs during Vite config loading.
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {ignored: ['**/data/**']},
    },
  };
});