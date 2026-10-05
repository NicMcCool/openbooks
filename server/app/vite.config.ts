import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  // Keep API requests, download cookies, and WebSockets on the browser's origin.
  // Only the development server proxies these routes; production is unchanged.
  server: {
    proxy: {
      "/ws": { target: "http://127.0.0.1:5228", ws: true },
      "/servers": { target: "http://127.0.0.1:5228" },
      "/library": { target: "http://127.0.0.1:5228" }
    }
  }
});
