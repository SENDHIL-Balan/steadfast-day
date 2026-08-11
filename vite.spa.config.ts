/**
 * Static SPA build config — for packaging the app into an Android APK / WebView
 * shell (Capacitor, Median, Bubblewrap, etc.).
 *
 * Output: dist/spa/  (contains index.html + assets, relative paths so it works
 * from file://). The regular SSR build (vite.config.ts) is untouched.
 *
 * Run: npm run build:spa
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname, "spa"),
  publicDir: path.resolve(__dirname, "public"),
  base: "./",
  plugins: [react(), tailwindcss(), tsConfigPaths({ root: __dirname })],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  build: {
    outDir: path.resolve(__dirname, "dist/spa"),
    emptyOutDir: true,
  },
});
