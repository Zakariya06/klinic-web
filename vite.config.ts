// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({ 
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: {
    proxy: {
      '/api': {
        target: 'https://klinic-api-467097446026.europe-west1.run.app',
        // target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false, 
      },
    },
  },
});
