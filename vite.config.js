import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import { creaoPlugins } from "./config/vite/creao-plugin.mjs";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.TENANT_ID ? `/${process.env.TENANT_ID}/` : "/",

  define: {
    "import.meta.env.TENANT_ID": JSON.stringify(process.env.TENANT_ID || ""),
  },

  plugins: [
    ...creaoPlugins(),
    TanStackRouterVite({
      autoCodeSplitting: false, // affects pick-n-edit feature. disabled for now.
    }),
    viteReact({
      jsxRuntime: "automatic",
    }),
    svgr(),
    tailwindcss(),
  ],

  test: {
    globals: true,
    environment: "jsdom",
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },

  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true, // respond to any Host header
    watch: {
      usePolling: true,
      interval: 300,
    },
  },

  build: {
    // 👇 NEW: ensure SPA HTML is generated into dist
    rollupOptions: {
      input: resolve(__dirname, "index.html"),
    },
    chunkSizeWarningLimit: 1500,
    sourcemap: process.env.NODE_ENV !== "production",
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@tanstack/react-router",
      "@tanstack/react-query",
      "zustand",
      "date-fns",
      "lucide-react"
    ],
  },
});
