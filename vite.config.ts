import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiProxy = {
  "/api": {
    target: "http://localhost:5148",
    changeOrigin: true,
  },
  "/hubs": {
    target: "http://localhost:5148",
    changeOrigin: true,
    ws: true,
  },
  "/health": {
    target: "http://localhost:5148",
    changeOrigin: true,
  },
  "/media": {
    target: "http://localhost:5148",
    changeOrigin: true,
  },
  "/posts/medias": {
    target: "http://localhost:5148",
    changeOrigin: true,
  },
} as const;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: apiProxy,
  },
  preview: {
    proxy: apiProxy,
  },
});
