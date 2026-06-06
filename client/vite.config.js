import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config for the X/Twitter clone client.
// Dev server runs on 5173; API/WS base URLs come from VITE_* env vars.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: "build",
    sourcemap: false,
  },
});
