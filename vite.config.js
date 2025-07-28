import { defineConfig } from "vite";
import pugPlugin from "vite-plugin-pug";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [pugPlugin()],
  // base: command === 'build' ? '/barry-main/' : '/',
  base: '/barry-main/',
  build: {
    outDir: "docs",
  },
}));