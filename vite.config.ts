import { defineConfig } from "vite";
import { copyFileSync } from "node:fs";
export default defineConfig({
  build: {
    rollupOptions: { output: { manualChunks: { phaser: ["phaser"] } } },
  },
  plugins: [
    {
      name: "runtime-license-notices",
      closeBundle() {
        copyFileSync("THIRD_PARTY_NOTICES.md", "dist/THIRD_PARTY_NOTICES.md");
      },
    },
  ],
});
