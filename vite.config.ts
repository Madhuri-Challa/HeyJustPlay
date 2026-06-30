import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@platform": fileURLToPath(new URL("./apps/platform/src", import.meta.url)),
      "@wordshift": fileURLToPath(new URL("./games/wordshift/src", import.meta.url)),
      "@games": fileURLToPath(new URL("./games", import.meta.url)),
      "@packages": fileURLToPath(new URL("./packages", import.meta.url)),
    },
  },
});
