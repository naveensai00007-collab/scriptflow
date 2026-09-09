import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "ScriptFlow",
        short_name: "ScriptFlow",
        description: "Offline-first screenplay editor with real-time structure and export",
        theme_color: "#0F766E",
        background_color: "#FAFAF9",
        display: "standalone",
        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom", "zustand", "dexie", "zod"],
          radix: ["@radix-ui/react-dialog", "@radix-ui/react-tabs", "@radix-ui/react-dropdown-menu"],
          icons: ["lucide-react"],
        },
      },
    },
  },
  // @ts-expect-error vitest configuration field
  test: {
    globals: true,
    environment: "jsdom",
  },
});