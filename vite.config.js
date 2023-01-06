import { defineConfig } from "vite";
import reactPlugin from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactPlugin()],
  resolve: {
    dedupe: ["replicad"],
  },
  build: {
    outDir: "build",
  },
  server: {
    port: 4444,
  },
});
