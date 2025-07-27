import { defineConfig } from "vite";
import pugPlugin from "vite-plugin-pug";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [pugPlugin()],
  base: command === 'build' ? '/barry-main/' : '/',
  build: {
    outDir: "docs",
  },
}));